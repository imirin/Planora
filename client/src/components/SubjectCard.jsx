import { useNavigate } from 'react-router-dom';
import { Trash2, Folder } from 'lucide-react';

const SubjectCard = ({ subject, topicCount, onDelete, isDeleting }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/subjects/${subject._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(subject._id);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: subject.colorTag + '20' }}
          >
            <Folder className="h-5 w-5" style={{ color: subject.colorTag }} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{subject.name}</h3>
            <p className="text-sm text-gray-500">
              {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SubjectCard;
