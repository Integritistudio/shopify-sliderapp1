"use client"

import { useEffect, useRef, useState } from "react"
import { Card, Stack, Text, Spinner, Heading } from "@shopify/polaris"

const slideImageContainerStyle = {
  width: "100%",
  position: "relative",
  backgroundColor: "#f6f6f7",
  borderRadius: "8px 8px 0 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}

const slideImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  objectPosition: "center",
  borderRadius: "8px 8px 0 0",
}

export default function DynamicSlickSlider({ slides, sliderId, sliderType = "" }) {
  const sliderRef = useRef(null)
  const thumbnailRef = useRef(null)
  const [slickLoaded, setSlickLoaded] = useState(false)
  const [loadingError, setLoadingError] = useState(null)
  const [uniqueId] = useState(`slider-${sliderId}-${Math.random().toString(36).substr(2, 9)}`)

  const validSlides = (slides || []).filter((slide) => !!slide)

  useEffect(() => {
    let mounted = true
    const loadScripts = async () => {
      try {
        if (!window.jQuery && !window.$) {
          await loadScript("https://code.jquery.com/jquery-3.6.0.min.js")
        }

        if (!document.querySelector('link[href*="slick.css"]')) {
          loadCSS("https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css")
          loadCSS("https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css")
        }

        if (!window.$.fn?.slick) {
          await loadScript("https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js")
        }

        if (mounted) setSlickLoaded(true)
      } catch (error) {
        if (mounted) setLoadingError("Failed to load slider resources")
      }
    }

    loadScripts()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!slickLoaded || !sliderRef.current || validSlides.length === 0) return

    const $slider = window.$(sliderRef.current)
    const $thumbnails = thumbnailRef.current ? window.$(thumbnailRef.current) : null

    if ($slider.hasClass("slick-initialized")) {
      $slider.slick("unslick")
    }
    if ($thumbnails && $thumbnails.hasClass("slick-initialized")) {
      $thumbnails.slick("unslick")
    }

    setTimeout(() => {
      try {
        // Base configuration with custom arrows disabled
        let slickConfig = {
          arrows: false, // Disable default arrows for all types
        }

        switch (sliderType) {
          case "center":
            slickConfig = {
              ...slickConfig,
              centerMode: true,
              centerPadding: "60px",
              slidesToShow: 3,
              dots: true,
              infinite: true,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    centerMode: true,
                    centerPadding: "40px",
                    slidesToShow: 3,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    centerMode: true,
                    centerPadding: "40px",
                    slidesToShow: 1,
                  },
                },
              ],
            }
            break

          case "multiple-items":
            slickConfig = {
              ...slickConfig,
              infinite: true,
              slidesToShow: 3,
              slidesToScroll: 3,
              dots: true,
              responsive: [
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    infinite: true,
                    dots: true,
                  },
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  },
                },
              ],
            }
            break

          case "fade":
            slickConfig = {
              ...slickConfig,
              dots: true,
              infinite: true,
              speed: 500,
              fade: true,
              cssEase: "linear",
              slidesToShow: 1,
              slidesToScroll: 1,
            }
            break

          case "autoplay":
            slickConfig = {
              ...slickConfig,
              slidesToShow: 3,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 2000,
              dots: true,
              pauseOnHover: true,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ],
            }
            break

          case "lazy":
            slickConfig = {
              ...slickConfig,
              lazyLoad: "ondemand",
              slidesToShow: 3,
              slidesToScroll: 1,
              dots: true,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ],
            }
            break

          case "multiple-items":
            slickConfig = {
              ...slickConfig,
              infinite: true,
              slidesToShow: 3,
              slidesToScroll: 1,
              dots: true,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ],
            }
            break

          case "variable-width":
            slickConfig = {
              ...slickConfig,
              dots: true,
            
              slidesToShow: 3,
              slidesToScroll: 1,
            }
            break

          case "thumbnails":
            slickConfig = {
              ...slickConfig,
              slidesToShow: 1,
              slidesToScroll: 1,
              fade: true,
              asNavFor: thumbnailRef.current,
            }
            break

          default:
            slickConfig = {
              ...slickConfig,
              centerMode: true,
              centerPadding: "60px",
              slidesToShow: 3,
              dots: true,
              infinite: true,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    centerMode: true,
                    centerPadding: "40px",
                    slidesToShow: 3,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    centerMode: true,
                    centerPadding: "40px",
                    slidesToShow: 1,
                  },
                },
              ],
            }
        }

        $slider.slick(slickConfig)

        // Initialize thumbnail navigation if needed
        if (sliderType === "thumbnails" && $thumbnails) {
          $thumbnails.slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: sliderRef.current,
            dots: false,
            centerMode: true,
            focusOnSelect: true,
            arrows: false,
          })
        }

        // Attach custom button handlers
        const prevButton = document.querySelector(`.custom-prev-${uniqueId}`)
        const nextButton = document.querySelector(`.custom-next-${uniqueId}`)

        if (prevButton) {
          prevButton.addEventListener('click', () => {
            $slider.slick('slickPrev')
          })
        }

        if (nextButton) {
          nextButton.addEventListener('click', () => {
            $slider.slick('slickNext')
          })
        }

      } catch (error) {
        setLoadingError("Failed to initialize slider")
      }
    }, 100)

    return () => {
      if (window.$ && sliderRef.current?.classList.contains("slick-initialized")) {
        window.$(sliderRef.current).slick("unslick")
      }
      if (window.$ && thumbnailRef.current?.classList.contains("slick-initialized")) {
        window.$(thumbnailRef.current).slick("unslick")
      }
    }
  }, [slickLoaded, validSlides, sliderType, sliderId, uniqueId])

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const loadCSS = (href) => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    document.head.appendChild(link)
  }

  if (loadingError) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "3rem 2rem",
        background: "linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)",
        border: "2px solid #feb2b2",
        borderRadius: "16px",
        margin: "2rem auto",
        maxWidth: "600px",
        color: "#e53e3e",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: "0 4px 12px rgba(229, 62, 62, 0.1)"
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <Heading>Error loading slider</Heading>
        <Text color="critical">{loadingError}</Text>
      </div>
    )
  }

  if (validSlides.length === 0) {
    return (
      <div style={{ 
        textAlign: "center",
        padding: "3rem 2rem",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        borderRadius: "16px",
        margin: "2rem auto",
        maxWidth: "600px",
        color: "#666",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎠</div>
        <Heading>No slides available</Heading>
        <Text color="subdued">This slider doesn't have any slides yet.</Text>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: "1000px", 
      margin: "2rem auto", 
      padding: "1rem", 
      position: "relative",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {slickLoaded ? (
        <>
          {/* Custom Navigation Buttons */}
          <button 
            className={`custom-prev-${uniqueId}`}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "rgba(255, 255, 255, 0.9)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
              fontSize: "18px",
              color: "#333"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,1)"
              e.target.style.transform = "translateY(-50%) scale(1.1)"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.9)"
              e.target.style.transform = "translateY(-50%) scale(1)"
            }}
          >
            ‹
          </button>

          <button 
            className={`custom-next-${uniqueId}`}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              background: "rgba(255, 255, 255, 0.9)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
              fontSize: "18px",
              color: "#333"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,1)"
              e.target.style.transform = "translateY(-50%) scale(1.1)"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.9)"
              e.target.style.transform = "translateY(-50%) scale(1)"
            }}
          >
            ›
          </button>

          {/* Main Slider */}
          <div ref={sliderRef} className={`slider-${uniqueId} ${sliderType}`}>
            {validSlides.map((slide, index) => (
              <div key={`${slide.id}-${sliderId}`}>
                <div style={{ padding: "2px 10px" }}>
                  <div style={{ 
                    background: "white", 
                    borderRadius: "8px", 
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
                    overflow: "hidden" 
                  }}>
                    <div style={slideImageContainerStyle}>
                      <img
                        src={slide.imageUrl || "/placeholder.svg?height=250&width=400"}
                        alt={slide.title || `Slide ${index + 1}`}
                        style={slideImageStyle}
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=250&width=400"
                        }}
                      />
                    </div>
                    <div style={{ padding: "1rem", textAlign: "center" }}>
                      <h3 style={{ 
                        margin: "0 0 0.5rem 0", 
                        fontSize: "1.2rem", 
                        color: "#333" 
                      }}>
                        {slide.title || `Slide ${index + 1}`}
                      </h3>
                      <p style={{ 
                        margin: "0", 
                        color: "#666", 
                        fontSize: "0.9rem" 
                      }}>
                        {slide.description || "No description available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Thumbnail Navigation */}
          {sliderType === "thumbnails" && (
            <div ref={thumbnailRef} className={`slider-thumbnails-${uniqueId}`} style={{ marginTop: "20px" }}>
              {validSlides.map((slide, index) => (
                <div key={`thumb-${slide.id}-${sliderId}`}>
                  <img 
                    src={slide.imageUrl || "/placeholder.svg?height=80&width=120"} 
                    alt={`Thumbnail ${index + 1}`} 
                    style={{ 
                      width: "100%", 
                      height: "80px", 
                      objectFit: "cover", 
                      borderRadius: "4px" 
                    }}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=80&width=120"
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <Card sectioned>
            <Stack vertical spacing="tight" alignment="center">
              <Spinner size="large" />
              <Text color="subdued">Loading slider...</Text>
            </Stack>
          </Card>
        </div>
      )}

      <style jsx>{`
        /* Hide default Slick arrows */
        .slider-${uniqueId}.slick-slider .slick-prev,
        .slider-${uniqueId}.slick-slider .slick-next {
          display: none !important;
        }
        
        /* Custom dots styling */
        .slider-${uniqueId}.slick-slider .slick-dots li button:before {
          color: #008060;
        }
        
        .slider-${uniqueId}.slick-slider .slick-dots li.slick-active button:before {
          color: #004c3f;
        }
        
        /* Custom button hover effects */
        .custom-prev-${uniqueId}:hover,
        .custom-next-${uniqueId}:hover {
          background: rgba(255, 255, 255, 1) !important;
          transform: translateY(-50%) scale(1.1) !important;
        }
        
        .custom-prev-${uniqueId}:active,
        .custom-next-${uniqueId}:active {
          transform: translateY(-50%) scale(0.95) !important;
        }
        
        /* Responsive button sizing */
        @media (max-width: 768px) {
          .custom-prev-${uniqueId},
          .custom-next-${uniqueId} {
            width: 40px !important;
            height: 40px !important;
            font-size: 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          .custom-prev-${uniqueId},
          .custom-next-${uniqueId} {
            width: 35px !important;
            height: 35px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  )
}