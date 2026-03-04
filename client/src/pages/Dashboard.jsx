import { useEffect, useState, useMemo } from 'react';
import { getSubjects, getTopics, getTodaySessions, getWeeklySessions, getStreak, getActivity } from '../api';
import { BookOpen, CheckCircle, Clock, ListTodo, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StreakCard from '../components/StreakCard';
import ActivityHeatmap from '../components/ActivityHeatmap';
import LoadingSpinner from '../components/LoadingSpinner';
import useToast from '../hooks/useToast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalTopics: 0,
    completedTopics: 0,
    todayMinutes: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast, Toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [subjectsRes, topicsRes, todayRes, weeklyRes, streakRes, activityRes] = await Promise.all([
        getSubjects(),
        getTopics(),
        getTodaySessions(),
        getWeeklySessions(),
        getStreak(),
        getActivity()
      ]);

      const subjects = subjectsRes.data;
      const topics = topicsRes.data;
      const completed = topics.filter(t => t.status === 'Completed');

      setStats({
        totalSubjects: subjects.length,
        totalTopics: topics.length,
        completedTopics: completed.length,
        todayMinutes: todayRes.data.totalMinutes
      });

      // Format weekly data with day names
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const formattedWeekly = weeklyRes.data.weeklyData.map(item => {
        const date = new Date(item.date);
        return {
          day: dayNames[date.getDay()],
          minutes: item.minutes,
          fullDate: item.date
        };
      });
      setWeeklyData(formattedWeekly);

      // Get recent sessions (last 3)
      setRecentSessions(todayRes.data.sessions.slice(-3).reverse());

      // Set streak data
      setStreak(streakRes.data);

      // Set activity data
      setActivityData(activityRes.data);
    } catch (error) {
      showToast('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Memoize chart data to prevent unnecessary re-renders
  const memoizedWeeklyData = useMemo(() => weeklyData, [weeklyData]);
  const memoizedActivityData = useMemo(() => activityData, [activityData]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Subjects */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Subjects</p>
              <p className="text-2xl font-bold">{stats.totalSubjects}</p>
            </div>
          </div>
        </div>

        {/* Total Topics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ListTodo className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Topics</p>
              <p className="text-2xl font-bold">{stats.totalTopics}</p>
            </div>
          </div>
        </div>

        {/* Completed Topics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{stats.completedTopics}</p>
            </div>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Focus</p>
              <p className="text-2xl font-bold">{formatMinutes(stats.todayMinutes)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Weekly Study Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} min`, 'Study Time']} />
                <Bar dataKey="minutes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Today's Sessions</h2>
          {recentSessions.length === 0 ? (
            <p className="text-gray-500 text-sm">No sessions today</p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div key={session._id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{formatTime(session.date)}</p>
                    <p className="text-xs text-gray-500">{formatMinutes(session.duration)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Streak and Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <StreakCard 
          currentStreak={streak.currentStreak} 
          longestStreak={streak.longestStreak} 
        />
        <div className="lg:col-span-2">
          <ActivityHeatmap data={memoizedActivityData} />
        </div>
      </div>
      <Toast />
    </div>
  );
};

export default Dashboard;
