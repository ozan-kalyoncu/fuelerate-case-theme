if (!customElements.get('benefits-showcase')) {
    class BenefitsShowcase extends HTMLElement {
        constructor() {
            super();

            this.onTabClick = this.onTabClick.bind(this);
            this.onAccordionClick = this.onAccordionClick.bind(this);
            this.onBreakpointChange = this.onBreakpointChange.bind(this);
            this.onShopifyBlockSelect = this.onShopifyBlockSelect.bind(this);

            this.mediaQuery = window.matchMedia('(min-width: 750px)');
            this.autoSlideInterval = null;
            this.autoSlideDelay = 10000;
        }

        connectedCallback() {
            this.tabs = this.querySelectorAll('[data-benefit-tab]');
            this.accordions = this.querySelectorAll('[data-benefit-accordion]');
            this.panels = this.querySelectorAll('[data-benefit-panel]');
            this.images = this.querySelectorAll('[data-benefit-image]');
            this.enableAutoSlide = this.dataset.autoSlide === 'true';

            this.prevButton = this.querySelector('[data-benefits-prev]');
            this.nextButton = this.querySelector('[data-benefits-next]');

            this.onPrevClick = this.onPrevClick.bind(this);
            this.onNextClick = this.onNextClick.bind(this);

            this.prevButton?.addEventListener('click', this.onPrevClick);
            this.nextButton?.addEventListener('click', this.onNextClick);

            this.tabs.forEach((tab) => {
            tab.addEventListener('click', this.onTabClick);
            });

            this.accordions.forEach((accordion) => {
            accordion.addEventListener('click', this.onAccordionClick);
            });

            this.mediaQuery.addEventListener('change', this.onBreakpointChange);
            document.addEventListener('shopify:block:select', this.onShopifyBlockSelect);

            this.syncToActiveState();
            this.startAutoSlide();
        }

        disconnectedCallback() {
            this.stopAutoSlide();

            this.prevButton?.removeEventListener('click', this.onPrevClick);
            this.nextButton?.removeEventListener('click', this.onNextClick);

            this.tabs?.forEach((tab) => {
            tab.removeEventListener('click', this.onTabClick);
            });

            this.accordions?.forEach((accordion) => {
            accordion.removeEventListener('click', this.onAccordionClick);
            });

            this.mediaQuery.removeEventListener('change', this.onBreakpointChange);
            document.removeEventListener('shopify:block:select', this.onShopifyBlockSelect);
        }

        goToPreviousItem() {
            const activeTabIndex = Array.from(this.tabs).findIndex((tab) =>
                tab.classList.contains('is-active')
            );

            const previousIndex =
                activeTabIndex <= 0
                    ? this.tabs.length - 1
                    : activeTabIndex - 1;

            const previousTargetId = this.tabs[previousIndex]?.getAttribute('aria-controls');

            if (!previousTargetId) return;

            this.activateItem(previousTargetId);
        }

        onPrevClick() {
            this.goToPreviousItem();
            this.resetAutoSlide();
        }

        onNextClick() {
            this.goToNextItem();
            this.resetAutoSlide();
        }

        onTabClick(event) {
            const tab = event.currentTarget;
            const targetId = tab.getAttribute('aria-controls');

            this.activateItem(targetId);
            this.resetAutoSlide();
        }

        onAccordionClick(event) {
            const accordion = event.currentTarget;
            const targetId = accordion.getAttribute('aria-controls');
            const isOpen = accordion.getAttribute('aria-expanded') === 'true';

            if (isOpen) {
            accordion.classList.remove('is-active');
            accordion.setAttribute('aria-expanded', 'false');

            const panel = this.getPanel(targetId);
            if (panel) {
                panel.classList.remove('is-active');
                panel.hidden = true;
            }

            this.resetAutoSlide();
            return;
            }

            this.activateItem(targetId);
            this.resetAutoSlide();
        }

        startAutoSlide() {
            if ( !this.enableAutoSlide || this.tabs.length <= 1 || !this.mediaQuery.matches ) return;

            this.stopAutoSlide();

            this.autoSlideInterval = window.setInterval(() => {
                this.goToNextItem();
            }, this.autoSlideDelay);
        }

        stopAutoSlide() {
            if (!this.autoSlideInterval) return;

            window.clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }

        resetAutoSlide() {
            if (!this.enableAutoSlide) return;

            this.startAutoSlide();
        }

        goToNextItem() {
            const activeTabIndex = Array.from(this.tabs).findIndex((tab) =>
            tab.classList.contains('is-active')
            );

            const nextIndex =
            activeTabIndex === -1 || activeTabIndex === this.tabs.length - 1
                ? 0
                : activeTabIndex + 1;

            const nextTargetId = this.tabs[nextIndex]?.getAttribute('aria-controls');

            if (!nextTargetId) return;

            this.activateItem(nextTargetId);
        }

        onBreakpointChange() {
            this.syncToActiveState();

            if (this.mediaQuery.matches) {
                this.startAutoSlide();
            } else {
                this.stopAutoSlide();
            }
        }

        onShopifyBlockSelect(event) {
            if (!this.contains(event.target)) return;

            const selectedElement = event.target;

            const tab = selectedElement.matches('[data-benefit-tab]')
            ? selectedElement
            : selectedElement.querySelector('[data-benefit-tab]');

            const accordion = selectedElement.matches('[data-benefit-accordion]')
            ? selectedElement
            : selectedElement.querySelector('[data-benefit-accordion]');

            const panel = selectedElement.matches('[data-benefit-panel]')
            ? selectedElement
            : selectedElement.querySelector('[data-benefit-panel]');

            const targetId =
            tab?.getAttribute('aria-controls') ||
            accordion?.getAttribute('aria-controls') ||
            panel?.id;

            if (!targetId) return;

            this.activateItem(targetId);
            this.resetAutoSlide();
        }

        activateItem(targetId) {
            this.tabs.forEach((tab) => {
            const isActive = tab.getAttribute('aria-controls') === targetId;

            tab.classList.toggle('is-active', isActive);
            });

            this.accordions.forEach((accordion) => {
            const isActive = accordion.getAttribute('aria-controls') === targetId;

            accordion.classList.toggle('is-active', isActive);
            accordion.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            });

            this.panels.forEach((panel) => {
            const isActive = panel.id === targetId;

            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
            });

            this.images.forEach((image) => {
            const isActive = image.dataset.panelId === targetId;

            image.classList.toggle('is-active', isActive);
            });
        }

        syncToActiveState() {
            const activeTab = Array.from(this.tabs).find((tab) => tab.classList.contains('is-active'));
            const activeAccordion = Array.from(this.accordions).find(
            (accordion) => accordion.getAttribute('aria-expanded') === 'true'
            );

            const targetId =
            activeTab?.getAttribute('aria-controls') ||
            activeAccordion?.getAttribute('aria-controls') ||
            this.tabs[0]?.getAttribute('aria-controls') ||
            this.accordions[0]?.getAttribute('aria-controls');

            if (!targetId) return;

            this.activateItem(targetId);
        }

        getPanel(id) {
            return this.querySelector(`#${CSS.escape(id)}`);
        }
    }
    customElements.define('benefits-showcase', BenefitsShowcase);
}