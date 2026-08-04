"use client"

import { Text } from "@shopify/polaris"

export const REVIEW_URL = "https://apps.shopify.com/slideease"

function openReviewPage() {
  try {
    const opener = window.top || window
    const popup = opener.open(REVIEW_URL, "_blank", "noopener,noreferrer")
    if (popup) return
  } catch {
    // cross-origin iframe may block top.open
  }
  window.open(REVIEW_URL, "_blank", "noopener,noreferrer")
}

/**
 * One-time ask for an App Store review after the merchant creates their first slider.
 */
export default function ReviewPromptModal({ open, onClose }) {
  if (!open) return null

  const handleReview = () => {
    openReviewPage()
    onClose?.()
  }

  return (
    <div
      className="se-upgrade-popup"
      role="dialog"
      aria-modal="true"
      aria-label="Leave a review"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="se-upgrade-popup__card">
        <div className="se-upgrade-popup__header">
          <h2 className="se-upgrade-popup__title">Loving SlideEase? Leave us a review</h2>
          <button type="button" className="se-upgrade-popup__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="se-upgrade-popup__body">
          <Text as="p">
            You just created your first slider — nice work. A quick App Store review helps other merchants
            discover SlideEase.
          </Text>
        </div>
        <div className="se-upgrade-popup__footer">
          <button type="button" className="se-btn se-btn--secondary" onClick={onClose}>
            Maybe later
          </button>
          <button type="button" className="se-btn se-btn--primary" onClick={handleReview}>
            Leave a review
          </button>
        </div>
      </div>
    </div>
  )
}
