import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, LayoutDashboard, LogOut, Folder, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link 
        to="/" 
        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 py-2 md:py-0"
        onClick={() => setMobileMenuOpen(false)}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      <Link 
        to="/subjects" 
        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 py-2 md:py-0"
        onClick={() => setMobileMenuOpen(false)}
      >
        <Folder className="h-4 w-4" />
        <span>Subjects</span>
      </Link>
      <Link 
        to="/timer" 
        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 py-2 md:py-0"
        onClick={() => setMobileMenuOpen(false)}
      >
        <Clock className="h-4 w-4" />
        <span>Timer</span>
      </Link>
    </>
  );

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">Planora</span>
            </Link>
          </div>

          {user && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <NavLinks />
                <div className="flex items-center gap-3 ml-4 border-l pl-4">
                  <span className="text-sm text-gray-600 hidden lg:inline">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-2">
              <NavLinks />
              <div className="pt-2 border-t mt-2">
                <span className="text-sm text-gray-600 block py-2">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 py-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
