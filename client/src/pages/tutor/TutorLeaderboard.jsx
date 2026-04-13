import { useState, useEffect, useMemo } from 'react';
import { getTutorClasses, getClassLeaderboard } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { Trophy, Medal, Award, Users, Clock } from 'lucide-react';

const TutorLeaderboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lbLoading, setLbLoading] = useState(false);
  const { showToast, Toast } = useToast();

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { if (selectedClass) fetchLeaderboard(); }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await getTutorClasses();
      setClasses(res.data);
      if (res.data.length > 0) setSelectedClass(res.data[0]._id);
    } catch { showToast('Failed to load classes'); }
    finally { setLoading(false); }
  };

  const fetchLeaderboard = async () => {
    setLbLoading(true);
    try {
      const res = await getClassLeaderboard(selectedClass);
      setLeaderboard(res.data);
    } catch { showToast('Failed to load leaderboard'); }
    finally { setLbLoading(false); }
  };

  const formatTime = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;

  const selectedClassName = useMemo(() => classes.find(c => c._id === selectedClass)?.title || '', [classes, selectedClass]);

  const rankStyle = (rank) => {
    if (rank === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
    if (rank === 1) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
    return 'bg-gray-100 text-gray-600';
  };

  const RankIcon = ({ rank }) => {
    if (rank === 0) return <Trophy className="h-5 w-5" />;
    if (rank === 1) return <Medal className="h-5 w-5" />;
    if (rank === 2) return <Award className="h-5 w-5" />;
    return <span className="font-bold text-sm">#{rank + 1}</span>;
  };

  if (loading) return <div><h1 className="text-2xl font-bold mb-6">Leaderboard</h1><LoadingSpinner size="lg" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-5 w-5" />
          <span>{leaderboard.length} students</span>
        </div>
      </div>

      {/* Class Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
        <select
          value={selectedClass}
          onChange={e => { setSelectedClass(e.target.value); setLeaderboard([]); }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {classes.map(cls => <option key={cls._id} value={cls._id}>{cls.title}</option>)}
        </select>
      </div>

      {lbLoading ? <LoadingSpinner size="md" /> : (
        <>
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Top Performers
              </h2>
              <div className="grid grid-cols-3 gap-4 items-end">
                {/* 2nd */}
                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg p-4 h-28 flex flex-col items-center justify-center">
                    <Medal className="h-7 w-7 text-gray-400 mb-2" />
                    <p className="font-semibold text-sm">{leaderboard[1].student.name}</p>
                    <p className="text-xs text-gray-500">{formatTime(leaderboard[1].totalTime)}</p>
                  </div>
                  <span className="mt-2 inline-block px-3 py-1 bg-gray-300 text-white text-sm rounded-full font-bold">2nd</span>
                </div>
                {/* 1st */}
                <div className="text-center">
                  <div className="bg-gradient-to-b from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-lg p-5 h-36 flex flex-col items-center justify-center">
                    <Trophy className="h-9 w-9 text-yellow-500 mb-2" />
                    <p className="font-bold">{leaderboard[0].student.name}</p>
                    <p className="text-sm text-gray-700">{formatTime(leaderboard[0].totalTime)}</p>
                  </div>
                  <span className="mt-2 inline-block px-3 py-1 bg-yellow-500 text-white text-sm rounded-full font-bold">1st</span>
                </div>
                {/* 3rd */}
                <div className="text-center">
                  <div className="bg-orange-100 rounded-lg p-4 h-24 flex flex-col items-center justify-center">
                    <Award className="h-7 w-7 text-orange-500 mb-2" />
                    <p className="font-semibold text-sm">{leaderboard[2].student.name}</p>
                    <p className="text-xs text-gray-500">{formatTime(leaderboard[2].totalTime)}</p>
                  </div>
                  <span className="mt-2 inline-block px-3 py-1 bg-orange-500 text-white text-sm rounded-full font-bold">3rd</span>
                </div>
              </div>
            </div>
          )}

          {/* Full List */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50">
              <h3 className="font-semibold">{selectedClassName} — All Rankings</h3>
            </div>
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center">
                <Trophy className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No students in this class yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.student._id} className={`flex items-center gap-4 p-4 hover:bg-gray-50 ${idx < 3 ? 'bg-yellow-50/30' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rankStyle(idx)}`}>
                      <RankIcon rank={idx} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.student.name}</p>
                      <p className="text-xs text-gray-500">{entry.sessionsCount} sessions</p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-800 font-medium">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formatTime(entry.totalTime)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Toast />
    </div>
  );
};

export default TutorLeaderboard;
