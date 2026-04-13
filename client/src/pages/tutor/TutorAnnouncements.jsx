import { useState, useEffect } from 'react';
import { getTutorClasses, getClassAnnouncements, addClassAnnouncement, deleteClassAnnouncement } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { Megaphone, Plus, Trash2 } from 'lucide-react';

const TutorAnnouncements = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const { showToast, Toast } = useToast();

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { if (selectedClass) fetchAnnouncements(); }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await getTutorClasses();
      setClasses(res.data);
      if (res.data.length > 0) setSelectedClass(res.data[0]._id);
    } catch { showToast('Failed to load classes'); }
    finally { setLoading(false); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await getClassAnnouncements(selectedClass);
      setAnnouncements(res.data);
    } catch { showToast('Failed to load announcements'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await addClassAnnouncement(selectedClass, { message });
      showToast('Announcement posted!');
      setShowModal(false);
      setMessage('');
      fetchAnnouncements();
    } catch { showToast('Failed to post announcement'); }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteClassAnnouncement(selectedClass, announcementId);
      showToast('Deleted');
      fetchAnnouncements();
    } catch { showToast('Failed to delete'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div><h1 className="text-2xl font-bold mb-6">Announcements</h1><LoadingSpinner size="lg" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" /> New Announcement
        </button>
      </div>

      {/* Class Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
        <select
          value={selectedClass}
          onChange={e => { setSelectedClass(e.target.value); setAnnouncements([]); }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {classes.map(cls => (
            <option key={cls._id} value={cls._id}>{cls.title} ({cls.students?.length || 0} students)</option>
          ))}
        </select>
      </div>

      {/* Announcements */}
      {announcements.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a._id} className="bg-white p-5 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                    <Megaphone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 whitespace-pre-wrap">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(a.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded shrink-0"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">New Announcement</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <textarea
                required rows="5" value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your announcement..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast />
    </div>
  );
};

export default TutorAnnouncements;
