import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getClassById, getClassLeaderboard, addAssignment,
  deleteClassAssignment, addClassAnnouncement, deleteClassAnnouncement
} from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { ArrowLeft, Copy, Users, Trophy, ClipboardList, Megaphone, Plus, Trash2, Calendar } from 'lucide-react';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('students');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ title: '', description: '', dueDate: '' });
  const [annMessage, setAnnMessage] = useState('');
  const { showToast, Toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [clsRes, lbRes] = await Promise.all([
        getClassById(id),
        getClassLeaderboard(id)
      ]);
      setCls(clsRes.data);
      setLeaderboard(lbRes.data);
    } catch (error) {
      showToast('Failed to load class');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(cls.classCode);
    showToast('Class code copied!');
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      await addAssignment(id, assignForm);
      showToast('Assignment added!');
      setShowAssignmentModal(false);
      setAssignForm({ title: '', description: '', dueDate: '' });
      fetchData();
    } catch { showToast('Failed to add assignment'); }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await deleteClassAssignment(id, assignmentId);
      showToast('Deleted');
      fetchData();
    } catch { showToast('Failed to delete'); }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await addClassAnnouncement(id, { message: annMessage });
      showToast('Announcement posted!');
      setShowAnnouncementModal(false);
      setAnnMessage('');
      fetchData();
    } catch { showToast('Failed to post'); }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteClassAnnouncement(id, annId);
      showToast('Deleted');
      fetchData();
    } catch { showToast('Failed to delete'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date';
  const formatTime = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;

  const tabs = [
    { key: 'students', label: `Students (${cls?.students?.length || 0})`, icon: Users },
    { key: 'assignments', label: `Assignments (${cls?.assignments?.length || 0})`, icon: ClipboardList },
    { key: 'announcements', label: `Announcements (${cls?.announcements?.length || 0})`, icon: Megaphone },
    { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  if (loading) return <LoadingSpinner size="lg" />;
  if (!cls) return <p className="text-gray-500">Class not found</p>;

  return (
    <div>
      <button onClick={() => navigate('/tutor/classes')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className="h-5 w-5" /> Back to Classes
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{cls.title}</h1>
            {cls.description && <p className="text-gray-600 mb-3">{cls.description}</p>}
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg inline-flex w-fit">
              <span className="text-sm text-gray-600">Code:</span>
              <span className="font-mono font-bold text-blue-600 text-lg">{cls.classCode}</span>
              <button onClick={copyCode} className="text-gray-400 hover:text-gray-700 ml-1">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAssignmentModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              <Plus className="h-4 w-4" /> Assignment
            </button>
            <button onClick={() => setShowAnnouncementModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
              <Plus className="h-4 w-4" /> Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b overflow-x-auto">
          <nav className="flex gap-1 px-4">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`py-4 px-3 border-b-2 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Students Tab */}
          {tab === 'students' && (
            cls.students.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No students yet. Share the class code!</p>
            ) : (
              <div className="space-y-2">
                {cls.students.map(s => (
                  <div key={s._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Assignments Tab */}
          {tab === 'assignments' && (
            cls.assignments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No assignments yet</p>
            ) : (
              <div className="space-y-3">
                {cls.assignments.map(a => (
                  <div key={a._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{a.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due: {formatDate(a.dueDate)}</span>
                          <span>{a.submissions?.length || 0} submissions</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteAssignment(a._id)} className="text-red-500 hover:bg-red-50 p-2 rounded ml-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Announcements Tab */}
          {tab === 'announcements' && (
            cls.announcements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No announcements yet</p>
            ) : (
              <div className="space-y-3">
                {[...cls.announcements].reverse().map(a => (
                  <div key={a._id} className="p-4 border rounded-lg flex justify-between items-start gap-4">
                    <div>
                      <p className="text-gray-800">{a.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(a.createdAt)}</p>
                    </div>
                    <button onClick={() => handleDeleteAnnouncement(a._id)} className="text-red-500 hover:bg-red-50 p-2 rounded shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Leaderboard Tab */}
          {tab === 'leaderboard' && (
            leaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No students to rank yet</p>
            ) : (
              <div className="divide-y">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.student._id} className="flex items-center gap-4 py-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? 'bg-yellow-400 text-white' :
                      idx === 1 ? 'bg-gray-300 text-white' :
                      idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{entry.student.name}</p>
                      <p className="text-xs text-gray-500">{entry.sessionsCount} sessions</p>
                    </div>
                    <span className="font-semibold text-gray-700">{formatTime(entry.totalTime)}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Assignment</h2>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <input type="text" required placeholder="Title" value={assignForm.title}
                onChange={e => setAssignForm({ ...assignForm, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea required rows="3" placeholder="Description" value={assignForm.description}
                onChange={e => setAssignForm({ ...assignForm, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="date" value={assignForm.dueDate}
                onChange={e => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAssignmentModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Post Announcement</h2>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <textarea required rows="4" placeholder="Write your announcement..." value={annMessage}
                onChange={e => setAnnMessage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAnnouncementModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast />
    </div>
  );
};

export default ClassDetail;
