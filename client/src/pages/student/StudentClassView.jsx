import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClassById, getClassLeaderboard, submitAssignment } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { ArrowLeft, BookOpen, Megaphone, Trophy, ClipboardList, Calendar, Clock, Send } from 'lucide-react';

const StudentClassView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cls, setCls] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('announcements');
  const [submitMap, setSubmitMap] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const { showToast, Toast } = useToast();

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [clsRes, lbRes] = await Promise.all([getClassById(id), getClassLeaderboard(id)]);
      setCls(clsRes.data);
      setLeaderboard(lbRes.data);
    } catch { showToast('Failed to load class'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e, assignmentId) => {
    e.preventDefault();
    const content = submitMap[assignmentId] || '';
    if (!content.trim()) return;
    setSubmitting(assignmentId);
    try {
      await submitAssignment(id, assignmentId, { content });
      showToast('Submitted successfully!');
      setSubmitMap(prev => ({ ...prev, [assignmentId]: '' }));
      fetchData();
    } catch { showToast('Failed to submit'); }
    finally { setSubmitting(null); }
  };

  const hasSubmitted = (assignment) =>
    assignment.submissions?.some(s => s.student?._id === user?._id || s.student === user?._id);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const formatTime = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;
  const isOverdue = (d) => d && new Date(d) < new Date();

  const tabs = [
    { key: 'announcements', label: `Announcements (${cls?.announcements?.length || 0})`, icon: Megaphone },
    { key: 'assignments', label: `Assignments (${cls?.assignments?.length || 0})`, icon: ClipboardList },
    { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  if (loading) return <LoadingSpinner size="lg" />;
  if (!cls) return <p className="text-gray-500">Class not found</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/my-classes')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className="h-5 w-5" /> Back to My Classes
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h1 className="text-2xl font-bold mb-1">{cls.title}</h1>
        {cls.description && <p className="text-gray-600 mb-3">{cls.description}</p>}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Tutor: <strong>{cls.tutor?.name}</strong></span>
          <span>{cls.students?.length} students</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b overflow-x-auto">
          <nav className="flex gap-1 px-4">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`py-4 px-3 border-b-2 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${
                  tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Announcements */}
          {tab === 'announcements' && (
            cls.announcements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No announcements yet</p>
            ) : (
              <div className="space-y-4">
                {[...cls.announcements].reverse().map(a => (
                  <div key={a._id} className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Megaphone className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-800">{a.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(a.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Assignments */}
          {tab === 'assignments' && (
            cls.assignments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No assignments yet</p>
            ) : (
              <div className="space-y-4">
                {cls.assignments.map(a => {
                  const submitted = hasSubmitted(a);
                  const overdue = isOverdue(a.dueDate);
                  return (
                    <div key={a._id} className={`border rounded-lg overflow-hidden ${overdue && !submitted ? 'border-red-200' : ''}`}>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{a.title}</h4>
                          <div className="flex gap-2">
                            {submitted && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Submitted</span>}
                            {overdue && !submitted && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Overdue</span>}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{a.description}</p>
                        {a.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" /> Due: {formatDate(a.dueDate)}
                          </div>
                        )}
                      </div>
                      {!submitted && !overdue && (
                        <div className="border-t bg-gray-50 p-4">
                          <form onSubmit={e => handleSubmit(e, a._id)}>
                            <textarea
                              rows="3"
                              placeholder="Write your submission..."
                              value={submitMap[a._id] || ''}
                              onChange={e => setSubmitMap(prev => ({ ...prev, [a._id]: e.target.value }))}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                            />
                            <button type="submit" disabled={submitting === a._id}
                              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-60">
                              <Send className="h-4 w-4" />
                              {submitting === a._id ? 'Submitting...' : 'Submit'}
                            </button>
                          </form>
                        </div>
                      )}
                      {submitted && (
                        <div className="border-t bg-green-50 px-4 py-3">
                          <p className="text-sm text-green-700">✓ You have submitted this assignment</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Leaderboard */}
          {tab === 'leaderboard' && (
            leaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No rankings yet</p>
            ) : (
              <div className="divide-y">
                {leaderboard.map((entry, idx) => {
                  const isMe = entry.student._id === user?._id;
                  return (
                    <div key={entry.student._id}
                      className={`flex items-center gap-4 py-3 ${isMe ? 'bg-blue-50 -mx-2 px-2 rounded' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        idx === 0 ? 'bg-yellow-400 text-white' :
                        idx === 1 ? 'bg-gray-300 text-white' :
                        idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{entry.student.name} {isMe && <span className="text-xs text-blue-600">(you)</span>}</p>
                        <p className="text-xs text-gray-500">{entry.sessionsCount} sessions</p>
                      </div>
                      <div className="flex items-center gap-1 text-gray-700 font-semibold text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {formatTime(entry.totalTime)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      <Toast />
    </div>
  );
};

export default StudentClassView;
