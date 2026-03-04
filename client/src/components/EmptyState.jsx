import { FolderOpen, ListTodo, Clock, BookOpen } from 'lucide-react';

const EmptyState = ({ type, action }) => {
  const configs = {
    subjects: {
      icon: BookOpen,
      title: 'No subjects yet',
      message: 'Create your first subject to start organizing your studies.'
    },
    topics: {
      icon: ListTodo,
      title: 'No topics yet',
      message: 'Add topics to track what you need to study.'
    },
    sessions: {
      icon: Clock,
      title: 'No sessions yet',
      message: 'Use the timer to track your study sessions.'
    },
    default: {
      icon: FolderOpen,
      title: 'Nothing here yet',
      message: 'Get started by adding your first item.'
    }
  };

  const config = configs[type] || configs.default;
  const Icon = config.icon;

  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{config.title}</h3>
      <p className="text-gray-500 mb-4 max-w-sm mx-auto">{config.message}</p>
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
