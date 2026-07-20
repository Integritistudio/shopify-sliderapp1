// Deprecated: use authenticated fetch against /api/sliders and /api/sliders/:id/slides directly.
export async function fetchSliders() {
  const response = await fetch("/api/sliders")
  if (!response.ok) throw new Error("Failed to fetch sliders")
  return response.json()
}

export async function fetchSlider(id) {
  const response = await fetch(`/api/sliders/${id}`)
  if (!response.ok) throw new Error("Failed to fetch slider")
  return response.json()
}
