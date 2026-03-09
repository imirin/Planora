import { useState, useEffect, useMemo } from 'react';
import { getSessions, getSubjects } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import useToast from '../hooks/useToast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Trophy, Target } from 'lucide-react';

const Analytics = () => {
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast, Toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [sessionsRes, subjectsRes] = await Promise.all([
        getSessions(),
        getSubjects()
      ]);
      setSessions(sessionsRes.data.sessions || []);
      setSubjects(subjectsRes.data);
    } catch (error) {
      showToast('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Monthly data calculation
  const monthlyData = useMemo(() => {
    const monthly = {};
    sessions.forEach(session => {
      const date = new Date(session.date);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      monthly[monthKey] = (monthly[monthKey] || 0) + session.duration;
    });
    return Object.entries(monthly).map(([month, minutes]) => ({
      month,
      minutes
    }));
  }, [sessions]);

  // Subject-wise data (mock calculation - would need topic-subject relation)
  const subjectData = useMemo(() => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return subjects.slice(0, 5).map((subject, index) => ({
      name: subject.name,
      value: Math.floor(Math.random() * 300) + 50, // Mock data
      color: colors[index % colors.length]
    }));
  }, [subjects]);

  // Statistics
  const stats = useMemo(() => {
    if (sessions.length === 0) return { longest: 0, average: 0, total: 0 };
    
    const durations = sessions.map(s => s.duration);
    const longest = Math.max(...durations);
    const average = Math.floor(durations.reduce((a, b) => a + b, 0) / durations.length);
    const total = durations.reduce((a, b) => a + b, 0);
    
    return { longest, average, total };
  }, [sessions]);

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <EmptyState type="sessions" />
        <Toast />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Longest Session</p>
              <p className="text-2xl font-bold">{formatMinutes(stats.longest)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Session</p>
              <p className="text-2xl font-bold">{formatMinutes(stats.average)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Study Time</p>
              <p className="text-2xl font-bold">{formatMinutes(stats.total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-4">Monthly Study Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} min`, 'Study Time']} />
                <Bar dataKey="minutes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-4">Study by Subject</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {subjectData.map((subject, index) => (
              <div key={index} className="flex items-center gap-1 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <span>{subject.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Toast />
    </div>
  );
};

export default Analytics;
