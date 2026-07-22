"use client"

import { useEffect, useId, useRef, useState } from "react"

/**
 * Custom select that matches SlideEase field chrome.
 * Native Polaris/browser selects can't style the open menu.
 */
export default function SeSelect({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  helpText,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()
  const selected = options.find((option) => option.value === value) || options[0]

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div className={`se-select${open ? " is-open" : ""}`} ref={rootRef}>
      {label ? <div className="se-select__label">{label}</div> : null}
      <button
        type="button"
        className="se-select__trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        <span className="se-select__value">{selected?.label || ""}</span>
        <span className="se-select__chevron" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <ul className="se-select__menu" id={listId} role="listbox">
          {options.map((option) => {
            const isActive = option.value === value
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`se-select__option${isActive ? " is-active" : ""}`}
                  onClick={() => {
                    onChange?.(option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {helpText ? <div className="se-select__help">{helpText}</div> : null}
    </div>
  )
}
