import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTutorClasses, deleteClass } from '../../api';
import { BookOpen, Users, Trash2, Plus, Copy } from 'lucide-react';

const TutorClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await getTutorClasses();
      setClasses(res.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    
    try {
      await deleteClass(id);
      fetchClasses();
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
  };

  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Class code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Classes</h1>
        <button
          onClick={() => navigate('/tutor/classes/create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Create Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Classes Yet</h2>
          <p className="text-gray-600 mb-4">Create your first class to start teaching</p>
          <button
            onClick={() => navigate('/tutor/classes/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{cls.title}</h3>
                <button
                  onClick={() => handleDeleteClass(cls._id)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              
              {cls.description && (
                <p className="text-gray-600 mb-4 text-sm">{cls.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600">Class Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">{cls.classCode}</span>
                    <button
                      onClick={() => copyClassCode(cls.classCode)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5" />
                  <span>{cls.students?.length || 0} students</span>
                </div>

                <button
                  onClick={() => navigate(`/tutor/classes/${cls._id}`)}
                  className="w-full bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorClasses;
