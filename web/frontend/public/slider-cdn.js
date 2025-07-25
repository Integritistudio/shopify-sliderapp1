;(() => {
  // Parse URL parameters
  const script = document.currentScript
  const url = new URL(script.src)
  const sliderId = url.searchParams.get("id")

  // Create unique ID for this slider instance
  const uniqueId = `slider-${sliderId}-${Math.random().toString(36).substr(2, 9)}`

  // Use the same domain as the script source for API calls
  const scriptDomain = url.origin
  const apiUrl = `${scriptDomain}/api/public/slider/${sliderId}`

  console.log(`Loading slider ${sliderId} with unique ID: ${uniqueId}`)

  // Show loading state
  renderLoadingSlider()

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

      // Remove loading state
      removeLoadingSlider()

      // Check if we got an error response
      if (data.error) {
        console.error("API returned error:", data.error)
        renderErrorSlider(data.error)
        return
      }

      if (data.slides && data.slides.length > 0) {
        console.log(`Rendering slider with type: ${data.sliderType} and ${data.slides.length} slides`)
        renderSlider(data)
      } else {
        console.warn("No slides found for slider:", sliderId)
        renderEmptySlider()
      }
    })
    .catch((error) => {
      console.error("Slider load error:", error)
      removeLoadingSlider()
      renderErrorSlider(error.message)
    })

  function renderLoadingSlider() {
    const loadingHTML = `
      <div id="${uniqueId}-loading" style="
        text-align: center;
        padding: 2rem 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 600px;
          margin: 0 auto;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #008060;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem auto;
          "></div>
          <div style="color: #666; font-size: 1rem;">Loading slider...</div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `
    script.insertAdjacentHTML("afterend", loadingHTML)
  }

  function removeLoadingSlider() {
    const loadingElement = document.getElementById(`${uniqueId}-loading`)
    if (loadingElement) {
      loadingElement.remove()
    }
  }

  function renderSlider(sliderData) {
    const { sliderType, slides } = sliderData
    console.log(`Rendering Slick slider with ${slides.length} slides of type: ${sliderType}`)

    // Thumbnail HTML if needed
    const thumbnailsHTML =
      sliderType === "thumbnails"
        ? `
      <div class="slider-thumbnails-${uniqueId}" style="margin-top: 20px;">
        ${slides
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

    // Create slider HTML with improved styling
    const sliderHTML = `
      <div class="slider-container-${uniqueId}" style="
        max-width: 1000px; 
        margin: 2rem auto; 
        padding: 1rem; 
        position: relative;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
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

        <div id="${uniqueId}" class="${sliderType}">
          ${slides
            .map(
              (slide, index) => `
            <div>
              <div style="padding: 2px 10px;">
                <div style="
                  background: white; 
                  border-radius: 8px; 
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
                  overflow: hidden;
                ">
                  <div style="
                    width: 100%;
                    position: relative;
                    background-color: #f6f6f7;
                    border-radius: 8px 8px 0 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    height: 250px;
                  ">
                    <img src="${slide.imageUrl || "/placeholder.svg?height=250&width=400"}"
                         alt="${slide.title || `Slide ${index + 1}`}"
                         style="
                           width: 100%; 
                           height: 100%; 
                           object-fit: contain; 
                           object-position: center; 
                           border-radius: 8px 8px 0 0;
                           display: block;
                         "
                         onerror="this.src='/placeholder.svg?height=250&width=400'">
                  </div>
                  <div style="padding: 1rem; text-align: center;">
                    <h3 style="
                      margin: 0 0 0.5rem 0; 
                      font-size: 1.2rem; 
                      color: #333;
                      font-weight: 600;
                    ">${slide.title || `Slide ${index + 1}`}</h3>
                    <p style="
                      margin: 0; 
                      color: #666; 
                      font-size: 0.9rem;
                      line-height: 1.4;
                    ">${slide.description || "No description available"}</p>
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
        /* Slider container styles */
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
          font-size: 12px;
        }
        
        #${uniqueId}.slick-slider .slick-dots li.slick-active button:before {
          color: #004c3f;
        }
        
        #${uniqueId}.slick-slider .slick-dots {
          bottom: -45px;
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
          
          .slider-container-${uniqueId} {
            padding: 0.5rem !important;
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
        
        /* Smooth transitions for slides */
        #${uniqueId} .slick-slide {
          transition: transform 0.3s ease;
        }
        
        /* Loading animation */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `

    // Insert slider HTML
    script.insertAdjacentHTML("afterend", sliderHTML)

    // Load dependencies and initialize carousel
    loadCarouselDependencies(sliderData)
  }

  function loadCarouselDependencies(sliderData) {
    // Load jQuery if not present
    if (typeof window.jQuery === "undefined") {
      const jqueryScript = document.createElement("script")
      jqueryScript.src = "https://code.jquery.com/jquery-3.6.0.min.js"
      jqueryScript.onload = () => loadSlickCarousel(sliderData)
      jqueryScript.onerror = () => {
        console.error("Failed to load jQuery")
        fallbackToSimpleSlider()
      }
      document.head.appendChild(jqueryScript)
    } else {
      loadSlickCarousel(sliderData)
    }
  }

  function loadSlickCarousel(sliderData) {
    // Load Slick CSS files
    if (!document.querySelector('link[href*="slick.css"]')) {
      const slickCSS = document.createElement("link")
      slickCSS.rel = "stylesheet"
      slickCSS.href = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"
      slickCSS.onload = () => {
        const slickThemeCSS = document.createElement("link")
        slickThemeCSS.rel = "stylesheet"
        slickThemeCSS.href = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"
        slickThemeCSS.onload = () => loadSlickJS(sliderData)
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
      loadSlickJS(sliderData)
    }
  }

  function loadSlickJS(sliderData) {
    // Load Slick JS
    if (typeof window.jQuery === "undefined" || typeof window.jQuery.fn.slick === "undefined") {
      const slickScript = document.createElement("script")
      slickScript.src = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"
      slickScript.onload = () => initializeSlickCarousel(sliderData)
      slickScript.onerror = () => {
        console.error("Failed to load Slick carousel")
        fallbackToSimpleSlider()
      }
      document.head.appendChild(slickScript)
    } else {
      initializeSlickCarousel(sliderData)
    }
  }

  function initializeSlickCarousel(sliderData) {
    const { sliderType } = sliderData
    const sliderElement = document.getElementById(uniqueId)
    const thumbnailElement = document.querySelector(`.slider-thumbnails-${uniqueId}`)
    const prevButton = document.querySelector(`.custom-prev-${uniqueId}`)
    const nextButton = document.querySelector(`.custom-next-${uniqueId}`)

    if (!sliderElement) {
      console.error("Slider element not found:", uniqueId)
      return
    }

    console.log("Initializing Slick carousel for:", uniqueId, "Type:", sliderType)

    // Wait for CSS to load
    setTimeout(() => {
      try {
        const $slider = window.jQuery(sliderElement)

        // Type-specific configuration - disable default arrows
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
          prevButton.addEventListener("click", () => {
            $slider.slick("slickPrev")
          })
        }

        if (nextButton) {
          nextButton.addEventListener("click", () => {
            $slider.slick("slickNext")
          })
        }

        // Initialize thumbnail navigation if needed
        if (sliderType === "thumbnails" && thumbnailElement) {
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
    const emptyHTML = `
      <div id="${uniqueId}" style="
        text-align: center;
        padding: 3rem 2rem;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 16px;
        margin: 2rem auto;
        max-width: 600px;
        color: #666;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎠</div>
        <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: #333;">No slides available</h2>
        <p style="margin: 0; color: #666;">This slider doesn't have any slides yet.</p>
      </div>
    `
    script.insertAdjacentHTML("afterend", emptyHTML)
  }

  function renderErrorSlider(errorMessage) {
    const errorHTML = `
      <div id="${uniqueId}" style="
        text-align: center;
        padding: 3rem 2rem;
        background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
        border: 2px solid #feb2b2;
        border-radius: 16px;
        margin: 2rem auto;
        max-width: 600px;
        color: #e53e3e;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 12px rgba(229, 62, 62, 0.1);
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: #e53e3e;">Error loading slider</h2>
        <p style="margin: 0; color: #c53030;">${errorMessage}</p>
      </div>
    `
    script.insertAdjacentHTML("afterend", errorHTML)
  }
})()
