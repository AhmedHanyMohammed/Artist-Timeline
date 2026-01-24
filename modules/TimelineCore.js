/**
 * TimelineCore - Manages timeline view rendering and interactions
 */
class TimelineCore {
    constructor(config, state) {
        this.config = config;
        this.state = state;
        this.dataExtractor = null;
        this.discographyContainer = null;
        this.cssLoaded = false;
        this.releases = null;

        // Initialize sub-modules for views
        this.horizontalView = new HorizontalView(this);
        this.verticalView = new VerticalView(this);

        this.loadStyles();
    }

    async initialize(discographyContainer, dataExtractor) {
        this.discographyContainer = discographyContainer;
        this.dataExtractor = dataExtractor;

        const controlsBar = this.findControlsBar(discographyContainer);
        if (controlsBar) {
            this.injectTimelineButtons(controlsBar);
        }

        if(this.state.currentView === 'timeline')
            await this.switchToTimeline();
    }

    destroy() {
        if (this.state.timelineContainer) this.state.timelineContainer.remove();
        if (this.state.injectedButton) this.state.injectedButton.remove();
        if (this.state.orientationButton) this.state.orientationButton.remove();
        if (this.state.originalGridContainer) this.state.originalGridContainer.style.display = '';
        
        this.discographyContainer = null;
        this.dataExtractor = null;
        this.releases = null;
    }

    findControlsBar(container) {
        const selectors = ['[role="toolbar"]', '[role="controls"]', '.view-header-controls', 
                          '[class*="filterButton"]', '[class*="viewControls"]', '[class*="toolbar"]'];
        
        for (const selector of selectors) {
            const element = container.querySelector(selector);
            if (element) return element;
        }

        let parent = container.parentElement;
        let attempts = 0;
        while (parent && attempts < 3) {
            for (const selector of selectors) {
                const element = parent.querySelector(selector);
                if (element) return element;
            }
            parent = parent.parentElement;
            attempts++;
        }
        return null;
    }

    injectTimelineButtons(controlsBar) {
        // Timeline Toggle
        if (!this.state.injectedButton) {
            const button = document.createElement('button');
            button.className = 'timeline-view-button';
            button.textContent = 'Timeline';
            button.setAttribute('aria-label', 'Timeline view');
            if (this.state.currentView === 'timeline') button.classList.add('timeline-view-button--active');
            button.addEventListener('click', () => this.handleButtonClick());
            controlsBar.appendChild(button);
            this.state.update({ injectedButton: button });
        }

        // Orientation Toggle
        if (!this.state.orientationButton) {
            const orientBtn = document.createElement('button');
            orientBtn.className = 'timeline-view-button timeline-orientation-button';
            orientBtn.innerHTML = this.getOrientationIcon(this.config.get('orientation'));
            orientBtn.setAttribute('aria-label', 'Toggle Orientation');
            orientBtn.style.display = this.state.currentView === 'timeline' ? 'inline-flex' : 'none';
            orientBtn.style.marginLeft = '8px';
            orientBtn.style.alignItems = 'center';
            orientBtn.addEventListener('click', () => this.toggleOrientation());
            controlsBar.appendChild(orientBtn);
            this.state.update({ orientationButton: orientBtn });
        }
    }

    getOrientationIcon(orientation) {
        return orientation === 'vertical' 
            ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h2v12H4zm6 0h2v12h-2z"/></svg>` // Vertical Icon
            : `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4v2h12V4zm0 6v2h12v-2z"/></svg>`; // Horizontal Icon
    }

    toggleOrientation() {
        const current = this.config.get('orientation') || 'horizontal';
        // Toggle: Horizontal <-> Vertical (Snake)
        const next = current === 'horizontal' ? 'vertical' : 'horizontal';
        this.config.set('orientation', next);
        
        if (this.state.orientationButton) {
            this.state.orientationButton.innerHTML = this.getOrientationIcon(next);
        }

        if (this.state.isTimelineActive && this.releases) {
            this.renderTimeline(this.releases);
        }
    }

    async handleButtonClick() {
        if (this.state.isTimelineActive) {
            this.switchToGrid();
        } else {
            await this.switchToTimeline();
        }
    }

    async switchToTimeline() {
        this.releases = this.dataExtractor.extractFromDOM(this.state.originalGridContainer);

        if(!this.releases || this.releases.length === 0) {
            Spicetify.showNotification('No release found to display', true, 3000)
        }

        if(this.state.originalGridContainer) this.state.originalGridContainer.style.display = 'none';

        this.renderTimeline(this.releases);

        this.state.saveViewPref('timeline');
        this.state.update({ isTimelineActive: true });

        if (this.state.injectedButton) {
            this.state.injectedButton.classList.add('timeline-view-button--active');
            this.state.injectedButton.setAttribute('aria-selected', 'true');
        }
        if (this.state.orientationButton) this.state.orientationButton.style.display = 'inline-flex';

        Spicetify.showNotification('Timeline view activated', false, 2000);
    }

    switchToGrid() {
        if (this.state.timelineContainer) {
            this.state.timelineContainer.remove();
            this.state.update({timelineContainer: null});
        }

        if (this.state.originalGridContainer) this.state.originalGridContainer.style.display = '';

        this.state.saveViewPref('grid');
        this.state.update({ isTimelineActive: false });

        if (this.state.injectedButton) {
            this.state.injectedButton.classList.remove('timeline-view-button--active');
            this.state.injectedButton.setAttribute('aria-selected', 'false');
        }
        if (this.state.orientationButton) this.state.orientationButton.style.display = 'none';

        Spicetify.showNotification('Grid view activated', false, 2000);
    }

    renderTimeline(releases) {
        if (this.state.timelineContainer) this.state.timelineContainer.remove();

        const container = document.createElement('div');
        container.className = 'timeline-view';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Artist discography timeline');

        const orientation = this.config.get('orientation') || 'horizontal';
        
        if (orientation === 'horizontal') {
            this.horizontalView.render(container, releases);
        } else {
            // "Vertical" is now the Snake View
            this.verticalView.render(container, releases);
        }

        this.state.originalGridContainer.parentNode.insertBefore(container, this.state.originalGridContainer.nextSibling);
        this.state.update({ timelineContainer: container });
    }

    createCard(release, index) {
        const card = document.createElement('div');
        card.className = 'timeline-card';
        card.setAttribute('role', 'listitem');
        card.dataset.uri = release.uri;
        card.dataset.index = index;

        if(release.isPlaying) {
            card.classList.add('timeline-card--playing');
            card.setAttribute('aria-current', 'true');
        }

        const dateText = release.date ?
            release.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short'}) : 'Unknown Date';

        card.innerHTML = `
        <div class="timeline-card__marker" aria-hidden="true"></div>
        <div class="timeline-card__content">
            <div class="timeline-card__image-wrapper">
                <img src="${release.image}" alt="${this.escapeHtml(release.name)}" class="timeline-card__image" loading="lazy" />
                <button class="timeline-card__play-button" aria-label="Play ${this.escapeHtml(release.name)}" data-uri="${release.uri}">
                    ${this.getPlayIcon()}
                </button>
            </div>
            <div class="timeline-card__info">
                <h3 class="timeline-card__title">${this.escapeHtml(release.name)}</h3>
                <div class="timeline-card__meta">
                    <span class="timeline-card__type">${release.type}</span>
                    <span class="timeline-card__separator">•</span>
                    <time class="timeline-card__date" datetime="${release.date?.toISOString() || ''}">${dateText}</time>
                </div>
            </div>
        </div>`;

        this.attachCardListeners(card, release);
        return card;
    }

    attachCardListeners(card, release) {
        const playButton = card.querySelector('.timeline-card__play-button');
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                e.stopPropagation();
                Spicetify.Player.playUri(release.uri);
            });
        }
        card.addEventListener('click', () => {
            const albumID = release.uri.split(':')[2];
            Spicetify.Platform.History.push(`/album/${albumID}`);
        });
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    }

    /**
     * Calculate Linear Spacing for accuracy
     * 100 days = 2x spacing of 50 days
     */
    calculateSpacing(prevRelease, currentRelease) {
        const minSpacing = this.config.get('minSpacing') || 40;
        const maxSpacing = this.config.get('maxSpacing') || 250;
        const pixelsPerDay = 0.2; // Adjust this sensitivity

        if (!prevRelease.date || !currentRelease.date) return minSpacing;

        const timeDiff = Math.abs(currentRelease.date - prevRelease.date);
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

        // Linear calculation
        const spacing = minSpacing + (daysDiff * pixelsPerDay);

        return Math.max(minSpacing, Math.min(maxSpacing, spacing));
    }

    loadStyles() {
        if (this.cssLoaded || document.getElementById('artist-timeline-styles')) {
            this.cssLoaded = true;
            return;
        }
        const link = document.createElement('link');
        link.id = 'artist-timeline-styles';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'styles/timeline.css';
        link.onload = () => { this.cssLoaded = true; }
        link.onerror = () => { this.injectFallbackStyles(); };
        document.head.appendChild(link);
    }

    injectFallbackStyles() {
        const style = document.createElement('style');
        style.id = 'artist-timeline-fallback-styles';
        style.textContent = `.timeline-view-button { padding: 8px 16px; } .artist-timeline-view { padding: 60px 20px; overflow-x: auto; } .timeline-cards { display: flex; gap: 48px; }`;
        document.head.appendChild(style);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getPlayIcon() {
        return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>`;
    }
}