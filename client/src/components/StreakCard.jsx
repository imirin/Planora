import { Flame, Trophy } from 'lucide-react';

const StreakCard = ({ currentStreak, longestStreak }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Study Streak</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-xs text-gray-400">days</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-yellow-600">{longestStreak}</p>
          <p className="text-sm text-gray-600">Longest Streak</p>
          <p className="text-xs text-gray-400">days</p>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
