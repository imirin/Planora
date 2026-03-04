import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubjectWithTopics, createTopic, updateTopic, deleteTopic } from '../api';
import TopicCard from '../components/TopicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import useToast from '../hooks/useToast';
import { ArrowLeft, Plus } from 'lucide-react';

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { showToast, Toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    priority: 'Medium',
    deadline: '',
    estimatedTime: '',
    notes: ''
  });

  useEffect(() => {
    fetchSubjectData();
  }, [id]);

  const fetchSubjectData = async () => {
    try {
      const res = await getSubjectWithTopics(id);
      setSubject(res.data.subject);
      setTopics(res.data.topics);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load subject');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setCreating(true);
    try {
      await createTopic({
        subjectId: id,
        title: formData.title,
        priority: formData.priority,
        deadline: formData.deadline || undefined,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : 0,
        notes: formData.notes
      });
      setFormData({ title: '', priority: 'Medium', deadline: '', estimatedTime: '', notes: '' });
      setShowForm(false);
      fetchSubjectData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create topic');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (topicId, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Not Started' : 'Completed';
    setToggling(topicId);
    try {
      await updateTopic(topicId, { status: newStatus });
      setTopics(topics.map(t => t._id === topicId ? { ...t, status: newStatus } : t));
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update topic');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (topicId) => {
    if (!confirm('Delete this topic?')) return;

    setDeleting(topicId);
    try {
      await deleteTopic(topicId);
      setTopics(topics.filter(t => t._id !== topicId));
      showToast('Topic deleted', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete topic');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div>
        <button onClick={() => navigate('/subjects')} className="flex items-center gap-1 text-gray-600 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div>
        <button onClick={() => navigate('/subjects')} className="flex items-center gap-1 text-gray-600 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <p>Subject not found</p>
      </div>
    );
  }

  const completedCount = topics.filter(t => t.status === 'Completed').length;
  const progressPercent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <button onClick={() => navigate('/subjects')} className="flex items-center gap-1 text-gray-600 hover:text-gray-800 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Subjects
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{subject.name}</h1>
          <p className="text-gray-600 mt-1">
            {completedCount} of {topics.length} topics completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Topic
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span className="font-semibold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Add Topic Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <h3 className="font-semibold mb-4">New Topic</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Time (minutes)</label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 60"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating || !formData.title.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Topic'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Topics List */}
      {topics.length === 0 ? (
        <EmptyState 
          type="topics"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add First Topic
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {topics.map(topic => (
            <TopicCard
              key={topic._id}
              topic={topic}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              formatDate={formatDate}
              isToggling={toggling === topic._id}
              isDeleting={deleting === topic._id}
            />
          ))}
        </div>
      )}
      <Toast />
    </div>
  );
};

export default SubjectDetail;
