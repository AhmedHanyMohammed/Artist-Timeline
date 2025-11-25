/**
 * TimelineCore - Manages timeline view rendering and interactions
 *
 * Responsibilities:
 * - Inject Timeline button into controls bar
 * - Render timeline view (horizontal/vertical layouts)
 * - Create individual release cards with hover/click behaviors
 * - Handle view switching between grid ↔ timeline
 * - Manage all timeline-related event listeners
 * - Load external CSS stylesheet
 *
 * NOTE: Styles are in styles/timeline.css (loaded externally)
 */
class TimelineCore {
    constructor(config, state) {
        this.config = config;
        this.state = state;
        this.dataExtractor = null;
        this.discographyContainer = null;
        this.cssLoaded = false;

        this.loadStyles();
    }

    /**
     * Initialize timeline on artist page
     * @param {HTMLElement} discographyContainer - The discography section
     * @param {DataExtractor} dataExtractor - Data extraction module
     */
    async init(discographyContainer, dataExtractor) {
        this.discographyContainer = discographyContainer;
        this.dataExtractor = dataExtractor;

        // Find the control bar
        const controlsBar = this.findControlsBar(discographyContainer);

        if(this.state.currentView === 'timeline')
            await this.switchToTimeline();
    }

    destroy() {
        console.log('[TimelineCore] Destroying timeline instance');

        // Remove timeline container
        if (this.state.timelineContainer) {
            this.state.timelineContainer.remove();
        }

        // Remove injected button
        if (this.state.injectedButton) {
            this.state.injectedButton.remove();
        }

        // Restore original grid visibility
        if (this.state.originalGridContainer) {
            this.state.originalGridContainer.style.display = '';
        }

        // Reset state
        this.discographyContainer = null;
        this.dataExtractor = null;
    }

    /**
     * Find the controls bar where Grid/List buttons are located
     * @param {HTMLElement} container - Discography container to search within
     * @returns {HTMLElement|null} Controls bar element or null
     */
    findControlsBar(container) {
        const selectors = [
            '[role="toolbar"]',              // Standard ARIA toolbar
            '[role="controls"]',             // Custom controls role
            '.view-header-controls',         // Common Spotify class
            '[class*="filterButton"]',       // Filter button container
            '[class*="viewControls"]',       // View controls container
            '[class*="toolbar"]'             // Generic toolbar class
        ];

        for (const selector of selectors) {
            const element = container.querySelector(selector);
            if (element) {
                console.log(`[TimelineCore] Found controls bar: ${selector}`);
                return element;
            }
        }

        // If no controls bar found, try searching in parent containers
        let parent = container.parentElement;
        let attempts = 0;

        while (parent && attempts < 3) {
            for (const selector of selectors) {
                const element = parent.querySelector(selector);
                if (element) {
                    console.log(`[TimelineCore] Found controls bar in parent: ${selector}`);
                    return element;
                }
            }
            parent = parent.parentElement;
            attempts++;
        }
        return null;
    }

    /**
     * Inject Timeline button into controls bar
     * @param {HTMLElement} controlsBar - The controls bar element
     */
    injectTimelineButton(controlsBar) {
        // Prevent duplicate injection
        if (this.state.injectedButton) return;

        const button = document.createElement('button');
        button.className = 'timeline-view-button';
        button.textContent = 'Timeline';
        button.setAttribute('aria-label', 'Timeline view');
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', this.state.currentView === 'timeline');

        // Mark as active if timeline is current view
        if (this.state.currentView === 'timeline')
            button.classList.add('timeline-view-button--active');

        // Attach click handler
        button.addEventListener('click', () => this.handleButtonClick());

        // Insert button into controls bar
        controlsBar.appendChild(button);

        // Save reference for cleanup
        this.state.update({ injectedButton: button });
    }

    /**
     * Handle Timeline button click - toggle between views
     */
    async handleButtonClick() {
        if (this.state.isTimelineActive) {
            // Currently showing timeline - switch back to grid
            this.switchToGrid();
        } else {
            // Currently showing grid - switch to timeline
            await this.switchToTimeline();
        }
    }
}