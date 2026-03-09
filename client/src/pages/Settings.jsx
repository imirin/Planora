import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import { Clock, Moon, Sun, Trash2, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const [pomodoroDuration, setPomodoroDuration] = useState(25);
  const [darkMode, setDarkMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { showToast, Toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage
    const savedDuration = localStorage.getItem('pomodoroDuration');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedDuration) setPomodoroDuration(parseInt(savedDuration));
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
  }, []);

  const savePomodoroDuration = () => {
    localStorage.setItem('pomodoroDuration', pomodoroDuration.toString());
    showToast('Pomodoro duration saved', 'success');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    showToast(newMode ? 'Dark mode enabled' : 'Light mode enabled', 'success');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Please type DELETE to confirm');
      return;
    }
    // Placeholder for API call
    showToast('Account deleted', 'success');
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Pomodoro Duration */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold">Pomodoro Duration</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Set your default focus session duration in minutes.
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            min="1"
            max="120"
            value={pomodoroDuration}
            onChange={(e) => setPomodoroDuration(parseInt(e.target.value) || 25)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={savePomodoroDuration}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="h-5 w-5 text-gray-600" />
            ) : (
              <Sun className="h-5 w-5 text-gray-600" />
            )}
            <div>
              <h3 className="font-semibold">Theme</h3>
              <p className="text-sm text-gray-600">
                {darkMode ? 'Dark mode is enabled' : 'Light mode is enabled'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${darkMode ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-600">Delete Account</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
          >
            Delete Account
          </button>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 mb-3">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">This action cannot be undone</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Type <strong>DELETE</strong> to confirm account deletion.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Permanently Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <Toast />
    </div>
  );
};

export default Settings;
