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
        const orientation = viewType === 'timeline-vertical' ? 'vertical' : 'horizontal';
        this.core.config.set('orientation', orientation);

        // Extract releases from current DOM content
        const releases = this.core.dataExtractor.extractFromDOM(this.core.state.originalGridContainer);

        if (!releases || releases.length === 0) {
            Spicetify.showNotification('No releases found to display', true, 3000);
            return;
        }

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
     * Switch back to grid view
     */
    switchToGrid() {
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
        } else {
            button.classList.remove('timeline-view-button--active');
            button.setAttribute('aria-selected', 'false');
        }
    }

    /**
     * Refresh the current view (re-extract and re-render)
     */
    async refresh() {
        if (!this.core.state.isTimelineActive) return;

        const releases = this.core.dataExtractor.extractFromDOM(this.core.state.originalGridContainer);
        
        if (releases && releases.length > 0) {
            this.core.renderTimeline(releases);
        } else {
            console.log('[ViewSwitcher] No releases found for current filter');
        }
    }
}