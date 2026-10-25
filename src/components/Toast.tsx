import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs flex items-start gap-2.5 transition-all transform translate-y-0 animate-in slide-in-from-bottom-2 ${
            t.type === 'success'
              ? 'bg-neutral-900 text-white border-neutral-800'
              : t.type === 'error'
              ? 'bg-red-900 text-white border-red-800'
              : 'bg-white text-neutral-900 border-neutral-200'
          }`}
        >
          {t.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          {t.type === 'error' && (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          {t.type === 'info' && (
            <Info className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 font-medium leading-relaxed">{t.text}</div>

          <button
            onClick={() => onDismiss(t.id)}
            className="text-neutral-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
