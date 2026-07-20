/* ================================
   SlideEase Slider — enhanced logic
   ================================ */

   class SlideEaseSlider {
    constructor(root) {
      this.root = root;
      this.track = root.querySelector('.se-slider__track');
      this.slides = Array.from(root.querySelectorAll('.se-slide'));
      this.prevBtn = root.querySelector('.se-slider__arrow--prev');
      this.nextBtn = root.querySelector('.se-slider__arrow--next');
      this.dotsWrap = root.querySelector('.se-slider__dots');
      this.progressBar = root.querySelector('.se-slider__progress');
  
      this.count = this.slides.length;
      this.index = 0;
      this.autoplayMs = parseInt(root.dataset.autoplay || '4000', 10);
      this.autoplayEnabled = root.dataset.autoplay !== '0' && this.count > 1;
      this.timer = null;
      this.isDragging = false;
      this.startX = 0;
  
      if (this.count === 0 || !this.track) return;
  
      root.setAttribute('role', 'region');
      root.setAttribute('aria-roledescription', 'carousel');
      root.setAttribute('tabindex', '0');
  
      this._buildDots();
      this._bindEvents();
      this.goTo(0, false);
      if (this.autoplayEnabled) this._startAutoplay();
    }
  
    _buildDots() {
      if (!this.dotsWrap || this.count <= 1) return;
      this.dots = this.slides.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'se-slider__dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1} of ${this.count}`);
        dot.addEventListener('click', () => {
          this.goTo(i);
          this._restartAutoplay();
        });
        this.dotsWrap.appendChild(dot);
        return dot;
      });
    }
  
    _bindEvents() {
      this.nextBtn?.addEventListener('click', () => { this.next(); this._restartAutoplay(); });
      this.prevBtn?.addEventListener('click', () => { this.prev(); this._restartAutoplay(); });
  
      this.root.addEventListener('mouseenter', () => this._pauseAutoplay());
      this.root.addEventListener('mouseleave', () => this._resumeAutoplay());
      this.root.addEventListener('focusin', () => this._pauseAutoplay());
      this.root.addEventListener('focusout', () => this._resumeAutoplay());
  
      this.root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { this.next(); this._restartAutoplay(); }
        if (e.key === 'ArrowLeft') { this.prev(); this._restartAutoplay(); }
      });
  
      // Pointer-based swipe (touch + mouse drag)
      this.track.addEventListener('pointerdown', (e) => this._dragStart(e));
      this.track.addEventListener('pointermove', (e) => this._dragMove(e));
      this.track.addEventListener('pointerup', (e) => this._dragEnd(e));
      this.track.addEventListener('pointercancel', (e) => this._dragEnd(e));
  
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this._pauseAutoplay();
        else this._resumeAutoplay();
      });
    }
  
    _dragStart(e) {
      if (this.count <= 1) return;
      this.isDragging = true;
      this.startX = e.clientX;
      this.track.classList.add('is-dragging');
      this._pauseAutoplay();
      this.track.setPointerCapture(e.pointerId);
    }
  
    _dragMove(e) {
      if (!this.isDragging) return;
      const delta = e.clientX - this.startX;
      const percent = (delta / this.root.clientWidth) * 100;
      this.track.style.transform = `translateX(calc(${-this.index * 100}% + ${percent}%))`;
    }
  
    _dragEnd(e) {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.track.classList.remove('is-dragging');
      const delta = e.clientX - this.startX;
      const threshold = this.root.clientWidth * 0.15;
      if (delta > threshold) this.prev();
      else if (delta < -threshold) this.next();
      else this.goTo(this.index);
      this._resumeAutoplay();
    }
  
    goTo(i, animate = true) {
      this.index = (i + this.count) % this.count;
      this.track.style.transition = animate ? '' : 'none';
      this.track.style.transform = `translateX(-${this.index * 100}%)`;
      if (!animate) {
        // force reflow so the disabled transition takes effect before restoring it
        void this.track.offsetHeight;
        this.track.style.transition = '';
      }
  
      this.slides.forEach((s, idx) => s.setAttribute('aria-hidden', idx === this.index ? 'false' : 'true'));
      this.dots?.forEach((d, idx) => d.classList.toggle('is-active', idx === this.index));
      this._restartProgress();
    }
  
    next() { this.goTo(this.index + 1); }
    prev() { this.goTo(this.index - 1); }
  
    _startAutoplay() {
      this._restartProgress();
      this.timer = setInterval(() => this.goTo(this.index + 1), this.autoplayMs);
    }
  
    _pauseAutoplay() {
      clearInterval(this.timer);
      this.timer = null;
      if (this.progressBar) this.progressBar.style.transition = 'none';
    }
  
    _resumeAutoplay() {
      if (this.autoplayEnabled && !this.timer) this._startAutoplay();
    }
  
    _restartAutoplay() {
      if (!this.autoplayEnabled) return;
      clearInterval(this.timer);
      this._startAutoplay();
    }
  
    _restartProgress() {
      if (!this.progressBar || !this.autoplayEnabled) return;
      this.progressBar.style.transition = 'none';
      this.progressBar.style.width = '0%';
      requestAnimationFrame(() => {
        this.progressBar.style.transition = `width ${this.autoplayMs}ms linear`;
        this.progressBar.style.width = '100%';
      });
    }
  
    destroy() {
      clearInterval(this.timer);
    }
  }
  
  function initSlideEaseSliders(scope = document) {
    scope.querySelectorAll('.se-slider').forEach((el) => {
      if (el.dataset.seInit) return;
      el.dataset.seInit = 'true';
      el._slideEaseInstance = new SlideEaseSlider(el);
    });
  }
  
  document.addEventListener('DOMContentLoaded', () => initSlideEaseSliders());