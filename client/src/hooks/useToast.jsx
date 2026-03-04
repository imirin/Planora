import { useState, useCallback } from 'react';

const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const Toast = () => {
    if (!toast) return null;
    
    const bgColor = toast.type === 'error' ? 'bg-red-600' : 'bg-green-600';
    
    return (
      <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`}>
        {toast.message}
      </div>
    );
  };

  return { showToast, Toast };
};

export default useToast;
