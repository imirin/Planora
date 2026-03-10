import { useState, useEffect }from'react';
import { getClasses, joinClass }from'../api';
import LoadingSpinner from'../components/LoadingSpinner';
import EmptyState from'../components/EmptyState';
import useToast from'../hooks/useToast';
import { BookOpen, Users, Calendar }from'lucide-react';

const MyClasses = () => {
 const [classes, setClasses] = useState([]);
const [loading, setLoading] = useState(true);
const [showJoinModal, setShowJoinModal] = useState(false);
const [joinCode, setJoinCode] = useState('');
const { showToast, Toast } = useToast();

useEffect(() => {
 fetchClasses();
 }, []);

const fetchClasses = async () => {
 try {
 const res = await getClasses();
 setClasses(res.data);
 } catch (error) {
 showToast('Failed to load classes');
 } finally {
 setLoading(false);
 }
};

const handleJoinClass = async (e) => {
 e.preventDefault();
 try {
 await joinClass({ joinCode });
 showToast('Successfully joined class!', 'success');
 setShowJoinModal(false);
 setJoinCode('');
 fetchClasses();
 } catch (error) {
 showToast(error.response?.data?.message || 'Failed to join class');
 }
};

if (loading) {
 return (
<div>
<h1 className="text-2xl font-bold mb-6">My Classes</h1>
<LoadingSpinner size="lg" />
</div>
 );
}

return (
<div>
<h1 className="text-2xl font-bold mb-6">My Classes</h1>

{/* Join Class Button */}
<div className="mb-6">
<button
 onClick={() => setShowJoinModal(true)}
 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
 Join Class
</button>
</div>

{/* Classes Grid */}
{classes.length === 0 ? (
<EmptyState type="subjects" />
) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{classes.map((cls) => (
<div key={cls._id} className="bg-white p-6 rounded-lg shadow-sm border">
<div className="flex items-start justify-between mb-4">
<div className="p-3 bg-blue-100 rounded-lg">
<BookOpen className="h-6 w-6 text-blue-600" />
</div>
<span className="text-xs bg-gray-100 px-2 py-1 rounded">{cls.joinCode}</span>
</div>
<h3 className="font-semibold text-lg mb-2">{cls.className}</h3>
<p className="text-sm text-gray-600 mb-4">{cls.subject}</p>
<div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
<Users className="h-4 w-4" />
<span>{cls.students.length} students</span>
</div>
<div className="flex items-center gap-2 text-sm text-gray-500">
<Calendar className="h-4 w-4" />
<span>Joined {new Date(cls.createdAt).toLocaleDateString()}</span>
</div>
</div>
))}
</div>
)}

{/* Join Modal */}
{showJoinModal && (
<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
<div className="bg-white p-6 rounded-lg max-w-md mx-4">
<h2 className="text-xl font-bold mb-4">Join a Class</h2>
<form onSubmit={handleJoinClass}>
<div className="mb-4">
<label className="block text-sm font-medium mb-2">Enter Join Code</label>
<input
 type="text"
 value={joinCode}
 onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
 placeholder="ABC123"
 className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
 maxLength={6}
 required
/>
</div>
<div className="flex gap-3">
<button
 type="submit"
 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
 Join
</button>
<button
 type="button"
 onClick={() => {
      setShowJoinModal(false);
      setJoinCode('');
    }}
 className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
>
 Cancel
</button>
</div>
</form>
</div>
</div>
)}

<Toast />
</div>
 );
};

export default MyClasses;
