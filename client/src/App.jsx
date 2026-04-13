import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import StudentLayout from './components/layout/StudentLayout';
import TutorLayout from './components/layout/TutorLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Timer from './pages/Timer';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import TutorDashboard from './pages/tutor/TutorDashboard';
import TutorClasses from './pages/tutor/TutorClasses';
import CreateClass from './pages/tutor/CreateClass';
import ClassDetail from './pages/tutor/ClassDetail';
import TutorStudents from './pages/tutor/TutorStudents';
import TutorAssignments from './pages/tutor/TutorAssignments';
import TutorLeaderboard from './pages/tutor/TutorLeaderboard';
import TutorAnnouncements from './pages/tutor/TutorAnnouncements';
import MyClasses from './pages/student/MyClasses';
import JoinClass from './pages/student/JoinClass';
import StudentClassView from './pages/student/StudentClassView';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

// Loading spinner
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const StudentRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'tutor') return <Navigate to="/tutor/dashboard" replace />;
  return children;
};

const TutorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, token } = useAuth();
  if (token && user) {
    return user.role === 'tutor'
      ? <Navigate to="/tutor/dashboard" />
      : <Navigate to="/dashboard" />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Student Routes */}
      <Route path="/" element={<StudentRoute><StudentLayout /></StudentRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="subjects/:id" element={<SubjectDetail />} />
        <Route path="timer" element={<Timer />} />
        <Route path="profile" element={<Profile />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<Settings />} />
        <Route path="my-classes" element={<MyClasses />} />
        <Route path="join-class" element={<JoinClass />} />
        <Route path="class/:id" element={<StudentClassView />} />
      </Route>

      {/* Tutor Routes */}
      <Route path="/tutor" element={<TutorRoute><TutorLayout /></TutorRoute>}>
        <Route index element={<TutorDashboard />} />
        <Route path="dashboard" element={<TutorDashboard />} />
        <Route path="classes" element={<TutorClasses />} />
        <Route path="classes/create" element={<CreateClass />} />
        <Route path="classes/:id" element={<ClassDetail />} />
        <Route path="students" element={<TutorStudents />} />
        <Route path="assignments" element={<TutorAssignments />} />
        <Route path="leaderboard" element={<TutorLeaderboard />} />
        <Route path="announcements" element={<TutorAnnouncements />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
