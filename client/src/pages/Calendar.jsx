import { useState, useEffect, useMemo } from 'react';
import { getSessions } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import useToast from '../hooks/useToast';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const Calendar = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const { showToast, Toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      setSessions(res.data.sessions || []);
    } catch (error) {
      showToast('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped = {};
    sessions.forEach(session => {
      const dateStr = new Date(session.date).toISOString().split('T')[0];
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(session);
    });
    return grouped;
  }, [sessions]);

  // Calculate minutes per day
  const minutesByDate = useMemo(() => {
    const minutes = {};
    Object.entries(sessionsByDate).forEach(([date, daySessions]) => {
      minutes[date] = daySessions.reduce((sum, s) => sum + s.duration, 0);
    });
    return minutes;
  }, [sessionsByDate]);

  // Calendar generation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || days.length % 7 !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  const getDayColor = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const minutes = minutesByDate[dateStr] || 0;
    if (minutes === 0) return '';
    if (minutes < 30) return 'bg-green-100';
    if (minutes < 90) return 'bg-green-300';
    return 'bg-green-500';
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
    setSelectedDate(null);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Calendar</h1>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const hasSessions = !!minutesByDate[dateStr];
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  aspect-square p-2 rounded-lg text-sm relative
                  ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${getDayColor(date)}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${hasSessions ? 'font-semibold' : ''}
                  hover:ring-2 hover:ring-blue-300
                `}
              >
                {date.getDate()}
                {hasSessions && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Sessions */}
      {selectedDate && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold mb-4">
            Sessions for {new Date(selectedDate).toLocaleDateString()}
          </h3>
          {sessionsByDate[selectedDate]?.length > 0 ? (
            <div className="space-y-3">
              {sessionsByDate[selectedDate].map((session, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {formatMinutes(session.duration)}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold">{formatMinutes(minutesByDate[selectedDate])}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No sessions on this day</p>
          )}
        </div>
      )}

      <Toast />
    </div>
  );
};

export default Calendar;
