import { useState, useEffect } from 'react';
import { getTutorClasses, getClassAssignments, addAssignment, deleteClassAssignment, getAssignmentSubmissions } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { ClipboardList, Plus, Trash2, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const TutorAssignments = () => {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [submissionsMap, setSubmissionsMap] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const { showToast, Toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchAssignments();
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await getTutorClasses();
      setClasses(res.data);
      if (res.data.length > 0) setSelectedClass(res.data[0]._id);
    } catch {
      showToast('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await getClassAssignments(selectedClass);
      setAssignments(res.data);
    } catch {
      showToast('Failed to load assignments');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await addAssignment(selectedClass, form);
      showToast('Assignment created!');
      setShowModal(false);
      setForm({ title: '', description: '', dueDate: '' });
      fetchAssignments();
    } catch {
      showToast('Failed to create assignment');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await deleteClassAssignment(selectedClass, assignmentId);
      showToast('Deleted');
      fetchAssignments();
    } catch {
      showToast('Failed to delete');
    }
  };

  const toggleSubmissions = async (assignmentId) => {
    if (expandedId === assignmentId) { setExpandedId(null); return; }
    setExpandedId(assignmentId);
    if (!submissionsMap[assignmentId]) {
      try {
        const res = await getAssignmentSubmissions(selectedClass, assignmentId);
        setSubmissionsMap(prev => ({ ...prev, [assignmentId]: res.data }));
      } catch {
        showToast('Failed to load submissions');
      }
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date';
  const isOverdue = (d) => d && new Date(d) < new Date();

  if (loading) return <div><h1 className="text-2xl font-bold mb-6">Assignments</h1><LoadingSpinner size="lg" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" /> Create Assignment
        </button>
      </div>

      {/* Class Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
        <select
          value={selectedClass}
          onChange={(e) => { setSelectedClass(e.target.value); setAssignments([]); }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {classes.map(cls => (
            <option key={cls._id} value={cls._id}>{cls.title} ({cls.students?.length || 0} students)</option>
          ))}
        </select>
      </div>

      {/* Assignments */}
      {assignments.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No assignments yet for this class</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a._id} className={`bg-white rounded-lg shadow-sm border ${isOverdue(a.dueDate) ? 'border-red-300' : ''}`}>
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{a.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{a.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {formatDate(a.dueDate)}
                      </div>
                      <span>{a.submissions?.length || 0} submissions</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {isOverdue(a.dueDate) && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Overdue</span>
                    )}
                    <button
                      onClick={() => toggleSubmissions(a._id)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                      title="View submissions"
                    >
                      {expandedId === a._id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Submissions Panel */}
              {expandedId === a._id && (
                <div className="border-t bg-gray-50 p-4">
                  <h4 className="font-medium mb-3">Submissions</h4>
                  {!submissionsMap[a._id] ? (
                    <p className="text-gray-400 text-sm">Loading...</p>
                  ) : submissionsMap[a._id].length === 0 ? (
                    <p className="text-gray-500 text-sm">No submissions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {submissionsMap[a._id].map((sub, i) => (
                        <div key={i} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-sm">{sub.student?.name || 'Unknown'}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{sub.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create Assignment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required rows="3" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date" value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast />
    </div>
  );
};

export default TutorAssignments;
