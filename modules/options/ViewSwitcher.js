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

        // Extract releases from current DOM content
        let releases = this.core.dataExtractor.extractFromDOM(this.core.state.originalGridContainer);

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

        console.log('[ViewSwitcher] Refreshing timeline');
        
        let releases = this.core.dataExtractor.extractFromDOM(this.core.state.originalGridContainer);
        
        if (releases && releases.length > 0) {
            // Apply sort order
            releases = this.applySortOrder(releases);
            this.core.renderTimeline(releases);
        } else {
            console.log('[ViewSwitcher] No releases found for current filter');
        }
    }
}