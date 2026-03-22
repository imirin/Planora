import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinClass } from '../../api';
import { ArrowLeft } from 'lucide-react';

const JoinClass = () => {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await joinClass({ classCode: classCode.toUpperCase() });
      navigate('/my-classes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/my-classes')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to My Classes
      </button>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Join a Class</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Code
            </label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              placeholder="ABC1234"
              maxLength="7"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter the 7-character code provided by your tutor
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Class'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-classes')}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Where to find the code?</h3>
          <p className="text-sm text-blue-700">
            Your tutor will share the class code with you. It's a 7-character code like "ABC1234".
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinClass;
