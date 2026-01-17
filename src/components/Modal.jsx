import { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, message, type = 'info', actionLabel, onAction }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500 mb-4" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500 mb-4" />;
      case 'warning':
        return <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />;
      default:
        return <Info className="w-12 h-12 text-undp-blue mb-4" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      default:
        return 'bg-undp-blue hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm transform transition-all animate-in fade-in zoom-in-95 duration-200 p-6 flex flex-col items-center text-center relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {getIcon()}

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h3>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <div className="w-full flex gap-3">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 ${getButtonColor()}`}
            >
              {actionLabel}
            </button>
          )}
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-300`}
          >
            {actionLabel ? 'Cancel' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
