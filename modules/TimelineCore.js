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
    async initialize(discographyContainer, dataExtractor) {
        this.discographyContainer = discographyContainer;
        this.dataExtractor = dataExtractor;

        // Find the control bar
        const controlsBar = this.findControlsBar(discographyContainer);
        
        // Inject Timeline button if controls bar found
        if (controlsBar) {
            this.injectTimelineButton(controlsBar);
        }

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

        // Apply proportional spacing if enabled
        const proportionalSpacing = this.config.get('proportionalSpacing') || false;
        if (proportionalSpacing) {
            container.setAttribute('data-proportional-spacing', 'true');
        }

        // Create timeline track
        const track = document.createElement('div');
        track.className = 'timeline-track';
        track.setAttribute('aria-hidden', true);
        container.appendChild(track);

        // Create cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'timeline-cards';
        cardsContainer.setAttribute('role', 'list');

        // Render each release card with optional proportional spacing
        releases.forEach((release, index) => {
            const card = this.createCard(release, index);
            
            // Apply proportional spacing if enabled
            if (proportionalSpacing && index > 0) {
                const spacing = this.calculateSpacing(releases[index - 1], release);
                if (orientation === 'horizontal') {
                    card.style.marginLeft = `${spacing}px`;
                } else {
                    card.style.marginTop = `${spacing}px`;
                }
            }
            
            cardsContainer.appendChild(card);
        });

        container.appendChild(cardsContainer);

        // Add scroll buttons if enabled and horizontal
        if (this.config.get('showScrollButtons') && orientation === 'horizontal') {
            this.addScrollButtons(container, cardsContainer);
        }

        // Add mouse wheel scroll support for horizontal layout
        if (orientation === 'horizontal') {
            this.addMouseWheelScroll(container);
        }

        // Insert timeline into DOM (right after the hidden grid)
        this.state.originalGridContainer.parentNode.insertBefore(container,
            this.state.originalGridContainer.nextSibling);

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
        const dateText = release.date ?
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
        this.attachCardListeners(card, release);

        return card;
    }

    /**
     * Attach event listeners to card elements
     * @param {HTMLElement} card - Card element
     * @param {Object} release - Release data object
     */
    attachCardListeners(card, release) {
        // Play button click - play album without navigating
        const playButton = card.querySelector('.timeline-card__play-button');
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                Spicetify.Player.playUri(release.uri);
            });
        }

        // Card click - navigate to release page
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

    // ========================================
    // SCROLL FUNCTIONALITY
    // ========================================

    /**
     * Add scroll buttons to timeline container
     * @param {HTMLElement} container - Timeline container
     * @param {HTMLElement} cardsContainer - Cards container
     */
    addScrollButtons(container, cardsContainer) {
        // Left scroll button
        const leftButton = document.createElement('button');
        leftButton.className = 'timeline-scroll-button timeline-scroll-button--left';
        leftButton.setAttribute('aria-label', 'Scroll left');
        leftButton.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
        `;

        // Right scroll button
        const rightButton = document.createElement('button');
        rightButton.className = 'timeline-scroll-button timeline-scroll-button--right';
        rightButton.setAttribute('aria-label', 'Scroll right');
        rightButton.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
        `;

        // Scroll amount (one card width approximately)
        const scrollAmount = 250;

        // Attach click handlers
        leftButton.addEventListener('click', () => {
            container.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        rightButton.addEventListener('click', () => {
            container.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        // Update button states on scroll
        const updateButtonStates = () => {
            const isAtStart = container.scrollLeft <= 0;
            const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;

            leftButton.disabled = isAtStart;
            rightButton.disabled = isAtEnd;
        };

        // Initial state
        updateButtonStates();

        // Update on scroll
        container.addEventListener('scroll', DOMUtils.debounce(updateButtonStates, 100));

        // Add buttons to container
        container.appendChild(leftButton);
        container.appendChild(rightButton);
    }

    /**
     * Add mouse wheel horizontal scroll support
     * @param {HTMLElement} container - Timeline container
     */
    addMouseWheelScroll(container) {
        const handleWheel = DOMUtils.debounce((e) => {
            // Only handle horizontal scroll if not already scrolling vertically
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                container.scrollBy({
                    left: e.deltaY,
                    behavior: 'smooth'
                });
            }
        }, 10);

        container.addEventListener('wheel', handleWheel, { passive: false });
    }

    /**
     * Calculate spacing between two releases for proportional spacing
     * @param {Object} prevRelease - Previous release
     * @param {Object} currentRelease - Current release
     * @returns {number} Spacing in pixels
     */
    calculateSpacing(prevRelease, currentRelease) {
        const minSpacing = this.config.get('minSpacing') || 20;
        const maxSpacing = this.config.get('maxSpacing') || 200;

        // If either release doesn't have a date, use default spacing
        if (!prevRelease.date || !currentRelease.date) {
            return minSpacing;
        }

        // Calculate time difference in days
        const timeDiff = Math.abs(currentRelease.date - prevRelease.date);
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

        // Map days to spacing (logarithmic scale for better distribution)
        // 0 days = minSpacing, 365 days = ~halfway, 3650 days (10 years) = maxSpacing
        const spacing = minSpacing + (Math.log(daysDiff + 1) / Math.log(3650)) * (maxSpacing - minSpacing);

        // Clamp to min/max
        return Math.max(minSpacing, Math.min(maxSpacing, spacing));
    }

    // ========================================
    // CSS LOADING
    // ========================================

    /**
     * Load external CSS file
     * Uses relative path from extension directory
     */
    loadStyles() {
        if (this.cssLoaded) return;

        // Check if style already loaded
        if (document.getElementById('artist-timeline-styles')) {
            this.cssLoaded = true;
            return;
        }

        // Create link element for stylesheet
        const link = document.createElement('link');
        link.id = 'artist-timeline-styles';
        link.rel = 'stylesheet';
        link.type = 'text/css';

        // Path is relative to the extension directory
        // Spicetify serves files from: spotify-install/Apps/[extension-name]/
        link.href = 'styles/timeline.css';

        link.onload = () => {
            this.cssLoaded = true;
        }

        link.onerror = () => {
            console.error('[TimelineCore] Failed to load timeline CSS');
            this.injectFallbackStyles();
        };
        document.head.appendChild(link);
    }

    /**
     * Fallback method: inject minimal inline styles if CSS file fails to load
     */
    injectFallbackStyles() {
        const style = document.createElement('style');
        style.id = 'artist-timeline-fallback-styles';
        style.textContent = `
            .timeline-view-button { padding: 8px 16px; }
            .artist-timeline-view { padding: 60px 20px; overflow-x: auto; }
            .timeline-cards { display: flex; gap: 48px; }
            .timeline-card { cursor: pointer; }
            .timeline-card__image { width: 180px; height: 180px; border-radius: 8px; }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // UTILITIES
    // ========================================

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get SVG markup for play button icon
     * @returns {string} SVG markup
     */
    getPlayIcon() {
        return `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;
    }
}