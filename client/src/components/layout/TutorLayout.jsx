import { useState }from'react';
import { Outlet, useNavigate, useLocation }from'react-router-dom';
import { useAuth }from'../../context/AuthContext';
import Navbar from'../Navbar';
import Sidebar from'../Sidebar';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardList, 
  Trophy, 
  Megaphone,
  User,
  Settings,
  LogOut
} from'lucide-react';

const TutorLayout = () => {
 const [sidebarOpen, setSidebarOpen] = useState(false);
const { user, logout } = useAuth();
const navigate = useNavigate();
const location = useLocation();

const toggleSidebar = () => {
   setSidebarOpen(!sidebarOpen);
 };

const handleLogout = () => {
   logout();
   navigate('/login');
 };

const navItems = [
   { path: '/tutor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
   { path: '/tutor/classes', icon: BookOpen, label: 'Classes' },
   { path: '/tutor/students', icon: Users, label: 'Students' },
   { path: '/tutor/assignments', icon: ClipboardList, label: 'Assignments' },
   { path: '/tutor/leaderboard', icon: Trophy, label: 'Leaderboard' },
   { path: '/tutor/announcements', icon: Megaphone, label: 'Announcements' },
 ];

const bottomNavItems = [
   { path: '/tutor/profile', icon: User, label: 'Profile' },
   { path: '/tutor/settings', icon: Settings, label: 'Settings' },
 ];

 // Check if route is active
 const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

 return (
   <div className="min-h-screen bg-gray-50 flex">
     {/* Sidebar */}
     <aside
       className={`
         fixed top-0 left-0 h-full bg-white shadow-lg z-50
         transform transition-transform duration-300 ease-in-out
         w-64
         flex flex-col
         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
         md:static md:shadow-md md:translate-x-0
       `}
     >
       {/* Header */}
       <div className="flex items-center justify-between p-4 border-b">
         <span className="font-bold text-xl text-blue-600">Planora</span>
         <button
           onClick={() => setSidebarOpen(false)}
           className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
         >
           <Users className="h-5 w-5" />
         </button>
       </div>

       {/* Navigation Items */}
       <nav className="flex flex-col flex-1 overflow-y-auto p-4 space-y-1">
         {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
           
          return (
             <button
               key={item.path}
               onClick={() => navigate(item.path)}
               className={`
                 flex items-center gap-3 px-3 py-3 rounded-lg
                 transition-colors cursor-pointer
                 ${active 
                   ? 'bg-blue-50 text-blue-600 font-medium' 
                   : 'text-gray-700 hover:bg-gray-100'
                 }
               `}
             >
               <Icon className="h-5 w-5" />
               <span>{item.label}</span>
             </button>
           );
         })}

         {/* Bottom Navigation */}
         <div className="mt-auto pt-4 border-t space-y-1">
           {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
             
            return (
               <button
                 key={item.path}
                 onClick={() => navigate(item.path)}
                 className={`
                   flex items-center gap-3 px-3 py-3 rounded-lg
                   transition-colors cursor-pointer w-full
                   ${active 
                     ? 'bg-blue-50 text-blue-600 font-medium' 
                     : 'text-gray-700 hover:bg-gray-100'
                   }
                 `}
               >
                 <Icon className="h-5 w-5" />
                 <span>{item.label}</span>
               </button>
             );
           })}

           {/* Logout */}
           <button
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4"
           >
             <LogOut className="h-5 w-5" />
             <span>Logout</span>
           </button>
         </div>
       </nav>
     </aside>

     {/* Main Content Area */}
     <div className={`
       flex-1 flex flex-col transition-all duration-300 ease-in-out
       ${sidebarOpen ? 'ml-64' : 'ml-0'}
     `}>
       <Navbar onMenuClick={toggleSidebar} />
       <main className="flex-1 px-4 py-6 w-full">
         <div className="max-w-7xl mx-auto w-full">
           <Outlet />
         </div>
       </main>
     </div>
   </div>
 );
};

export default TutorLayout;
