import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
 const [sidebarOpen, setSidebarOpen] = useState(false);

const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

 return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'ml-64' : 'ml-0'}
      `}>
        <Navbar onMenuClick={toggleSidebar} />
        <main className="flex-1 px-4 py-6 w-full">
          <div className={`${sidebarOpen ? 'max-w-7xl' : 'max-w-7xl mx-auto'} w-full`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
