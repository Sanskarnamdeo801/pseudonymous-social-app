import type { PropsWithChildren } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
}

export function Modal({ open, title, onClose, children }: PropsWithChildren<ModalProps>) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-ink-900 p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-mist-50">{title}</h2>
          <button type="button" onClick={onClose} className="secondary-button px-3 py-1">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
