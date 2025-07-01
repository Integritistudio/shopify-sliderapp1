"use client"

import { useEffect, useRef, useState } from "react"
import { Card, Stack, Text, Spinner, Heading } from "@shopify/polaris"

const slideImageContainerStyle = {
  width: "100%",
  height: "250px",
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
  maxHeight: "280px",
  objectFit: "cover",
  objectPosition: "center",
  borderRadius: "8px 8px 0 0",
}

export default function DynamicSlickSlider({ slides, sliderId, sliderType = "center" }) {
  const sliderRef = useRef(null)
  const [slickLoaded, setSlickLoaded] = useState(false)
  const [loadingError, setLoadingError] = useState(null)

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

    if ($slider.hasClass("slick-initialized")) {
      $slider.slick("unslick")
    }

    setTimeout(() => {
      try {
        // Pure Slick configurations
        let slickConfig = {}

        switch (sliderType) {
          case "center":
            slickConfig = {
              centerMode: true,
              centerPadding: "60px",
              slidesToShow: 3,
              dots: true,
              arrows: true,
              infinite: true,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: "40px",
                    slidesToShow: 3,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: "40px",
                    slidesToShow: 1,
                  },
                },
              ],
            }
            break

          case "multiple":
          case "multiple-items":
            slickConfig = {
              infinite: true,
              slidesToShow: 3,
              slidesToScroll: 3,
              dots: true,
              arrows: true,
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
                    arrows: false,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                  },
                },
              ],
            }
            break

          case "fade":
            slickConfig = {
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
              slidesToShow: 3,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 2000,
              dots: true,
              arrows: true,
              pauseOnHover: true,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                    arrows: false,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                    arrows: false,
                  },
                },
              ],
            }
            break

          case "lazy":
            slickConfig = {
              lazyLoad: "ondemand",
              slidesToShow: 3,
              slidesToScroll: 1,
              dots: true,
              arrows: true,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                    arrows: false,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                    arrows: false,
                  },
                },
              ],
            }
            break

          case "infinite":
            slickConfig = {
              infinite: true,
              slidesToShow: 3,
              slidesToScroll: 1,
              dots: true,
              arrows: true,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                    arrows: false,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                    arrows: false,
                  },
                },
              ],
            }
            break

          case "variable":
            slickConfig = {
              dots: true,
              infinite: true,
              speed: 300,
              slidesToShow: 1,
              centerMode: true,
              variableWidth: true,
            }
            break

          case "vertical":
            slickConfig = {
              dots: true,
              vertical: true,
              slidesToShow: 3,
              slidesToScroll: 1,
            }
            break

          default:
            slickConfig = {
              centerMode: true,
              centerPadding: "60px",
              slidesToShow: 3,
              dots: true,
              arrows: true,
              infinite: true,
              responsive: [
                {
                  breakpoint: 768,
                  settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: "40px",
                    slidesToShow: 3,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: "40px",
                    slidesToShow: 1,
                  },
                },
              ],
            }
        }

        $slider.slick(slickConfig)
      } catch (error) {
        setLoadingError("Failed to initialize slider")
      }
    }, 100)

    return () => {
      if (window.$ && sliderRef.current?.classList.contains("slick-initialized")) {
        window.$(sliderRef.current).slick("unslick")
      }
    }
  }, [slickLoaded, validSlides, sliderType, sliderId])

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
      <div style={{ textAlign: "center", padding: "2rem 0" }}>
        <Card sectioned>
          <Stack vertical spacing="tight" alignment="center">
            <Heading>Slider Error</Heading>
            <Text color="critical">{loadingError}</Text>
          </Stack>
        </Card>
      </div>
    )
  }

  if (validSlides.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 0" }}>
        <Card sectioned>
          <Stack vertical spacing="tight" alignment="center">
            <Heading>No Slides Yet</Heading>
            <Text color="subdued">Add your first slide using the Add button below!</Text>
          </Stack>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: "1rem 3rem", position: "relative" }}>
      {slickLoaded ? (
        <div ref={sliderRef} className={`slider-${sliderId} ${sliderType}`}>
          {validSlides.map((slide, index) => (
            <div key={`${slide.id}-${sliderId}`}>
              <div style={{ padding: "0 10px" }}>
                <Card>
                  <div style={{ position: "relative", overflow: "hidden" }}>
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
                    <div style={{ padding: "1rem" }}>
                      <Stack vertical spacing="tight">
                        <Text variant="headingSm" fontWeight="semibold">
                          {slide.title || `Slide ${index + 1}`}
                        </Text>
                        <Text variant="bodyMd" color="subdued">
                          {slide.description || "No description available"}
                        </Text>
                      </Stack>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
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
        /* Container spacing to prevent arrow overlap */
        .slider-${sliderId} {
          margin: 0 -20px;
        }
        
        /* Arrow positioning to prevent overlap with slides */
        .slider-${sliderId} .slick-prev {
          left: -25px;
          z-index: 10;
        }
        
        .slider-${sliderId} .slick-next {
          right: -25px;
          z-index: 10;
        }
        
        /* Ensure arrows are outside the slide area */
        .slider-${sliderId} .slick-prev:before,
        .slider-${sliderId} .slick-next:before {
          color: #008060;
          font-size: 20px;
        }
        
        /* Active dot styling */
        .slider-${sliderId} .slick-dots li button:before {
          color: #008060;
        }
        
        .slider-${sliderId} .slick-dots li.slick-active button:before {
          color: #004c3f;
        }
        
        /* Responsive arrow positioning */
        @media (max-width: 768px) {
          .slider-${sliderId} .slick-prev {
            left: -25px;
          }
          
          .slider-${sliderId} .slick-next {
            right: -25px;
          }
        }
        
        @media (max-width: 480px) {
          .slider-${sliderId} .slick-prev {
            left: -25px;
          }
          
          .slider-${sliderId} .slick-next {
            right: -25px;
          }
        }
      `}</style>
    </div>
  )
}
