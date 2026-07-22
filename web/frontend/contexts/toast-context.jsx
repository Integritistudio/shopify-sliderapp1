"use client"

import { createContext, useContext, useState } from "react"

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const showToast = (message, options = {}) => {
    const id = Date.now() + Math.random()
    const duration = options.duration || 4000
    setToasts((prev) => [
      ...prev,
      {
        id,
        content: String(message || ""),
        error: Boolean(options.error),
        duration,
      },
    ])
    window.setTimeout(() => dismissToast(id), duration)
  }

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="se-toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`se-toast${toast.error ? " se-toast--error" : ""}`}
            role="status"
          >
            <span className="se-toast__text">{toast.content}</span>
            <button
              type="button"
              className="se-toast__close"
              aria-label="Dismiss"
              onClick={() => dismissToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
