if (!customElements.get('comparison-table-slider')) {
    class ComparisonTableSlider extends HTMLElement {
        constructor() {
            super();

            this.activeIndex = 0;
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.swipeThreshold = 40;

            this.onDotClick = this.onDotClick.bind(this);
            this.onTouchStart = this.onTouchStart.bind(this);
            this.onTouchEnd = this.onTouchEnd.bind(this);
        }

        connectedCallback() {
            this.slides = Array.from(this.querySelectorAll('[data-comparison-slide]'));
            this.section = this.closest('.comparison-table');
            this.dots = Array.from(this.section?.querySelectorAll('[data-comparison-dot]') || []);

            if (!this.slides.length) return;

            this.dots.forEach((dot) => {
            dot.addEventListener('click', this.onDotClick);
            });

            this.addEventListener('touchstart', this.onTouchStart, { passive: true });
            this.addEventListener('touchend', this.onTouchEnd);

            const initialIndex = this.slides.findIndex((slide) => slide.classList.contains('is-active'));
            this.activateSlide(initialIndex >= 0 ? initialIndex : 0);
        }

        disconnectedCallback() {
            this.dots?.forEach((dot) => {
            dot.removeEventListener('click', this.onDotClick);
            });

            this.removeEventListener('touchstart', this.onTouchStart);
            this.removeEventListener('touchend', this.onTouchEnd);
        }

        onDotClick(event) {
            const index = Number(event.currentTarget.dataset.comparisonDot);

            if (Number.isNaN(index)) return;

            this.activateSlide(index);
        }

        onTouchStart(event) {
            this.touchStartX = event.changedTouches[0].clientX;
        }

        onTouchEnd(event) {
            this.touchEndX = event.changedTouches[0].clientX;

            const distance = this.touchStartX - this.touchEndX;

            if (Math.abs(distance) < this.swipeThreshold) return;

            if (distance > 0) {
            this.nextSlide();
            } else {
            this.previousSlide();
            }
        }

        nextSlide() {
            const nextIndex =
            this.activeIndex >= this.slides.length - 1
                ? 0
                : this.activeIndex + 1;

            this.activateSlide(nextIndex);
        }

        previousSlide() {
            const previousIndex =
            this.activeIndex <= 0
                ? this.slides.length - 1
                : this.activeIndex - 1;

            this.activateSlide(previousIndex);
        }

        activateSlide(index) {
            this.activeIndex = index;

            this.slides.forEach((slide, slideIndex) => {
            const isActive = slideIndex === index;

            slide.classList.toggle('is-active', isActive);
            slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            });

            this.dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === index;

            dot.classList.toggle('is-active', isActive);
            dot.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
        }
    }
    customElements.define('comparison-table-slider', ComparisonTableSlider);
}