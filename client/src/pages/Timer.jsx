import { useEffect, useState, useMemo } from 'react';
import useTimer from '../hooks/useTimer';
import { getTopics, createSession } from '../api';
import useToast from '../hooks/useToast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

const Timer = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const { showToast, Toast } = useToast();

  const {
    formattedTime,
    isRunning,
    isCompleted,
    durationMinutes,
    start,
    pause,
    reset,
    setDuration
  } = useTimer(25);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (isCompleted && !saving && !saved) {
      saveSession();
    }
  }, [isCompleted]);

  const fetchTopics = async () => {
    try {
      const res = await getTopics();
      setTopics(res.data.filter(t => t.status !== 'Completed'));
    } catch (error) {
      showToast('Failed to load topics');
    } finally {
      setLoadingTopics(false);
    }
  };

  const saveSession = async () => {
    setSaving(true);
    try {
      await createSession({
        topicId: selectedTopic || undefined,
        duration: durationMinutes || 25
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      showToast('Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDuration = () => {
    if (customMinutes > 0 && customMinutes <= 120) {
      setDuration(customMinutes);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pomodoro Timer</h1>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Session saved successfully!</span>
        </div>
      )}

      {/* Timer Display */}
      <div className="bg-white rounded-2xl shadow-lg border p-12 mb-6 text-center">
        <div className="text-8xl font-bold text-gray-800 mb-8 font-mono">
          {formattedTime}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={start}
              className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-lg"
            >
              <Play className="h-5 w-5" />
              Start
            </button>
          ) : (
            <button
              onClick={pause}
              className="flex items-center gap-2 bg-yellow-600 text-white px-8 py-3 rounded-lg hover:bg-yellow-700 text-lg"
            >
              <Pause className="h-5 w-5" />
              Pause
            </button>
          )}
          <button
            onClick={() => reset(25)}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            <RotateCcw className="h-5 w-5" />
            Reset
          </button>
        </div>
      </div>

      {/* Custom Duration */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <label className="block text-sm font-medium mb-2">Set Duration (minutes)</label>
        <div className="flex gap-3">
          <input
            type="number"
            min="1"
            max="120"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 0)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSetDuration}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Set
          </button>
        </div>
      </div>

      {/* Topic Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <label className="block text-sm font-medium mb-2">Select Topic (optional)</label>
        {loadingTopics ? (
          <LoadingSpinner size="sm" />
        ) : (
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No specific topic</option>
            {topics.map(topic => (
              <option key={topic._id} value={topic._id}>
                {topic.title}
              </option>
            ))}
          </select>
        )}
      </div>
      <Toast />
    </div>
  );
};

export default Timer;
