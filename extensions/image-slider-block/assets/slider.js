document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.slider').forEach(slider => {
    const sliderId = slider.id;
    const slides = slider.querySelectorAll('.slide');
    const prevButton = slider.querySelector(`.slider-prev[data-slider-id="${sliderId}"]`);
    const nextButton = slider.querySelector(`.slider-next[data-slider-id="${sliderId}"]`);
    let currentIndex = 0;

    // Show first slide
    if (slides.length > 0) {
      slides[currentIndex].classList.add('active');
    }

    // Next slide
    nextButton.addEventListener('click', () => {
      slides[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('active');
    });

    // Previous slide
    prevButton.addEventListener('click', () => {
      slides[currentIndex].classList.remove('active');
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      slides[currentIndex].classList.add('active');
    });

    // Auto-slide every 3 seconds
    let autoSlide = setInterval(() => {
      slides[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('active');
    }, 3000);

    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(autoSlide));
    slider.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
      }, 3000);
    });
  });
});