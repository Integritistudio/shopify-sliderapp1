

// ;(() => {
//   // Parse URL parameters
//   const script = document.currentScript
//   const url = new URL(script.src)
//   const sliderId = url.searchParams.get("id")
//   const sliderType = url.searchParams.get("type") || "center"

//   // Create unique ID for this slider instance
//   const uniqueId = `slider-${sliderId}-${Math.random().toString(36).substr(2, 9)}`

//   // Use the same domain as the script source for API calls
//   const scriptDomain = url.origin
//   const apiUrl = `${scriptDomain}/api/public/slider/${sliderId}`

//   console.log(`Loading slider ${sliderId} with unique ID: ${uniqueId}`)

//   // Fetch and render slider
//   fetch(apiUrl)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
//       return response.json()
//     })
//     .then((data) => {
//       console.log("Slider data received:", data)
//       if (data.slides && data.slides.length > 0) {
//         renderSlider(data, sliderType)
//       } else {
//         console.warn("No slides found for slider:", sliderId)
//         renderEmptySlider()
//       }
//     })
//     .catch((error) => {
//       console.error("Slider load error:", error)
//       renderErrorSlider(error.message)
//     })

//   function renderSlider(sliderData, type) {
//     console.log(`Rendering carousel slider with ${sliderData.slides.length} slides`)

//     // Thumbnail HTML if needed
//     const thumbnailsHTML =
//       type === "thumbnails"
//         ? `
//       <div class="slider-thumbnails-${uniqueId}" style="margin-top: 20px;">
//         ${sliderData.slides
//           .map(
//             (slide, index) => `
//           <div>
//             <img src="${slide.imageUrl || "/placeholder.svg?height=80&width=120"}" 
//                  alt="Thumbnail ${index + 1}" 
//                  style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px;"
//                  onerror="this.src='/placeholder.svg?height=80&width=120'">
//           </div>
//         `,
//           )
//           .join("")}
//       </div>
//     `
//         : ""

//     // Create carousel HTML with enhanced styling
//     const sliderHTML = `
//       <div class="slider-container-${uniqueId}" style="max-width: 1000px; margin: 2rem auto; padding: 1rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
//         <div id="${uniqueId}" class="carousel-slider carousel-slider-${sliderId} ${type === "vertical" ? "vertical-slider" : ""}" data-type="${type}">
//           ${sliderData.slides
//             .map(
//               (slide, index) => `
//             <div class="slide-item" data-slide-index="${index}">
//               <div class="slide-card">
//                 <div class="slide-image-container">
//                   <img src="${slide.imageUrl || "/placeholder.svg?height=250&width=400"}" 
//                        alt="${slide.title || `Slide ${index + 1}`}" 
//                        loading="lazy"
//                        onerror="this.src='/placeholder.svg?height=250&width=400'">
//                 </div>
//                 <div class="slide-content">
//                   <h3 class="slide-title">${slide.title || `Slide ${index + 1}`}</h3>
//                   <p class="slide-description">${slide.description || "No description available"}</p>
//                 </div>
//               </div>
//             </div>
//           `,
//             )
//             .join("")}
//         </div>
//         ${thumbnailsHTML}
//       </div>
      
//       <style>
//         /* Enhanced slider styles */
//         .slider-container-${uniqueId} {
//           box-sizing: border-box;
//         }
        
//         .slider-container-${uniqueId} * {
//           box-sizing: border-box;
//         }
        
//         .carousel-slider-${sliderId} .slide-item {
//           padding: 0 8px;
//           outline: none;
//         }
        
//         .carousel-slider-${sliderId} .slide-card {
//           background: white;
//           border-radius: 12px;
//           box-shadow: 0 2px 8px rgba(0,0,0,0.1);
//           overflow: hidden;
//           transition: transform 0.3s ease, box-shadow 0.3s ease;
//           height: 100%;
//           display: flex;
//           flex-direction: column;
//         }
        
//         .carousel-slider-${sliderId} .slide-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 16px rgba(0,0,0,0.15);
//         }
        
//         .carousel-slider-${sliderId} .slide-image-container {
//           width: 100%;
//           height: 250px;
//           position: relative;
//           background: #f6f6f7;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           overflow: hidden;
//         }
        
//         .carousel-slider-${sliderId} .slide-image-container img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           object-position: center;
//           transition: transform 0.3s ease;
//         }
        
//         .carousel-slider-${sliderId} .slide-card:hover .slide-image-container img {
//           transform: scale(1.05);
//         }
        
//         .carousel-slider-${sliderId} .slide-content {
//           padding: 1.5rem;
//           text-align: center;
//           flex-grow: 1;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//         }
        
//         .carousel-slider-${sliderId} .slide-title {
//           font-size: 1.25rem;
//           font-weight: 600;
//           margin: 0 0 0.75rem 0;
//           color: #333;
//           line-height: 1.3;
//         }
        
//         .carousel-slider-${sliderId} .slide-description {
//           color: #666;
//           font-size: 0.95rem;
//           line-height: 1.5;
//           margin: 0;
//         }
        
//         /* Slick carousel customizations */
//         .carousel-slider-${sliderId}.slick-slider {
//           margin-bottom: 30px;
//         }
        
//         .carousel-slider-${sliderId} .slick-dots {
//           bottom: -50px;
//         }
        
//         .carousel-slider-${sliderId} .slick-dots li button:before {
//           font-size: 12px;
//           color: #008060;
//           opacity: 0.5;
//         }
        
//         .carousel-slider-${sliderId} .slick-dots li.slick-active button:before {
//           opacity: 1;
//           color: #004c3f;
//         }
        
//         .carousel-slider-${sliderId} .slick-prev:before,
//         .carousel-slider-${sliderId} .slick-next:before {
//           color: #008060;
//           font-size: 20px;
//         }
        
//         .carousel-slider-${sliderId} .slick-prev {
//           left: -40px;
//           z-index: 1;
//         }
        
//         .carousel-slider-${sliderId} .slick-next {
//           right: -40px;
//           z-index: 1;
//         }
        
//         /* Vertical slider styles */
//         .vertical-slider {
//           height: 400px;
//         }
        
//         .vertical-slider .slide-item {
//           padding: 8px 0 !important;
//         }
        
//         /* Thumbnail styles */
//         .slider-thumbnails-${uniqueId} .slick-slide {
//           padding: 0 4px;
//           cursor: pointer;
//           opacity: 0.6;
//           transition: opacity 0.3s;
//         }
        
//         .slider-thumbnails-${uniqueId} .slick-slide.slick-current {
//           opacity: 1;
//         }
        
//         .slider-thumbnails-${uniqueId} .slick-slide img {
//           border: 2px solid transparent;
//           transition: border-color 0.3s;
//         }
        
//         .slider-thumbnails-${uniqueId} .slick-slide.slick-current img {
//           border-color: #008060;
//         }
        
//         /* Variable width slider styles */
//         .variable-width-slider .slide-card {
//           width: auto !important;
//           margin: 0 10px;
//         }
        
//         /* Responsive styles */
//         @media (max-width: 768px) {
//           .carousel-slider-${sliderId} .slick-prev,
//           .carousel-slider-${sliderId} .slick-next {
//             display: none !important;
//           }
          
//           .carousel-slider-${sliderId} .slide-item {
//             padding: 0 4px;
//           }
          
//           .carousel-slider-${sliderId} .slide-content {
//             padding: 1rem;
//           }
          
//           .carousel-slider-${sliderId} .slide-title {
//             font-size: 1.1rem;
//           }
          
//           .carousel-slider-${sliderId} .slide-description {
//             font-size: 0.9rem;
//           }
//         }
        
//         @media (max-width: 480px) {
//           .slider-container-${uniqueId} {
//             padding: 0.5rem;
//           }
          
//           .carousel-slider-${sliderId} .slide-image-container {
//             height: 200px;
//           }
//         }
//       </style>
//     `

//     // Insert slider HTML
//     script.insertAdjacentHTML("afterend", sliderHTML)

//     // Load dependencies and initialize carousel
//     loadCarouselDependencies(sliderData, type)
//   }

//   function loadCarouselDependencies(sliderData, type) {
//     // Load jQuery if not present
//     if (typeof window.jQuery === "undefined") {
//       const jqueryScript = document.createElement("script")
//       jqueryScript.src = "https://code.jquery.com/jquery-3.6.0.min.js"
//       jqueryScript.onload = () => loadSlickCarousel(sliderData, type)
//       jqueryScript.onerror = () => {
//         console.error("Failed to load jQuery")
//         fallbackToSimpleSlider()
//       }
//       document.head.appendChild(jqueryScript)
//     } else {
//       loadSlickCarousel(sliderData, type)
//     }
//   }

//   function loadSlickCarousel(sliderData, type) {
//     // Load Slick CSS files
//     if (!document.querySelector('link[href*="slick.css"]')) {
//       const slickCSS = document.createElement("link")
//       slickCSS.rel = "stylesheet"
//       slickCSS.href = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"
//       document.head.appendChild(slickCSS)

//       const slickThemeCSS = document.createElement("link")
//       slickThemeCSS.rel = "stylesheet"
//       slickThemeCSS.href = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"
//       document.head.appendChild(slickThemeCSS)
//     }

//     // Load Slick JS
//     if (typeof window.jQuery === "undefined" || typeof window.jQuery.fn.slick === "undefined") {
//       const slickScript = document.createElement("script")
//       slickScript.src = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"
//       slickScript.onload = () => initializeSlickCarousel(sliderData, type)
//       slickScript.onerror = () => {
//         console.error("Failed to load Slick carousel")
//         fallbackToSimpleSlider()
//       }
//       document.head.appendChild(slickScript)
//     } else {
//       initializeSlickCarousel(sliderData, type)
//     }
//   }

//   function initializeSlickCarousel(sliderData, type) {
//     const sliderElement = document.getElementById(uniqueId)
//     const thumbnailElement = document.querySelector(`.slider-thumbnails-${uniqueId}`)

//     if (!sliderElement) {
//       console.error("Slider element not found:", uniqueId)
//       return
//     }

//     console.log("Initializing Slick carousel for:", uniqueId)

//     // Wait a bit for CSS to load
//     setTimeout(() => {
//       try {
//         const $slider = window.jQuery(sliderElement)

//         // Base configuration
//         const baseConfig = {
//           dots: true,
//           arrows: true,
//           infinite: sliderData.slides.length > 1,
//           autoplay: sliderData.slides.length > 1 && type !== "fade", // Disable autoplay for fade by default
//           autoplaySpeed: 4000,
//           speed: 600,
//           adaptiveHeight: true,
//           pauseOnHover: true,
//           pauseOnFocus: true,
//           responsive: [
//             {
//               breakpoint: 1024,
//               settings: {
//                 arrows: true,
//                 centerMode: type === "center",
//                 centerPadding: "40px",
//                 slidesToShow: Math.min(2, sliderData.slides.length),
//               },
//             },
//             {
//               breakpoint: 768,
//               settings: {
//                 arrows: false,
//                 centerMode: type === "center",
//                 centerPadding: "30px",
//                 slidesToShow: 1,
//               },
//             },
//             {
//               breakpoint: 480,
//               settings: {
//                 arrows: false,
//                 centerMode: false,
//                 centerPadding: "20px",
//                 slidesToShow: 1,
//               },
//             },
//           ],
//         }

//         // Type-specific configuration
//         let typeConfig = {}
//         switch (type) {
//           case "center":
//             typeConfig = {
//               centerMode: true,
//               centerPadding: "60px",
//               slidesToShow: Math.min(3, sliderData.slides.length),
//             }
//             break
//           case "fade":
//             typeConfig = {
//               fade: true,
//               slidesToShow: 1,
//               autoplay: false, // Fade looks better without autoplay
//             }
//             break
//           case "lazy":
//             typeConfig = {
//               lazyLoad: "ondemand",
//               slidesToShow: Math.min(3, sliderData.slides.length),
//             }
//             break
//           case "autoplay":
//             typeConfig = {
//               autoplay: true,
//               autoplaySpeed: 3000,
//               pauseOnHover: true,
//               pauseOnFocus: true,
//               slidesToShow: Math.min(3, sliderData.slides.length),
//             }
//             break
//           case "infinite":
//             typeConfig = {
//               infinite: true,
//               slidesToShow: Math.min(3, sliderData.slides.length),
//               slidesToScroll: 1,
//             }
//             break
//           case "variable":
//             typeConfig = {
//               variableWidth: true,
//               adaptiveHeight: true,
//               infinite: sliderData.slides.length > 1,
//             }
//             break
//           case "vertical":
//             typeConfig = {
//               vertical: true,
//               verticalSwiping: true,
//               slidesToShow: 1,
//               dots: false,
//             }
//             break
//           case "thumbnails":
//             typeConfig = {
//               slidesToShow: 1,
//               slidesToScroll: 1,
//               arrows: false,
//               fade: true,
//               asNavFor: `.slider-thumbnails-${uniqueId}`,
//             }
//             break
//           default:
//             typeConfig = {
//               centerMode: true,
//               centerPadding: "60px",
//               slidesToShow: Math.min(3, sliderData.slides.length),
//             }
//         }

//         // Initialize Slick
//         $slider.slick({ ...baseConfig, ...typeConfig })

//         // Initialize thumbnail navigation if needed
//         if (type === "thumbnails" && thumbnailElement) {
//           window.jQuery(thumbnailElement).slick({
//             slidesToShow: Math.min(5, sliderData.slides.length),
//             slidesToScroll: 1,
//             asNavFor: `#${uniqueId}`,
//             dots: false,
//             centerMode: true,
//             focusOnSelect: true,
//             arrows: false,
//             vertical: false,
//             infinite: sliderData.slides.length > 5,
//           })
//         }

//         console.log("Slick carousel initialized successfully")
//       } catch (error) {
//         console.error("Error initializing Slick carousel:", error)
//         fallbackToSimpleSlider()
//       }
//     }, 500) // Increased timeout for better CSS loading
//   }

//   function fallbackToSimpleSlider() {
//     console.log("Falling back to simple slider")
//     const sliderElement = document.getElementById(uniqueId)
//     if (sliderElement) {
//       sliderElement.style.display = "flex"
//       sliderElement.style.overflowX = "auto"
//       sliderElement.style.scrollBehavior = "smooth"
//       sliderElement.style.gap = "1rem"
//       sliderElement.style.padding = "1rem 0"

//       // Add scroll snap for better UX
//       sliderElement.style.scrollSnapType = "x mandatory"
//       const slides = sliderElement.querySelectorAll(".slide-item")
//       slides.forEach((slide) => {
//         slide.style.scrollSnapAlign = "center"
//         slide.style.flexShrink = "0"
//         slide.style.width = "300px"
//       })
//     }
//   }

//   function renderEmptySlider() {
//     const emptyHTML = `
//       <div id="${uniqueId}" class="simple-slider-empty" style="
//         text-align: center;
//         padding: 3rem 2rem;
//         background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
//         border-radius: 16px;
//         margin: 2rem auto;
//         max-width: 600px;
//         color: #666;
//         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//         box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//       ">
//         <div style="font-size: 3rem; margin-bottom: 1rem;">🎠</div>
//         <h3 style="margin: 0 0 0.5rem 0; color: #333; font-size: 1.5rem;">No slides available</h3>
//         <p style="margin: 0; font-size: 1rem; opacity: 0.8;">This slider doesn't have any slides yet.</p>
//       </div>
//     `
//     script.insertAdjacentHTML("afterend", emptyHTML)
//   }

//   function renderErrorSlider(errorMessage) {
//     const errorHTML = `
//       <div id="${uniqueId}" class="simple-slider-error" style="
//         text-align: center;
//         padding: 3rem 2rem;
//         background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
//         border: 2px solid #feb2b2;
//         border-radius: 16px;
//         margin: 2rem auto;
//         max-width: 600px;
//         color: #e53e3e;
//         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//         box-shadow: 0 4px 12px rgba(229, 62, 62, 0.1);
//       ">
//         <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
//         <h3 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;">Error loading slider</h3>
//         <p style="margin: 0; font-size: 0.95rem; opacity: 0.9;">${errorMessage}</p>
//       </div>
//     `
//     script.insertAdjacentHTML("afterend", errorHTML)
//   }
// })()


;(() => {
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

    // Create simple HTML structure for Slick
    const sliderHTML = `
      <div class="slider-container-${uniqueId}" style="max-width: 1000px; margin: 2rem auto; padding: 1rem;">
        <div id="${uniqueId}" class="${type}">
          ${sliderData.slides
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
            .join("")}
        </div>
        ${thumbnailsHTML}
      </div>
      
      <style>
        /* Minimal custom styles - let Slick handle the rest */
        .slider-container-${uniqueId} {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* Only customize dots color to match theme */
        #${uniqueId}.slick-slider .slick-dots li button:before {
          color: #008060;
        }
        
        #${uniqueId}.slick-slider .slick-dots li.slick-active button:before {
          color: #004c3f;
        }
        
        /* Only customize arrow colors */
        #${uniqueId}.slick-slider .slick-prev:before,
        #${uniqueId}.slick-slider .slick-next:before {
          color: #008060;
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

    if (!sliderElement) {
      console.error("Slider element not found:", uniqueId)
      return
    }

    console.log("Initializing Slick carousel for:", uniqueId, "Type:", type)

    // Wait for CSS to load
    setTimeout(() => {
      try {
        const $slider = window.jQuery(sliderElement)

        // Type-specific configuration - using pure Slick configurations
        let slickConfig = {}

        switch (type) {
          case "center":
            // Pure Slick center mode configuration
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
            // Pure Slick multiple items configuration
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

          case "thumbnails":
            slickConfig = {
              slidesToShow: 1,
              slidesToScroll: 1,
              arrows: false,
              fade: true,
              asNavFor: `.slider-thumbnails-${uniqueId}`,
            }
            break

          default:
            // Default to center mode
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

        console.log("Slick config:", slickConfig)

        // Initialize Slick with pure configuration
        $slider.slick(slickConfig)

        // Initialize thumbnail navigation if needed
        if (type === "thumbnails" && thumbnailElement) {
          window.jQuery(thumbnailElement).slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: `#${uniqueId}`,
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
    const emptyHTML = `
      <div id="${uniqueId}" class="simple-slider-empty" style="
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
        <h3 style="margin: 0 0 0.5rem 0; color: #333; font-size: 1.5rem;">No slides available</h3>
        <p style="margin: 0; font-size: 1rem; opacity: 0.8;">This slider doesn't have any slides yet.</p>
      </div>
    `
    script.insertAdjacentHTML("afterend", emptyHTML)
  }

  function renderErrorSlider(errorMessage) {
    const errorHTML = `
      <div id="${uniqueId}" class="simple-slider-error" style="
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
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;">Error loading slider</h3>
        <p style="margin: 0; font-size: 0.95rem; opacity: 0.9;">${errorMessage}</p>
      </div>
    `
    script.insertAdjacentHTML("afterend", errorHTML)
  }
})()
