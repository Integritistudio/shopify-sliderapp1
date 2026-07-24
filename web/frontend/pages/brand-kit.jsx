"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

/** Brand kit UI was replaced by Appearance (app chrome colors). */
export default function BrandKitRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate("/appearance", { replace: true })
  }, [navigate])
  return null
}
