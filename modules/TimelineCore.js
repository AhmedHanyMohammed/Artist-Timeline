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

    // ========================================
    // VIEW SWITCHING
    // ========================================

    /**
     * Switch to Timeline view
     */
    async switchToTimeline() {
        // Extract release data from DOM
        const releases = this.dataExtractor.extractFromDOM(this.state.originalGridContainer);

        // Validate we have data to display
        if(!releases || releases.length === 0) {
            Spicetify.showNotification('No release found to display', true, 3000)
        }

        if(this.state.originalGridContainer){
            this.state.originalGridContainer.style.display = 'none';
        }

        // Render timeline view
        this.renderTimeline(releases);

        // Update state
        this.state.saveViewPref('timeline');
        this.state.update({ isTimelineActive: true });

        // Update button appearance
        if (this.state.injectedButton) {
            this.state.injectedButton.classList.add('timeline-view-button--active');
            this.state.injectedButton.setAttribute('aria-selected', 'true');
        }

        Spicetify.showNotification('Timeline view activated', false, 2000);
    }

    /**
     * Switch back to Grid view
     */
    switchToGrid() {
        // Remove timeline container
        if (this.state.timelineContainer) {
            this.state.timelineContainer.remove();
            this.state.update({timelineContainer: null});
        }

        // Restore original grid visibility
        if (this.state.originalGridContainer)
            this.state.originalGridContainer.style.display = '';

        // Update state
        this.state.saveViewPref('grid');
        this.state.update({ isTimelineActive: false });

        // Update button appearance
        if (this.state.injectedButton) {
            this.state.injectedButton.classList.remove('timeline-view-button--active');
            this.state.injectedButton.setAttribute('aria-selected', 'false');
        }

        Spicetify.showNotification('Grid view activated', false, 2000);
    }

    // ========================================
    // TIMELINE RENDERING
    // ========================================

    /**
     * Render the complete timeline view
     * @param {Array} releases - Array of release objects from DataExtractor
     */
    renderTimeline(releases) {
        // Clean up existing timeline if any
        if (this.state.timelineContainer)
            this.state.timelineContainer.remove();

        // Create timeline container
        const container = document.createElement('div');
        container.className = 'timeline-view';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Artist discography timeline');

        // Apply orientation from config
        const orientation = this.config.get('orientation') || 'horizontal';
        container.classList.add(`timeline--${orientation}`);

        // Create timeline track
        const track = document.createElement('div');
        track.className = 'timeline-track';
        track.setAttribute('aria-hidden', true);
        container.appendChild(track);

        // Create cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'timeline-cards';
        cardsContainer.setAttribute('role', 'list');

        // Render each release card
        releases.forEach((release, index) => {
            const card = this.createCard(release, index);
            cardsContainer.appendChild(card);
            }
        );

        container.appendChild(cardsContainer);

        // Insert timeline into DOM (right after the hidden grid)
        this.state.orginalGridContainer.parentNode.insertBefore(container,
            this.state.orginalGridContainer.nextSibling);

        // Save reference for cleanup
        this.state.update({ timelineContainer: container });
    }

    /**
     * * Create a single release card
     *      * @param {Object} release - Release data object
     *      * @param {number} index - Card index in timeline
     *      * @returns {HTMLElement} Card element
     */
    createCard(release, index) {
        const card = document.createElement('div');
        card.className = 'timeline-card';
        card.setAttribute('role', 'listitem');
        card.dataset.uri = release.uri;
        card.dataset.index = index;

        // Mark currently playing release
        if(release.isPlaying) {
            card.classList.add('timeline-card--playing');
            card.setAttribute('aria-current', 'true');
        }

        // Format release date
        const dataText = release.date ?
            release.date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
            }) : 'Unknown Date';

        // Card HTML structure
        card.innerHTML = `
        <div class="timeline-card__marker" aria-hidden="true"></div>
        <div class="timeline-card__content">
            <div class="timeline-card__image-wrapper">
                <img
                    src="${release.image}"
                    alt="${this.escapeHtml(release.name)}"
                    class="timeline-card__image"
                    loading="lazy"
                />
                <button
                    class="timeline-card__play-button"
                    aria-label="Play ${this.escapeHtml(release.name)}"
                    data-uri="${release.uri}"
                >
                    ${this.getPlayIcon()}
                </button>
            </div>
            <div class="timeline-card__info">
                <h3 class="timeline-card__title">${this.escapeHtml(release.name)}</h3>
                <div class="timeline-card__meta">
                    <span class="timeline-card__type">${release.type}</span>
                    <span class="timeline-card__separator" aria-hidden="true">•</span>
                    <time
                        class="timeline-card__date"
                        datetime="${release.date?.toISOString() || ''}"
                    >
                        ${dateText}
                    </time>
                </div>
            </div>
        </div>`;

        // Attach event listeners
        this.attachCardEventListeners(card, release);

        return card;
    }
}