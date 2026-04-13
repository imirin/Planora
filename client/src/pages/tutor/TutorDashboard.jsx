import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTutorClasses, getTutorStats } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { Users, BookOpen, ClipboardList, Clock, Trophy, TrendingUp } from 'lucide-react';

const TutorDashboard = () => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    activeAssignments: 0,
    totalStudyTime: 0,
    recentActivity: [],
    topPerformer: null
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast, Toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, classesRes] = await Promise.all([
        getTutorStats(),
        getTutorClasses()
      ]);
      setStats(statsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      showToast('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const formattedStudyTime = useMemo(() => formatTime(stats.totalStudyTime || 0), [stats.totalStudyTime]);

  const recentClasses = useMemo(() => classes.slice(0, 5), [classes]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Tutor Dashboard</h1>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tutor Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold">{stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Assignments</p>
              <p className="text-2xl font-bold">{stats.activeAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Study Time</p>
              <p className="text-2xl font-bold">{formattedStudyTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performer Banner */}
      {stats.topPerformer && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-5 rounded-lg mb-6 flex items-center gap-4">
          <div className="p-3 bg-yellow-400 rounded-full">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-yellow-800">Top Performer</p>
            <p className="text-xl font-bold text-yellow-900">{stats.topPerformer.name}</p>
            <p className="text-sm text-yellow-700">{formatTime(stats.topPerformer.totalTime)} total study time</p>
          </div>
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Recent Activity
          </h2>
          {stats.recentActivity?.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity?.slice(0, 6).map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{activity.studentName}</p>
                    <p className="text-xs text-gray-500">joined {activity.className}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(activity.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Classes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Recent Classes</h2>
          {recentClasses.length === 0 ? (
            <p className="text-gray-500 text-sm">No classes yet</p>
          ) : (
            <div className="space-y-3">
              {recentClasses.map((cls) => (
                <div
                  key={cls._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate(`/tutor/classes/${cls._id}`)}
                >
                  <div>
                    <p className="font-medium text-sm">{cls.title}</p>
                    <p className="text-xs text-gray-500">
                      {cls.assignments?.length || 0} assignments · {cls.announcements?.length || 0} announcements
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">{cls.students?.length || 0} students</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Toast />
    </div>
  );
};

export default TutorDashboard;
