export function getScrollParent(node) {
  let current = node?.parentElement
  while (current) {
    const style = window.getComputedStyle(current)
    const overflowY = style.overflowY
    if ((overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") && current.scrollHeight > current.clientHeight) {
      return current
    }
    current = current.parentElement
  }
  return document.scrollingElement || document.documentElement
}

export function scrollPreviewIntoView(el) {
  if (!el) return

  const scroller = getScrollParent(el)
  const elRect = el.getBoundingClientRect()
  const topOffset = 20

  let scrollerTop
  let scrollerHeight
  let currentScroll

  if (scroller === document.scrollingElement || scroller === document.documentElement || scroller === document.body) {
    scrollerTop = 0
    scrollerHeight = window.innerHeight
    currentScroll = window.scrollY || document.documentElement.scrollTop
  } else {
    const scrollerRect = scroller.getBoundingClientRect()
    scrollerTop = scrollerRect.top
    scrollerHeight = scroller.clientHeight
    currentScroll = scroller.scrollTop
  }

  const visibleTop = elRect.top - scrollerTop
  const visibleBottom = elRect.bottom - scrollerTop
  const comfortablyVisible =
    visibleTop >= topOffset - 8 &&
    visibleTop <= scrollerHeight * 0.22 &&
    visibleBottom <= scrollerHeight - 12

  // Already framed well — don't micro-scroll
  if (comfortablyVisible) return

  const delta = visibleTop - topOffset
  // Ignore tiny adjustments that feel jumpy
  if (Math.abs(delta) < 48 && visibleBottom <= scrollerHeight - 12) return

  const nextTop = currentScroll + delta
  if (scroller === document.scrollingElement || scroller === document.documentElement || scroller === document.body) {
    window.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" })
  } else {
    scroller.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" })
  }
}
