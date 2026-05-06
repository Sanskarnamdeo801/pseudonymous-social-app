type ToastVariant = "error" | "success" | "info";

export interface ToastPayload {
  message: string;
  variant?: ToastVariant;
}

let notifyHandler: ((payload: ToastPayload) => void) | null = null;

export function registerToastHandler(handler: ((payload: ToastPayload) => void) | null) {
  notifyHandler = handler;
}

export function notify(payload: ToastPayload) {
  notifyHandler?.(payload);
}

export function notifyError(message: string) {
  notify({ message, variant: "error" });
}

export function notifySuccess(message: string) {
  notify({ message, variant: "success" });
}
