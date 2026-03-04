import { useState } from 'react';

const ActivityHeatmap = ({ data }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  const getColorClass = (minutes) => {
    if (minutes === 0) return 'bg-gray-100';
    if (minutes <= 30) return 'bg-green-200';
    if (minutes <= 90) return 'bg-green-400';
    return 'bg-green-600';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Last 30 Days</h3>
      
      {/* Heatmap Grid */}
      <div className="grid grid-cols-10 gap-1 mb-4">
        {data.map((day, index) => (
          <div
            key={day.date}
            className={`aspect-square rounded-sm ${getColorClass(day.minutes)} cursor-pointer transition-all hover:ring-2 hover:ring-blue-400`}
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
          />
        ))}
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div className="bg-gray-800 text-white text-sm p-2 rounded-lg inline-block">
          <p className="font-medium">{formatDate(hoveredDay.date)}</p>
          <p>{hoveredDay.minutes === 0 ? 'No study' : formatMinutes(hoveredDay.minutes)}</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600 mt-4">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded-sm" />
          <div className="w-4 h-4 bg-green-200 rounded-sm" />
          <div className="w-4 h-4 bg-green-400 rounded-sm" />
          <div className="w-4 h-4 bg-green-600 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
