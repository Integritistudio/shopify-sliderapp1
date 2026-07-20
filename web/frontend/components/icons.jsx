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
      <rect x="5.5" y="5.5" width="7" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 5.5V4.2A1.2 1.2 0 009.3 3H4.2A1.2 1.2 0 003 4.2v5.1A1.2 1.2 0 004.2 10.5H5.5" stroke="currentColor" strokeWidth="1.4" />
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
