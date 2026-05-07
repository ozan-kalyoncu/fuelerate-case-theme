if (!customElements.get('video-popups')) {
    class VideoPopups extends HTMLElement {
        constructor() {
            super();

            this.onTriggerClick = this.onTriggerClick.bind(this);
            this.onCloseClick = this.onCloseClick.bind(this);
            this.onKeydown = this.onKeydown.bind(this);
        }

        connectedCallback() {
            this.triggers = this.querySelectorAll('[data-video-popup-trigger]');
            this.closeButtons = this.querySelectorAll('[data-video-popup-close]');

            this.triggers.forEach((trigger) => {
            trigger.addEventListener('click', this.onTriggerClick);
            });

            this.closeButtons.forEach((button) => {
            button.addEventListener('click', this.onCloseClick);
            });

            document.addEventListener('keydown', this.onKeydown);
        }

        disconnectedCallback() {
            this.triggers?.forEach((trigger) => {
            trigger.removeEventListener('click', this.onTriggerClick);
            });

            this.closeButtons?.forEach((button) => {
            button.removeEventListener('click', this.onCloseClick);
            });

            document.removeEventListener('keydown', this.onKeydown);
        }

        onTriggerClick(event) {
            const trigger = event.currentTarget;
            const modal = document.getElementById(trigger.dataset.videoId);

            if (!modal) return;

            modal.hidden = false;
            document.body.classList.add('body-overflow-hidden');
        }

        onCloseClick(event) {
            const modal = event.currentTarget.closest('[data-video-popup-modal]');

            if (!modal) return;

            this.closeModal(modal);
        }

        onKeydown(event) {
            if (event.key !== 'Escape') return;

            this.querySelectorAll('[data-video-popup-modal]:not([hidden])').forEach((modal) => {
            this.closeModal(modal);
            });
        }

        closeModal(modal) {
            const video = modal.querySelector('video');

            if (video) video.pause();

            modal.hidden = true;
            document.body.classList.remove('body-overflow-hidden');
        }
    }
    customElements.define('video-popups', VideoPopups);
}
if (!customElements.get('product-tabs')) {
    class ProductTabs extends HTMLElement {
        constructor() {
            super();

            this.onTabClick = this.onTabClick.bind(this);
            this.onAccordionClick = this.onAccordionClick.bind(this);
            this.onBreakpointChange = this.onBreakpointChange.bind(this);

            this.mediaQuery = window.matchMedia('(min-width: 750px)');
        }

        connectedCallback() {
            this.tabButtons = this.querySelectorAll('[data-tab-button]');
            this.accordionButtons = this.querySelectorAll('[data-tab-accordion-button]');
            this.panels = this.querySelectorAll('[data-tab-accordion-panel]');

            this.tabButtons.forEach((btn) => {
            btn.addEventListener('click', this.onTabClick);
            });

            this.accordionButtons.forEach((btn) => {
            btn.addEventListener('click', this.onAccordionClick);
            });

            this.mediaQuery.addEventListener('change', this.onBreakpointChange);

            this.syncToActiveState();
        }

        disconnectedCallback() {
            this.tabButtons?.forEach((btn) => {
            btn.removeEventListener('click', this.onTabClick);
            });

            this.accordionButtons?.forEach((btn) => {
            btn.removeEventListener('click', this.onAccordionClick);
            });

            this.mediaQuery.removeEventListener('change', this.onBreakpointChange);
        }

        onTabClick(event) {
            const button = event.currentTarget;
            const targetId = button.getAttribute('aria-controls');

            this.activatePanel(targetId);
        }

        onAccordionClick(event) {
            const button = event.currentTarget;
            const targetId = button.getAttribute('aria-controls');
            const isOpen = button.getAttribute('aria-expanded') === 'true';

            if (isOpen) {
            button.setAttribute('aria-expanded', 'false');

            const panel = this.getPanel(targetId);
            if (panel) panel.hidden = true;

            return;
            }

            this.activatePanel(targetId);
        }

        onBreakpointChange() {
            this.syncToActiveState();
        }

        activatePanel(targetId) {
            this.tabButtons.forEach((btn) => {
            const isActive = btn.getAttribute('aria-controls') === targetId;

            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            this.accordionButtons.forEach((btn) => {
            const isActive = btn.getAttribute('aria-controls') === targetId;

            btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            });

            this.panels.forEach((panel) => {
            panel.hidden = panel.id !== targetId;
            });
        }

        syncToActiveState() {
            const openAccordion = Array.from(this.accordionButtons).find(
            (btn) => btn.getAttribute('aria-expanded') === 'true'
            );

            const activeTab = Array.from(this.tabButtons).find((btn) =>
            btn.classList.contains('is-active')
            );

            const targetId =
            openAccordion?.getAttribute('aria-controls') ||
            activeTab?.getAttribute('aria-controls') ||
            this.tabButtons[0]?.getAttribute('aria-controls') ||
            this.accordionButtons[0]?.getAttribute('aria-controls');

            if (!targetId) return;

            this.activatePanel(targetId);
        }

        getPanel(id) {
            return this.querySelector(`#${CSS.escape(id)}`);
        }
    }
    customElements.define('product-tabs', ProductTabs);
}