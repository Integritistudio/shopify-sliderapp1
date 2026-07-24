/** Minimal stroke icons — 16px, currentColor */

export function IconPlus({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconEdit({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconCopy({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="8" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 5V3.75A1.25 1.25 0 009.75 2.5H3.75A1.25 1.25 0 002.5 3.75v6A1.25 1.25 0 003.75 11H5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function IconTrash({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 5h9M6 5V3.75A.75.75 0 016.75 3h2.5a.75.75 0 01.75.75V5M6.5 7.5v4M9.5 7.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4.5 5l.6 7.2a1 1 0 001 .8h3.8a1 1 0 001-.8L11.5 5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function IconClose({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconPalette({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="6" cy="6.5" r="0.9" fill="currentColor" />
      <circle cx="10" cy="6.5" r="0.9" fill="currentColor" />
      <circle cx="8" cy="10.2" r="0.9" fill="currentColor" />
    </svg>
  )
}

export function IconBook({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 3.5h7.5A1.5 1.5 0 0112.5 5v8H5A1.5 1.5 0 013.5 11.5v-8z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 11.5H12.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function IconLayers({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2.5L13.5 5.5 8 8.5 2.5 5.5 8 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M2.5 8L8 11l5.5-3M2.5 10.5L8 13.5l5.5-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconCheck({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconAll({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function IconPublished({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.2 8.15l1.85 1.85 3.75-3.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconDraft({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4.5 2.5h5.2L11.5 4.3V13a.75.75 0 01-.75.75h-6.5A.75.75 0 013.5 13V3.25A.75.75 0 014.5 2.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M9.5 2.6V4.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.75 7.5h4.5M5.75 10h3.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconLock({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5.5 7V5.25a2.5 2.5 0 015 0V7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
