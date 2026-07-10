/**
 * ViewSwitcher - Handles switching between Grid and Timeline views
 */
class ViewSwitcher {
    constructor(core) {
        this.core = core;
    }

    /**
     * Handle fallback button click
     */
    async handleButtonClick() {
        if (this.core.state.isTimelineActive) {
            this.switchToGrid();
        } else {
            await this.switchToTimeline('timeline-horizontal');
        }
    }

    /**
     * Switch to a timeline view
     * @param {string} viewType - 'timeline-horizontal' or 'timeline-vertical'
     */
    async switchToTimeline(viewType = 'timeline-horizontal') {
        console.log('[ViewSwitcher] Switching to timeline:', viewType);

        const orientation = viewType === 'timeline-vertical' ? 'vertical' : 'horizontal';
        this.core.config.set('orientation', orientation);

        // Extract releases from current content with fallback for precise types/dates.
        let releases = await this.collectReleases();

        if (!releases || releases.length === 0) {
            Spicetify.showNotification('No releases found to display', true, 3000);
            return;
        }

        // Apply sort order
        releases = this.applySortOrder(releases);

        // Hide original grid
        if (this.core.state.originalGridContainer) {
            this.core.state.originalGridContainer.style.display = 'none';
        }

        // Render timeline
        this.core.renderTimeline(releases);

        // Add view switcher controls
        this.addViewControls();

        // Update state
        this.core.state.saveViewPref(viewType);
        this.core.state.update({
            isTimelineActive: true,
            currentView: viewType
        });

        // Update fallback button if exists
        this.updateFallbackButton(true);

        const viewName = orientation === 'vertical' ? 'Snake' : 'Horizontal';
        Spicetify.showNotification(`Timeline (${viewName}) activated`, false, 2000);
    }

    /**
     * Add view switcher controls to timeline
     */
    addViewControls() {
        const timelineContainer = this.core.state.timelineContainer;
        if (!timelineContainer) return;

        // Check if controls already exist
        if (timelineContainer.querySelector('.timeline-view-controls')) {
            return;
        }

        const controls = document.createElement('div');
        controls.className = 'timeline-view-controls';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', 'Timeline view options');

        // Horizontal button
        const horizButton = document.createElement('button');
        horizButton.className = 'timeline-view-btn timeline-view-btn--horizontal';
        horizButton.setAttribute('aria-label', 'Horizontal timeline view');
        horizButton.setAttribute('title', 'Horizontal view');
        horizButton.innerHTML = '⟷'; // Horizontal arrow

        const isHorizontal = this.core.config.get('orientation') === 'horizontal';
        if (isHorizontal) {
            horizButton.classList.add('timeline-view-btn--active');
            horizButton.setAttribute('aria-pressed', 'true');
        }

        horizButton.addEventListener('click', () => {
            this.switchToTimeline('timeline-horizontal');
        });

        // Vertical button
        const vertButton = document.createElement('button');
        vertButton.className = 'timeline-view-btn timeline-view-btn--vertical';
        vertButton.setAttribute('aria-label', 'Vertical/Snake timeline view');
        vertButton.setAttribute('title', 'Vertical (Snake) view');
        vertButton.innerHTML = '⟺'; // Vertical arrow

        const isVertical = this.core.config.get('orientation') === 'vertical';
        if (isVertical) {
            vertButton.classList.add('timeline-view-btn--active');
            vertButton.setAttribute('aria-pressed', 'true');
        }

        vertButton.addEventListener('click', () => {
            this.switchToTimeline('timeline-vertical');
        });

        controls.appendChild(horizButton);
        controls.appendChild(vertButton);

        // Insert at top of timeline
        timelineContainer.insertBefore(controls, timelineContainer.firstChild);
    }

    /**
     * Apply sort order to releases
     * @param {Array} releases - Array of release objects
     * @returns {Array} Sorted releases
     */
    applySortOrder(releases) {
        const sortOrder = this.core.state.sortOrder || 'desc';
        
        return [...releases].sort((a, b) => {
            // Handle missing dates
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;  // Push items without dates to the end
            if (!b.date) return -1;
            
            const dateA = a.date.getTime();
            const dateB = b.date.getTime();
            
            if (sortOrder === 'asc') {
                return dateA - dateB;  // Oldest first
            } else {
                return dateB - dateA;  // Newest first (default)
            }
        });
    }

    /**
     * Switch back to grid view
     */
    switchToGrid() {
        console.log('[ViewSwitcher] Switching to grid');
        
        // Remove timeline container
        if (this.core.state.timelineContainer) {
            this.core.state.timelineContainer.remove();
            this.core.state.update({ timelineContainer: null });
        }

        // Show original grid
        if (this.core.state.originalGridContainer) {
            this.core.state.originalGridContainer.style.display = '';
        }

        // Update state
        this.core.state.saveViewPref('grid');
        this.core.state.update({ 
            isTimelineActive: false,
            currentView: 'grid'
        });

        // Update fallback button if exists
        this.updateFallbackButton(false);

        Spicetify.showNotification('Grid view activated', false, 2000);
    }

    /**
     * Update the fallback button's active state
     * @param {boolean} isActive - Whether timeline is active
     */
    updateFallbackButton(isActive) {
        const button = this.core.state.injectedButton;
        if (!button) return;

        if (isActive) {
            button.classList.add('timeline-view-button--active');
            button.setAttribute('aria-selected', 'true');
            button.style.backgroundColor = 'var(--spice-button-active, rgba(255,255,255,0.2))';
        } else {
            button.classList.remove('timeline-view-button--active');
            button.setAttribute('aria-selected', 'false');
            button.style.backgroundColor = 'var(--spice-button, rgba(255,255,255,0.07))';
        }
    }

    /**
     * Refresh the current view (re-extract and re-render)
     */
    async refresh() {
        if (!this.core.state.isTimelineActive) return;

        console.log('[ViewSwitcher] Refreshing timeline with sort order:', this.core.state.sortOrder);

        let releases = await this.collectReleases();

        if (releases && releases.length > 0) {
            this.core.renderTimeline(releases);

            // Re-add view controls after render
            this.addViewControls();

            Spicetify.showNotification(`Showing ${releases.length} releases`, false, 1500);
        } else {
            console.log('[ViewSwitcher] No releases found for current filter');
        }
    }

    /**
     * Load and normalize releases for current view/filter.
     * Ensures lazy-loaded discography items are pulled in first.
     */
    async collectReleases() {
        await this.ensureAllReleasesLoaded();

        const releases = await this.core.dataExtractor.extractWithFallback(
            this.core.state.originalGridContainer,
            this.core.state.currentArtistId
        );

        const filtered = this.applyTypeFilter(releases);
        return this.applySortOrder(filtered);
    }

    /**
     * Apply currently selected Spotify filter tab to extracted releases.
     */
    applyTypeFilter(releases) {
        const filter = this.core.filterManager.getCurrentFilter();
        if (!filter || filter === 'all') return releases;

        if (filter === 'albums') {
            return releases.filter(r => (r.type || '').toLowerCase() === 'album');
        }

        if (filter === 'singles') {
            return releases.filter(r => {
                const type = (r.type || '').toLowerCase();
                return type === 'single' || type === 'ep';
            });
        }

        if (filter === 'compilations') {
            return releases.filter(r => (r.type || '').toLowerCase() === 'compilation');
        }

        return releases;
    }

    /**
     * Scroll the Spotify discography scroller to trigger lazy loading of older releases.
     */
    async ensureAllReleasesLoaded() {
        const container = this.core.state.originalGridContainer;
        if (!container) return;

        const scroller = this.findScrollableParent(container) || document.scrollingElement;
        if (!scroller) return;

        const cardSelector = '[data-testid="card-item"], [data-testid="grid-card"], .main-card-card, article';
        let lastHeight = -1;
        let lastCount = -1;
        let stableIterations = 0;

        for (let i = 0; i < 24; i++) {
            const currentHeight = scroller.scrollHeight;
            const currentCount = container.querySelectorAll(cardSelector).length;

            if (currentHeight === lastHeight && currentCount === lastCount) {
                stableIterations += 1;
            } else {
                stableIterations = 0;
            }

            if (stableIterations >= 2) {
                break;
            }

            scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'auto' });
            await new Promise(resolve => setTimeout(resolve, 280));

            lastHeight = currentHeight;
            lastCount = currentCount;
        }

        scroller.scrollTo({ top: 0, behavior: 'auto' });
    }

    findScrollableParent(element) {
        let current = element;
        while (current && current !== document.body) {
            const style = window.getComputedStyle(current);
            const canScroll = /(auto|scroll)/.test(style.overflowY || '');
            if (canScroll && current.scrollHeight > current.clientHeight) {
                return current;
            }
            current = current.parentElement;
        }

        return document.querySelector('main [data-overlayscrollbars-viewport]') ||
               document.querySelector('main .os-viewport') ||
               document.querySelector('main');
    }
}