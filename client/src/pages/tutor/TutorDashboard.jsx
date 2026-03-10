import { useState, useEffect } from'react';
import { getTutorClasses, getSessions } from'../../api';
import LoadingSpinner from'../../components/LoadingSpinner';
import useToast from'../../hooks/useToast';
import { Users, BookOpen, ClipboardList, Clock } from'lucide-react';

const TutorDashboard = () => {
 const [stats, setStats] = useState({
  totalClasses: 0,
  totalStudents: 0,
  activeAssignments: 0,
  totalStudyTime: 0
 });
const [recentActivity, setRecentActivity] = useState([]);
const [loading, setLoading] = useState(true);
const { showToast, Toast } = useToast();

useEffect(() => {
 fetchTutorStats();
 }, []);

const fetchTutorStats = async () => {
 try {
 const [classesRes] = await Promise.all([getTutorClasses()]);
 
 const classes = classesRes.data;
const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
 
 setStats({
 totalClasses: classes.length,
 totalStudents,
 activeAssignments: 0, // Would need to calculate from assignments
 totalStudyTime: 0
 });
 
 setRecentActivity(classes.slice(0, 5));
 } catch (error) {
 showToast('Failed to load tutor statistics');
 } finally {
 setLoading(false);
 }
};

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
<p className="text-2xl font-bold">0h 0m</p>
</div>
</div>
</div>
</div>

{/* Recent Activity */}
<div className="bg-white p-6 rounded-lg shadow-sm border">
<h2 className="text-lg font-semibold mb-4">Recent Classes</h2>
{recentActivity.length === 0 ? (
<p className="text-gray-500">No classes yet</p>
) : (
<div className="space-y-3">
{recentActivity.map((cls, index) => (
<div key={cls._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
<div>
<p className="font-medium">{cls.className}</p>
<p className="text-sm text-gray-600">{cls.subject}</p>
</div>
<span className="text-sm text-gray-500">{cls.students.length} students</span>
</div>
))}
</div>
)}
</div>

<Toast />
</div>
 );
};

export default TutorDashboard;
