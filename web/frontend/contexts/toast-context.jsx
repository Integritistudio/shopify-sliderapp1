"use client"

import { createContext, useContext, useState } from "react"
import { Toast, Frame } from "@shopify/polaris"
const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = (message, options = {}) => {
    const id = Date.now()
    const toast = {
      id,
      content: message,
      error: options.error || false,
      duration: options.duration || 4000,
      ...options,
    }

    setToasts((prev) => [...prev, toast])

    // Auto dismiss
    setTimeout(() => {
      dismissToast(id)
    }, toast.duration)
  }

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const toastMarkup = toasts.map((toast) => (
    <Toast key={toast.id} content={toast.content} onDismiss={() => dismissToast(toast.id)} error={toast.error} />
  ))

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      <Frame>
        {children}
        {toastMarkup}
      </Frame>
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
