import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Menu, User, LogOut } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            {/* Menu Toggle Button */}
            <button
              onClick={onMenuClick}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Logo */}
            <Link to="/" className="hidden md:flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">Planora</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
