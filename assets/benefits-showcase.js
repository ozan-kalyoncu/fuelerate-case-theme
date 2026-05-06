if (!customElements.get('benefits-showcase')) {
    class BenefitsShowcase extends HTMLElement {
        constructor() {
            super();

            this.onTabClick = this.onTabClick.bind(this);
            this.onAccordionClick = this.onAccordionClick.bind(this);
            this.onBreakpointChange = this.onBreakpointChange.bind(this);

            this.onShopifyBlockSelect = this.onShopifyBlockSelect.bind(this);

            this.mediaQuery = window.matchMedia('(min-width: 750px)');
        }

        connectedCallback() {
            this.tabs = this.querySelectorAll('[data-benefit-tab]');
            this.accordions = this.querySelectorAll('[data-benefit-accordion]');
            this.panels = this.querySelectorAll('[data-benefit-panel]');
            this.images = this.querySelectorAll('[data-benefit-image]');

            this.tabs.forEach((tab) => {
            tab.addEventListener('click', this.onTabClick);
            });

            this.accordions.forEach((accordion) => {
            accordion.addEventListener('click', this.onAccordionClick);
            });

            this.mediaQuery.addEventListener('change', this.onBreakpointChange);

            this.syncToActiveState();

            this.addEventListener('shopify:block:select', this.onShopifyBlockSelect);
        }

        disconnectedCallback() {
            this.tabs?.forEach((tab) => {
            tab.removeEventListener('click', this.onTabClick);
            });

            this.accordions?.forEach((accordion) => {
            accordion.removeEventListener('click', this.onAccordionClick);
            });

            this.mediaQuery.removeEventListener('change', this.onBreakpointChange);

            this.removeEventListener('shopify:block:select', this.onShopifyBlockSelect);
        }

        onShopifyBlockSelect(event) {
            if (!this.contains(event.target)) return;

            const selectedElement = event.target;

            const tab =
                selectedElement.matches('[data-benefit-tab]')
                ? selectedElement
                : selectedElement.querySelector('[data-benefit-tab]');

            const accordion =
                selectedElement.matches('[data-benefit-accordion]')
                ? selectedElement
                : selectedElement.querySelector('[data-benefit-accordion]');

            const panel =
                selectedElement.matches('[data-benefit-panel]')
                ? selectedElement
                : selectedElement.querySelector('[data-benefit-panel]');

            const targetId =
                tab?.getAttribute('aria-controls') ||
                accordion?.getAttribute('aria-controls') ||
                panel?.id;

            if (!targetId) return;

            this.activateItem(targetId);
        }

        onTabClick(event) {
            const tab = event.currentTarget;
            const targetId = tab.getAttribute('aria-controls');

            this.activateItem(targetId);
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

            return;
            }

            this.activateItem(targetId);
        }

        onBreakpointChange() {
            this.syncToActiveState();
        }

        activateItem(targetId) {
            this.tabs.forEach((tab) => {
            const isActive = tab.getAttribute('aria-controls') === targetId;

            tab.classList.toggle('is-active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
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