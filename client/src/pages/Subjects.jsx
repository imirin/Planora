import { useEffect, useState } from 'react';
import { getSubjects, createSubject, deleteSubject, getTopics } from '../api';
import SubjectCard from '../components/SubjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import useToast from '../hooks/useToast';
import { Plus } from 'lucide-react';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [topicCounts, setTopicCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { showToast, Toast } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const [subjectsRes, topicsRes] = await Promise.all([
        getSubjects(),
        getTopics()
      ]);

      setSubjects(subjectsRes.data);

      // Count topics per subject
      const counts = {};
      topicsRes.data.forEach(topic => {
        counts[topic.subjectId] = (counts[topic.subjectId] || 0) + 1;
      });
      setTopicCounts(counts);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setCreating(true);
    try {
      await createSubject({ name: newSubjectName });
      setNewSubjectName('');
      setShowForm(false);
      fetchSubjects();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create subject');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject and all its topics?')) return;

    setDeleting(id);
    try {
      await deleteSubject(id);
      setSubjects(subjects.filter(s => s._id !== id));
      showToast('Subject deleted', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete subject');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Subjects</h1>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      {/* Create Subject Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Subject name"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={creating || !newSubjectName.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
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

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <EmptyState 
          type="subjects" 
          action={
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create First Subject
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <SubjectCard
              key={subject._id}
              subject={subject}
              topicCount={topicCounts[subject._id] || 0}
              onDelete={handleDelete}
              isDeleting={deleting === subject._id}
            />
          ))}
        </div>
      )}
      <Toast />
    </div>
  );
};

export default Subjects;
