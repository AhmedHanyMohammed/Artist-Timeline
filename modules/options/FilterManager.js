/**
 * FilterManager - Handles detection and observation of Spotify's discography filters
 * (Albums, Singles & EPs, Compilations, All)
 */
class FilterManager {
    constructor(core) {
        this.core = core;
        this.currentFilter = 'all';
        this._handleFilterChange = this.handleFilterChange.bind(this);
        this.filterObserver = null;
    }

    /**
     * Initialize filter detection and observation
     * @param {HTMLElement} discographyContainer - The discography container element
     */
    initialize(discographyContainer) {
        this.discographyContainer = discographyContainer;
        this.detectCurrentFilter();
        this.observeFilterChanges();
    }

    /**
     * Clean up observers and listeners
     */
    destroy() {
        if (this.filterObserver) {
            this.filterObserver.disconnect();
            this.filterObserver = null;
        }
        
        // Remove tab click listeners
        const tabContainer = this.findTabContainer();
        if (tabContainer) {
            tabContainer.removeEventListener('click', this._handleFilterChange);
        }
    }

    /**
     * Get the current active filter
     * @returns {string} Current filter ('all', 'albums', 'singles', 'compilations')
     */
    getCurrentFilter() {
        return this.currentFilter;
    }

    /**
     * Detect the current filter from URL or active tab
     */
    detectCurrentFilter() {
        const pathname = window.location.pathname;
        
        // Check URL patterns
        if (pathname.includes('/discography/album')) {
            this.currentFilter = 'albums';
        } else if (pathname.includes('/discography/single') || pathname.includes('/discography/ep')) {
            this.currentFilter = 'singles';
        } else if (pathname.includes('/discography/compilation')) {
            this.currentFilter = 'compilations';
        } else {
            // Check for active tab in DOM
            this.currentFilter = this.detectFilterFromTabs() || 'all';
        }
        
        console.log('[FilterManager] Detected filter:', this.currentFilter);
    }

    /**
     * Detect filter from active tab element
     * @returns {string|null} Filter type or null
     */
    detectFilterFromTabs() {
        const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
        if (!activeTab) return null;

        const tabText = activeTab.textContent?.toLowerCase() || '';
        
        if (tabText.includes('album') && !tabText.includes('single')) {
            return 'albums';
        } else if (tabText.includes('single') || tabText.includes('ep')) {
            return 'singles';
        } else if (tabText.includes('compilation')) {
            return 'compilations';
        }
        
        return null;
    }

    /**
     * Find the tab container element
     * @returns {HTMLElement|null} Tab container or null
     */
    findTabContainer() {
        const tabSelectors = [
            '[role="tablist"]',
            '[data-testid="discography-tabs"]',
            '.discography-tabs',
        ];

        for (const selector of tabSelectors) {
            const container = document.querySelector(selector);
            if (container) return container;
        }
        return null;
    }

    /**
     * Set up observers for filter changes (tab clicks, URL changes, DOM mutations)
     */
    observeFilterChanges() {
        // Watch for tab clicks
        const tabContainer = this.findTabContainer();
        if (tabContainer) {
            tabContainer.addEventListener('click', this._handleFilterChange);
        }

        // Observe DOM changes for dynamic content updates
        this.filterObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    const gridChanged = this.isGridMutation(mutation);
                    
                    if (gridChanged && this.core.state.isTimelineActive) {
                        this.handleFilterChange();
                    }
                }
            }
        });

        if (this.discographyContainer) {
            this.filterObserver.observe(this.discographyContainer, { 
                childList: true, 
                subtree: true,
                attributes: true,
                attributeFilter: ['aria-selected', 'class']
            });
        }

        // Listen for Spicetify history changes
        this.setupHistoryListener();
    }

    /**
     * Check if a mutation affects the grid content
     * @param {MutationRecord} mutation - The mutation record
     * @returns {boolean} True if grid was affected
     */
    isGridMutation(mutation) {
        return mutation.target.classList?.contains('main-gridContainer-gridContainer') ||
               mutation.target.querySelector?.('[data-testid="grid-container"]');
    }

    /**
     * Set up listener for Spicetify history/navigation changes
     */
    setupHistoryListener() {
        if (Spicetify.Platform?.History) {
            Spicetify.Platform.History.listen((location) => {
                if (location.pathname.includes('/discography')) {
                    setTimeout(() => this.handleFilterChange(), 300);
                }
            });
        }
    }

    /**
     * Handle filter/tab change - notify core to re-render
     * @param {Event} [event] - Click event (optional)
     */
    async handleFilterChange(event) {
        const oldFilter = this.currentFilter;
        this.detectCurrentFilter();

        // If filter changed and timeline is active, notify core
        if (this.core.state.isTimelineActive && (oldFilter !== this.currentFilter || event)) {
            console.log('[FilterManager] Filter changed from', oldFilter, 'to', this.currentFilter);
            
            // Wait for Spotify to update the DOM
            await this.waitForDOMUpdate();
            
            // Notify core to refresh
            this.core.onFilterChange();
        }
    }

    /**
     * Wait for Spotify's DOM to update after filter change
     * @returns {Promise<void>}
     */
    async waitForDOMUpdate() {
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    /**
     * Find the updated grid container after filter change
     * @returns {Promise<HTMLElement|null>} Updated container or null
     */
    async findUpdatedGridContainer() {
        const gridSelectors = [
            '[data-testid="grid-container"]',
            '.main-gridContainer-gridContainer',
            '[class*="grid"]',
        ];

        for (let attempt = 0; attempt < 5; attempt++) {
            for (const selector of gridSelectors) {
                const container = this.discographyContainer?.querySelector(selector) ||
                                document.querySelector(selector);
                if (container && container !== this.core.state.originalGridContainer) {
                    return container;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return null;
    }
}