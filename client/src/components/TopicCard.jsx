import { CheckCircle, Circle, Trash2, Calendar, Clock } from 'lucide-react';

const TopicCard = ({ topic, onToggleStatus, onDelete, formatDate, isToggling, isDeleting }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isCompleted = topic.status === 'Completed';

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border ${isCompleted ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`font-semibold text-lg ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {topic.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(topic.priority)}`}>
              {topic.priority}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {topic.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(topic.deadline)}</span>
              </div>
            )}
            {topic.estimatedTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{topic.estimatedTime} min</span>
              </div>
            )}
          </div>

          {topic.notes && (
            <p className="text-sm text-gray-600 mt-2">{topic.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onToggleStatus(topic._id, topic.status)}
            disabled={isToggling}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              isCompleted
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}
            title={isCompleted ? 'Mark as not completed' : 'Mark as completed'}
          >
            {isToggling ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
            ) : isCompleted ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => onDelete(topic._id)}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
            title="Delete topic"
          >
            {isDeleting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-600" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
