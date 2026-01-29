/**
 * TimelineCore - Orchestrates timeline view rendering and interactions
 * 
 * Delegates responsibilities to:
 * - FilterManager: Filter detection & observation
 * - MenuInjector: Dropdown menu injection
 * - ViewSwitcher: View switching logic
 * - HorizontalView/VerticalView: Rendering
 */
class TimelineCore {
    constructor(config, state) {
        this.config = config;
        this.state = state;
        this.dataExtractor = null;
        this.discographyContainer = null;
        this.releases = null;

        // Initialize view renderers
        this.horizontalView = new HorizontalView(this);
        this.verticalView = new VerticalView(this);

        // Initialize option managers
        this.filterManager = new FilterManager(this);
        this.menuInjector = new MenuInjector(this);
        this.viewSwitcher = new ViewSwitcher(this);
    }

    /**
     * Initialize the timeline core and all sub-modules
     * @param {HTMLElement} discographyContainer - The discography container
     * @param {DataExtractor} dataExtractor - Data extraction instance
     */
    async initialize(discographyContainer, dataExtractor) {
        this.discographyContainer = discographyContainer;
        this.dataExtractor = dataExtractor;

        // Initialize sub-modules
        this.filterManager.initialize(discographyContainer);
        await this.menuInjector.initialize(discographyContainer);

        // Restore previous view if it was a timeline
        if (this.state.currentView === 'timeline-horizontal' || 
            this.state.currentView === 'timeline-vertical') {
            await this.viewSwitcher.switchToTimeline(this.state.currentView);
        }
    }

    /**
     * Clean up all resources
     */
    destroy() {
        if (this.state.timelineContainer) {
            this.state.timelineContainer.remove();
        }
        if (this.state.originalGridContainer) {
            this.state.originalGridContainer.style.display = '';
        }
        
        // Destroy sub-modules
        this.filterManager.destroy();
        this.menuInjector.destroy();
        
        this.discographyContainer = null;
        this.dataExtractor = null;
        this.releases = null;
    }

    /**
     * Called by FilterManager when filter changes
     */
    async onFilterChange() {
        // Find updated grid container
        const newContainer = await this.filterManager.findUpdatedGridContainer();
        if (newContainer) {
            this.state.update({ originalGridContainer: newContainer });
        }
        
        // Refresh the view
        await this.viewSwitcher.refresh();
    }

    /**
     * Render the timeline with given releases
     * @param {Array} releases - Array of release objects
     */
    renderTimeline(releases) {
        this.releases = releases;
        
        // Remove existing timeline
        if (this.state.timelineContainer) {
            this.state.timelineContainer.remove();
        }

        // Create new container
        const container = document.createElement('div');
        container.className = 'timeline-view';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Artist discography timeline');

        // Add filter indicator
        const currentFilter = this.filterManager.getCurrentFilter();
        if (currentFilter !== 'all') {
            container.setAttribute('data-filter', currentFilter);
        }

        // Render based on orientation
        const orientation = this.config.get('orientation') || 'horizontal';
        if (orientation === 'horizontal') {
            this.horizontalView.render(container, releases);
        } else {
            this.verticalView.render(container, releases);
        }

        // Insert into DOM
        this.state.originalGridContainer.parentNode.insertBefore(
            container, 
            this.state.originalGridContainer.nextSibling
        );
        this.state.update({ timelineContainer: container });
    }

    /**
     * Create a timeline card element
     * @param {Object} release - Release data object
     * @param {number} index - Card index
     * @returns {HTMLElement} Card element
     */
    createCard(release, index) {
        const card = document.createElement('div');
        card.className = 'timeline-card';
        card.setAttribute('role', 'listitem');
        card.dataset.uri = release.uri;
        card.dataset.index = index;
        card.dataset.type = release.type?.toLowerCase() || 'album';

        if (release.isPlaying) {
            card.classList.add('timeline-card--playing');
            card.setAttribute('aria-current', 'true');
        }

        const dateText = release.date
            ? release.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
            : 'Unknown Date';

        card.innerHTML = `
            <div class="timeline-card__marker" aria-hidden="true"></div>
            <div class="timeline-card__content">
                <div class="timeline-card__image-wrapper">
                    <img src="${release.image}" alt="${this.escapeHtml(release.name)}" 
                         class="timeline-card__image" loading="lazy" />
                    <button class="timeline-card__play-button" 
                            aria-label="Play ${this.escapeHtml(release.name)}" 
                            data-uri="${release.uri}">
                        ${this.getPlayIcon()}
                    </button>
                </div>
                <div class="timeline-card__info">
                    <h3 class="timeline-card__title">${this.escapeHtml(release.name)}</h3>
                    <div class="timeline-card__meta">
                        <span class="timeline-card__type">${release.type}</span>
                        <span class="timeline-card__separator">•</span>
                        <time class="timeline-card__date" datetime="${release.date?.toISOString() || ''}">
                            ${dateText}
                        </time>
                    </div>
                </div>
            </div>
        `;

        this.attachCardListeners(card, release);
        return card;
    }

    /**
     * Attach event listeners to a card
     * @param {HTMLElement} card - Card element
     * @param {Object} release - Release data
     */
    attachCardListeners(card, release) {
        // Play button
        const playButton = card.querySelector('.timeline-card__play-button');
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                e.stopPropagation();
                Spicetify.Player.playUri(release.uri);
            });
        }

        // Card click - navigate to album
        card.addEventListener('click', () => {
            const albumID = release.uri.split(':')[2];
            Spicetify.Platform.History.push(`/album/${albumID}`);
        });

        // Keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    }

    /**
     * Calculate spacing between cards based on release dates
     * @param {Object} prevRelease - Previous release
     * @param {Object} currentRelease - Current release
     * @returns {number} Spacing in pixels
     */
    calculateSpacing(prevRelease, currentRelease) {
        const minSpacing = this.config.get('minSpacing') || 40;
        const maxSpacing = this.config.get('maxSpacing') || 250;
        const pixelsPerDay = 0.2;

        if (!prevRelease.date || !currentRelease.date) return minSpacing;

        const timeDiff = Math.abs(currentRelease.date - prevRelease.date);
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        const spacing = minSpacing + (daysDiff * pixelsPerDay);

        return Math.max(minSpacing, Math.min(maxSpacing, spacing));
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get play icon SVG
     * @returns {string} SVG HTML
     */
    getPlayIcon() {
        return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>`;
    }
}