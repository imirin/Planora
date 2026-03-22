import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentClasses } from '../../api';
import { BookOpen, Users } from 'lucide-react';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await getStudentClasses();
      setClasses(res.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
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
          onClick={() => navigate('/join-class')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <BookOpen className="h-5 w-5" />
          Join Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Classes Yet</h2>
          <p className="text-gray-600 mb-4">Join a class using the class code provided by your tutor</p>
          <button
            onClick={() => navigate('/join-class')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Join Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{cls.title}</h3>
              
              {cls.description && (
                <p className="text-gray-600 mb-4 text-sm">{cls.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span className="font-medium">Tutor:</span>
                  <span>{cls.tutor?.name || 'Unknown'}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5" />
                  <span>{cls.students?.length || 0} students</span>
                </div>

                <button
                  onClick={() => navigate(`/class/${cls._id}`)}
                  className="w-full bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition-colors"
                >
                  View Class
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClasses;
