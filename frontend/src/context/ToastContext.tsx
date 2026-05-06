import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { registerToastHandler, type ToastPayload } from "../lib/notifications";

interface ToastItem extends Required<ToastPayload> {
  id: number;
}

interface ToastContextValue {
  showToast: (payload: ToastPayload) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((payload: ToastPayload) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const variant = payload.variant ?? "info";
    setToasts((current) => [...current, { id, message: payload.message, variant }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    registerToastHandler(showToast);
    return () => registerToastHandler(null);
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-3">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                className={`pointer-events-auto rounded-3xl border px-5 py-4 shadow-soft backdrop-blur-xl ${
                  toast.variant === "error"
                    ? "border-red-400/30 bg-red-500/12 text-red-100"
                    : toast.variant === "success"
                      ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-100"
                      : "border-ember-400/30 bg-ink-950/92 text-mist-50"
                }`}
              >
                <p className="text-sm font-medium leading-6">{toast.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
