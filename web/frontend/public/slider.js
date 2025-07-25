;(() => {
  // Get the script tag that loaded this file
  const scriptTag = document.currentScript
  console.log(scriptTag)
  const sliderId = scriptTag.getAttribute("data-slider-id")
  const slidesData = JSON.parse(scriptTag.getAttribute("data-slides") || "[]")
  const sliderType = "Fade Transition"
  const position = scriptTag.getAttribute("data-position") || "middle"

  // Validate required data
  if (!sliderId || !slidesData || slidesData.length === 0) {
    console.warn("Slider widget: Missing required data")
    return
  }

  // Create slider HTML
  function createSliderHTML() {
    const sliderId_unique = `slider-${sliderId}-${Date.now()}`

    const slidesHTML = slidesData
      .map(
        (slide, index) => `
      <div>
        <div style="padding: 0 10px;">
          <div style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            <img src="${slide.imageUrl || "/placeholder.svg?height=250&width=400"}" 
                 alt="${slide.title || `Slide ${index + 1}`}" 
                 style="width: 100%; height: 250px; object-fit: cover; display: block;"
                 onerror="this.src='/placeholder.svg?height=250&width=400'">
            <div style="padding: 1rem; text-align: center;">
              <h3 style="margin: 0 0 0.5rem 0; font-size: 1.2rem; color: #333;">${slide.title || `Slide ${index + 1}`}</h3>
              <p style="margin: 0; color: #666; font-size: 0.9rem;">${slide.description || "No description available"}</p>
            </div>
          </div>
        </div>
      </div>
    `,
      )
      .join("")

    // Thumbnail HTML if needed
    const thumbnailsHTML =
      sliderType === "thumbnails"
        ? `
      <div class="slider-thumbnails-${sliderId_unique}" style="margin-top: 20px;">
        ${slidesData
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

    return `
      <div class="slider-app-container" data-slider-id="${sliderId}" data-position="${position}">
        <style>
          .slider-app-${sliderId} {
            max-width: 1000px;
            margin: ${position === "top" ? "1rem auto 3rem auto" : position === "bottom" ? "3rem auto 1rem auto" : "2rem auto"};
            padding: 1rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          /* Only customize dots and arrows color */
          .slider-app-${sliderId}.slick-slider .slick-dots li button:before {
            color: #008060;
          }
          
          .slider-app-${sliderId}.slick-slider .slick-dots li.slick-active button:before {
            color: #004c3f;
          }
          
          .slider-app-${sliderId}.slick-slider .slick-prev:before,
          .slider-app-${sliderId}.slick-slider .slick-next:before {
            color: #008060;
          }
        </style>
        
        <div class="slider-app-${sliderId} ${sliderType}" id="${sliderId_unique}">
          ${slidesHTML}
        </div>
        ${thumbnailsHTML}
      </div>
    `
  }

  // Load dependencies and initialize slider
  function loadSlider() {
    // Insert slider HTML
    const sliderHTML = createSliderHTML()
    scriptTag.insertAdjacentHTML("afterend", sliderHTML)

    // Load jQuery if not present
    if (typeof window.jQuery === "undefined") {
      const jqueryScript = document.createElement("script")
      jqueryScript.src = "https://code.jquery.com/jquery-3.6.0.min.js"
      jqueryScript.onload = loadSlick
      jqueryScript.onerror = () => {
        console.error("Failed to load jQuery")
        fallbackToSimpleSlider()
      }
      document.head.appendChild(jqueryScript)
    } else {
      loadSlick()
    }
  }

  // Load Slick carousel
  function loadSlick() {
    // Load Slick CSS
    if (!document.querySelector('link[href*="slick.css"]')) {
      const slickCSS = document.createElement("link")
      slickCSS.rel = "stylesheet"
      slickCSS.href = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"
      document.head.appendChild(slickCSS)

      const slickThemeCSS = document.createElement("link")
      slickThemeCSS.rel = "stylesheet"
      slickThemeCSS.href = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"
      document.head.appendChild(slickThemeCSS)
    }

    // Load Slick JS
    if (typeof window.jQuery === "undefined" || typeof window.jQuery.fn.slick === "undefined") {
      const slickScript = document.createElement("script")
      slickScript.src = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"
      slickScript.onload = initializeSlick
      slickScript.onerror = () => {
        console.error("Failed to load Slick carousel")
        fallbackToSimpleSlider()
      }
      document.head.appendChild(slickScript)
    } else {
      initializeSlick()
    }
  }

  // Initialize Slick slider
  function initializeSlick() {
    const sliderId_unique = `slider-${sliderId}-${Date.now()}`
    const sliderElement = document.querySelector(`.slider-app-${sliderId}`)
    const thumbnailElement = document.querySelector(`.slider-thumbnails-${sliderId_unique}`)

    if (!sliderElement) {
      console.error("Slider element not found for slider:", sliderId)
      return
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

        const $slider = window.jQuery(sliderElement)
        $slider.slick(slickConfig)

        // Initialize thumbnail navigation if needed
        if (sliderType === "thumbnails" && thumbnailElement) {
          window.jQuery(thumbnailElement).slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: `.slider-app-${sliderId}`,
            dots: false,
            centerMode: true,
            focusOnSelect: true,
          })
        }

        console.log("Slick carousel initialized successfully")
      } catch (error) {
        console.error("Error initializing Slick carousel:", error)
        fallbackToSimpleSlider()
      }
    }, 500)
  }

  function fallbackToSimpleSlider() {
    const sliderId_unique = `slider-${sliderId}-${Date.now()}`
    const sliderElement = document.getElementById(sliderId_unique)
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

  // Start loading when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSlider)
  } else {
    loadSlider()
  }
})()

