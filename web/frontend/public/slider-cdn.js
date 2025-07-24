; (() => {
  // Parse URL parameters
  const script = document.currentScript
  const url = new URL(script.src)
  const sliderId = url.searchParams.get("id")
  const sliderType = url.searchParams.get("type") || "center"

  // Create unique ID for this slider instance
  const uniqueId = `slider-${sliderId}-${Math.random().toString(36).substr(2, 9)}`

  // Use the same domain as the script source for API calls
  const scriptDomain = url.origin
  const apiUrl = `${scriptDomain}/api/public/slider/${sliderId}`

  console.log(`Loading slider ${sliderId} with unique ID: ${uniqueId}`)

  // Fetch and render slider
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      console.log("Slider data received:", data)
      if (data.slides && data.slides.length > 0) {
        console.log("Rendering slider with data:", data.slides)
        renderSlider(data, sliderType)
      } else {
        console.warn("No slides found for slider:", sliderId)
        renderEmptySlider()
      }
    })
    .catch((error) => {
      console.error("Slider load error:", error)
      renderErrorSlider(error.message)
    })

  function renderSlider(sliderData, type) {
    console.log(`Rendering Slick slider with ${sliderData.slides.length} slides`)

    // Thumbnail HTML if needed
    const thumbnailsHTML =
      type === "thumbnails"
        ? `
      <div class="slider-thumbnails-${uniqueId}" style="margin-top: 20px;">
        ${sliderData.slides
          .map(
            (slide, index) => `
          <div>
            <img src="${slide.imageUrl || "/placeholder.svg?height=80&width=120"}" 
                 alt="Thumbnail ${index + 1}" 
                 style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px;"
                 onerror="this.src='/placeholder.svg?height=80&width=120'">
          </div>
        `,
          )
          .join("")}
      </div>
    `
        : ""

    // Create slider HTML with custom navigation buttons
    const sliderHTML = `
      <div class="slider-container-${uniqueId}" style="max-width: 1000px; margin: 2rem auto; padding: 1rem; position: relative;">
        
        <!-- Custom Navigation Buttons -->
        <button class="custom-prev-${uniqueId}" style="
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
          font-size: 18px;
          color: #333;
        " onmouseover="this.style.background='rgba(255,255,255,1)'; this.style.transform='translateY(-50%) scale(1.1)'" 
           onmouseout="this.style.background='rgba(255,255,255,0.9)'; this.style.transform='translateY(-50%) scale(1)'">
          &#8249;
        </button>
        
        <button class="custom-next-${uniqueId}" style="
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
          font-size: 18px;
          color: #333;
        " onmouseover="this.style.background='rgba(255,255,255,1)'; this.style.transform='translateY(-50%) scale(1.1)'" 
           onmouseout="this.style.background='rgba(255,255,255,0.9)'; this.style.transform='translateY(-50%) scale(1)'">
          &#8250;
        </button>

        <div id="${uniqueId}" class="${type}">
          ${sliderData.slides
        .map(
          (slide, index) => `
            <div>
              <div style="padding: 2px 10px;">
                <div style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="width: 100%;">
                  <img src="${slide.imageUrl || "/placeholder.svg?height=250&width=400"}" 
                       alt="${slide.title || `Slide ${index + 1}`}" 
                       style="width: 100%; height: 100%; object-fit: contain; display: block;"
                       onerror="this.src='/placeholder.svg?height=250&width=400'">
                       </div>
                  <div style="padding: 1rem; text-align: center;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.2rem; color: #333;">${slide.title || `Slide ${index + 1}`}</h3>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${slide.description || "No description available"}</p>
                  </div>
                </div>
              </div>
            </div>
          `,
        )
        .join("")}
        </div>
        ${thumbnailsHTML}
      </div>
      
      <style>
        /* Minimal custom styles - let Slick handle the rest */
        .slider-container-${uniqueId} {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* Hide default Slick arrows */
        #${uniqueId}.slick-slider .slick-prev,
        #${uniqueId}.slick-slider .slick-next {
          display: none !important;
        }
        
        /* Custom dots styling */
        #${uniqueId}.slick-slider .slick-dots li button:before {
          color: #008060;
        }
        
        #${uniqueId}.slick-slider .slick-dots li.slick-active button:before {
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
            width: 35px !important;
            height: 35px !important;
            font-size: 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          .custom-prev-${uniqueId},
          .custom-next-${uniqueId} {
            width: 30px !important;
            height: 30px !important;
            font-size: 14px !important;
          }
        }
      </style>
    `

    // Insert slider HTML
    script.insertAdjacentHTML("afterend", sliderHTML)

    // Load dependencies and initialize carousel
    loadCarouselDependencies(sliderData, type)
  }

  function loadCarouselDependencies(sliderData, type) {
    // Load jQuery if not present
    if (typeof window.jQuery === "undefined") {
      const jqueryScript = document.createElement("script")
      jqueryScript.src = "https://code.jquery.com/jquery-3.6.0.min.js"
      jqueryScript.onload = () => loadSlickCarousel(sliderData, type)
      jqueryScript.onerror = () => {
        console.error("Failed to load jQuery")
        fallbackToSimpleSlider()
      }
      document.head.appendChild(jqueryScript)
    } else {
      loadSlickCarousel(sliderData, type)
    }
  }

  function loadSlickCarousel(sliderData, type) {
    // Load Slick CSS files
    if (!document.querySelector('link[href*="slick.css"]')) {
      const slickCSS = document.createElement("link")
      slickCSS.rel = "stylesheet"
      slickCSS.href = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"
      slickCSS.onload = () => {
        const slickThemeCSS = document.createElement("link")
        slickThemeCSS.rel = "stylesheet"
        slickThemeCSS.href = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"
        slickThemeCSS.onload = () => loadSlickJS(sliderData, type)
        slickThemeCSS.onerror = () => {
          console.error("Failed to load Slick theme CSS")
          fallbackToSimpleSlider()
        }
        document.head.appendChild(slickThemeCSS)
      }
      slickCSS.onerror = () => {
        console.error("Failed to load Slick CSS")
        fallbackToSimpleSlider()
      }
      document.head.appendChild(slickCSS)
    } else {
      loadSlickJS(sliderData, type)
    }
  }

  function loadSlickJS(sliderData, type) {
    // Load Slick JS
    if (typeof window.jQuery === "undefined" || typeof window.jQuery.fn.slick === "undefined") {
      const slickScript = document.createElement("script")
      slickScript.src = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"
      slickScript.onload = () => initializeSlickCarousel(sliderData, type)
      slickScript.onerror = () => {
        console.error("Failed to load Slick carousel")
        fallbackToSimpleSlider()
      }
      document.head.appendChild(slickScript)
    } else {
      initializeSlickCarousel(sliderData, type)
    }
  }

  function initializeSlickCarousel(sliderData, type) {
    const sliderElement = document.getElementById(uniqueId)
    const thumbnailElement = document.querySelector(`.slider-thumbnails-${uniqueId}`)
    const prevButton = document.querySelector(`.custom-prev-${uniqueId}`)
    const nextButton = document.querySelector(`.custom-next-${uniqueId}`)

    if (!sliderElement) {
      console.error("Slider element not found:", uniqueId)
      return
    }

    console.log("Initializing Slick carousel for:", uniqueId, "Type:", type)

    // Wait for CSS to load
    setTimeout(() => {
      try {
        const $slider = window.jQuery(sliderElement)

        // Type-specific configuration - disable default arrows
        let slickConfig = {
          arrows: false, // Disable default arrows for all types
        }

        switch (type) {
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

          case "multiple":
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

          case "infinite":
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

          case "variable":
            slickConfig = {
              ...slickConfig,
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
              ...slickConfig,
              dots: true,
              vertical: true,
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
              asNavFor: `.slider-thumbnails-${uniqueId}`,
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

        console.log("Slick config:", slickConfig)

        // Initialize Slick with custom configuration
        $slider.slick(slickConfig)

        // Attach custom button click handlers
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

        // Initialize thumbnail navigation if needed
        if (type === "thumbnails" && thumbnailElement) {
          window.jQuery(thumbnailElement).slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: `#${uniqueId}`,
            dots: false,
            centerMode: true,
            focusOnSelect: true,
            arrows: false,
          })
        }

        console.log("Slick carousel initialized successfully with custom buttons")
      } catch (error) {
        console.error("Error initializing Slick carousel:", error)
        fallbackToSimpleSlider()
      }
    }, 500)
  }

  function fallbackToSimpleSlider() {
    console.log("Falling back to simple slider")
    const sliderElement = document.getElementById(uniqueId)
    if (sliderElement) {
      sliderElement.style.display = "flex"
      sliderElement.style.overflowX = "auto"
      sliderElement.style.scrollBehavior = "smooth"
      sliderElement.style.gap = "1rem"
      sliderElement.style.padding = "1rem 0"

      // Add scroll snap for better UX
      sliderElement.style.scrollSnapType = "x mandatory"
      const slides = sliderElement.querySelectorAll("div")
      slides.forEach((slide) => {
        slide.style.scrollSnapAlign = "center"
        slide.style.flexShrink = "0"
        slide.style.width = "300px"
      })
    }
  }

  function renderEmptySlider() {
    const emptyHTML = `<div id="${uniqueId}" class="simple-slider-empty" style="min-height: 1px;"></div>`
    script.insertAdjacentHTML("afterend", emptyHTML)
  }

  function renderErrorSlider(errorMessage) {
    const emptyHTML = `<div id="${uniqueId}" class="simple-slider-empty" style="min-height: 1px;"></div>`
    script.insertAdjacentHTML("afterend", emptyHTML)
  }
})()