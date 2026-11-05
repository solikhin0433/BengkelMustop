/**
 * Lightweight Global Toast State Manager - BengkelKu
 * Bebas library eksternal, reaktif, aman untuk Next.js App Router (Client/SSR).
 */

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private listeners: Set<ToastListener> = new Set();
  private toasts: ToastItem[] = [];

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  show(type: ToastType, message: string, title?: string, duration = 3500) {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type, title, message, duration };

    // Maksimal 4 toast bersamaan agar layar tetap rapi & clean
    this.toasts = [...this.toasts.slice(-3), item];
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }

  success(message: string, title?: string) {
    return this.show("success", message, title);
  }

  error(message: string, title?: string) {
    return this.show("error", message, title, 4500);
  }

  warning(message: string, title?: string) {
    return this.show("warning", message, title);
  }

  info(message: string, title?: string) {
    return this.show("info", message, title);
  }
}

export const toast = new ToastManager();

