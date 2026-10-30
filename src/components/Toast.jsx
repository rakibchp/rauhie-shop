import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'bg-[#35104f] border-[#e6388c] text-white',
    error: 'bg-rose-950 border-rose-500 text-rose-100',
    info: 'bg-[#230738] border-purple-400 text-purple-100',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#e6388c] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-purple-300 shrink-0" />,
  };

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 ease-out translate-y-0 opacity-100 ${bgColors[type] || bgColors.success}`}
      style={{ boxShadow: '0 20px 40px rgba(53, 16, 79, 0.35)' }}
    >
      {icons[type] || icons.success}
      <span className="text-sm font-medium pr-2">{message}</span>
      <button
        onClick={onClose}
        type="button"
        className="p-1 rounded-md opacity-70 hover:opacity-100 transition"
        aria-label="Dismiss message"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

