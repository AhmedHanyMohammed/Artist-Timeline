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
    }

    async initialize(discographyContainer, dataExtractor) {
        this.discographyContainer = discographyContainer;
        this.dataExtractor = dataExtractor;

        // Find and inject into the Spotify combobox
        await this.injectIntoCombobox(discographyContainer);

        if(this.state.currentView === 'timeline-horizontal' || this.state.currentView === 'timeline-vertical') {
            await this.switchToTimeline(this.state.currentView);
        }
    }

    destroy() {
        if (this.state.timelineContainer) this.state.timelineContainer.remove();
        if (this.state.originalGridContainer) this.state.originalGridContainer.style.display = '';
        
        // Remove injected menu items
        this.removeInjectedOptions();
        
        this.discographyContainer = null;
        this.dataExtractor = null;
        this.releases = null;
    }

    /**
     * Find the Spotify combobox and inject Timeline options
     */
    async injectIntoCombobox(container) {
        // Find the combobox button
        const comboboxButton = await this.findComboboxButton(container);
        
        if (!comboboxButton) {
            console.warn('[Timeline] Combobox button not found, falling back to custom button');
            this.injectFallbackButton(container);
            return;
        }

        console.log('[Timeline] Found combobox button, setting up menu injection');
        
        // Store reference to the button
        this.state.update({ comboboxButton });

        // Listen for when the dropdown opens
        this.observeDropdownMenu(comboboxButton);
    }

    /**
     * Find the Spotify sort/view combobox button
     */
    async findComboboxButton(container) {
        const selectors = [
            'button[role="combobox"][aria-controls="sort-and-view-picker"]',
            'button[role="combobox"]',
            '[data-testid="sort-button"]',
            'button[aria-haspopup="true"]'
        ];

        // Search in container and parents
        let searchArea = container;
        let attempts = 0;
        
        while (searchArea && attempts < 5) {
            for (const selector of selectors) {
                const button = searchArea.querySelector(selector);
                if (button) {
                    return button;
                }
            }
            searchArea = searchArea.parentElement;
            attempts++;
        }

        // Also try document-wide search near discography
        for (const selector of selectors) {
            const buttons = document.querySelectorAll(selector);
            for (const button of buttons) {
                // Check if button is near discography section
                const rect = button.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                if (Math.abs(rect.top - containerRect.top) < 200) {
                    return button;
                }
            }
        }

        return null;
    }

    /**
     * Observe for dropdown menu appearing and inject our options
     */
    observeDropdownMenu(comboboxButton) {
        // Create observer for the dropdown
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Look for the dropdown menu
                        const menu = node.querySelector?.('[role="listbox"], [role="menu"]') || 
                                    (node.getAttribute?.('role') === 'listbox' || node.getAttribute?.('role') === 'menu' ? node : null);
                        
                        if (menu || node.id === 'sort-and-view-picker') {
                            const targetMenu = menu || node;
                            this.injectTimelineOptions(targetMenu);
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        this.state.update({ menuObserver: observer });

        // Also check if menu is already open
        const existingMenu = document.querySelector('#sort-and-view-picker, [role="listbox"]');
        if (existingMenu) {
            this.injectTimelineOptions(existingMenu);
        }
    }

    /**
     * Inject Timeline options into the dropdown menu
     */
    injectTimelineOptions(menu) {
        // Check if already injected
        if (menu.querySelector('.timeline-menu-option')) {
            return;
        }

        console.log('[Timeline] Injecting options into dropdown menu');

        // Find existing option to copy styling
        const existingOption = menu.querySelector('[role="option"], [role="menuitemradio"]');
        if (!existingOption) {
            console.warn('[Timeline] No existing options found in menu');
            return;
        }

        // Create separator
        const separator = document.createElement('div');
        separator.className = 'timeline-menu-separator';
        separator.style.cssText = 'height: 1px; background: var(--spice-button, rgba(255,255,255,0.1)); margin: 8px 0;';
        separator.setAttribute('role', 'separator');

        // Create Timeline Horizontal option
        const horizontalOption = this.createMenuOption(
            existingOption,
            'Timeline (Horizontal)',
            'timeline-horizontal',
            this.getHorizontalIcon()
        );

        // Create Timeline Vertical option  
        const verticalOption = this.createMenuOption(
            existingOption,
            'Timeline (Snake)',
            'timeline-vertical',
            this.getVerticalIcon()
        );

        // Add to menu
        menu.appendChild(separator);
        menu.appendChild(horizontalOption);
        menu.appendChild(verticalOption);

        // Update selected state
        this.updateMenuSelection(menu);
    }

    /**
     * Create a menu option element matching Spotify's style
     */
    createMenuOption(templateOption, label, value, icon) {
        const option = document.createElement('div');
        option.className = `${templateOption.className} timeline-menu-option`;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        option.setAttribute('data-timeline-value', value);
        option.tabIndex = 0;

        // Match Spotify's internal structure
        option.innerHTML = `
            <span class="e-91000-text encore-text-body-small" data-encore-id="text" style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                    ${icon}
                </span>
                ${label}
            </span>
        `;

        // Style to match Spotify options
        option.style.cssText = `
            padding: 12px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: background-color 0.1s ease;
        `;

        // Hover effect
        option.addEventListener('mouseenter', () => {
            option.style.backgroundColor = 'var(--spice-button-active, rgba(255,255,255,0.1))';
        });
        option.addEventListener('mouseleave', () => {
            if (option.getAttribute('aria-selected') !== 'true') {
                option.style.backgroundColor = '';
            }
        });

        // Click handler
        option.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Close the dropdown
            const combobox = this.state.comboboxButton;
            if (combobox) {
                combobox.click(); // Toggle to close
            }

            // Switch to timeline view
            await this.switchToTimeline(value);
        });

        return option;
    }

    /**
     * Update which menu option appears selected
     */
    updateMenuSelection(menu) {
        const options = menu.querySelectorAll('.timeline-menu-option');
        options.forEach(opt => {
            const isSelected = opt.getAttribute('data-timeline-value') === this.state.currentView;
            opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            opt.style.backgroundColor = isSelected ? 'var(--spice-button, rgba(255,255,255,0.07))' : '';
        });
    }

    /**
     * Remove injected options (cleanup)
     */
    removeInjectedOptions() {
        document.querySelectorAll('.timeline-menu-option, .timeline-menu-separator').forEach(el => el.remove());
        
        if (this.state.menuObserver) {
            this.state.menuObserver.disconnect();
        }
    }

    /**
     * Fallback: inject custom button if combobox not found
     */
    injectFallbackButton(container) {
        const controlsBar = this.findControlsBar(container);
        if (!controlsBar) return;

        if (!this.state.injectedButton) {
            const button = document.createElement('button');
            button.className = 'Button-sc-1dqy6lx-0 timeline-view-button';
            button.innerHTML = `
                <span class="e-91000-text encore-text-body-small-bold">Timeline</span>
                <span aria-hidden="true" class="e-91000-button__icon-wrapper">
                    ${this.getHorizontalIcon()}
                </span>
            `;
            button.setAttribute('aria-label', 'Timeline view');
            button.addEventListener('click', () => this.handleButtonClick());
            controlsBar.appendChild(button);
            this.state.update({ injectedButton: button });
        }
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

    getHorizontalIcon() {
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 4v2h12V4zm0 6v2h12v-2z"/>
        </svg>`;
    }

    getVerticalIcon() {
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2h2v12H4zm6 0h2v12h-2z"/>
        </svg>`;
    }

    async handleButtonClick() {
        if (this.state.isTimelineActive) {
            this.switchToGrid();
        } else {
            await this.switchToTimeline('timeline-horizontal');
        }
    }

    async switchToTimeline(viewType = 'timeline-horizontal') {
        // Update orientation based on view type
        const orientation = viewType === 'timeline-vertical' ? 'vertical' : 'horizontal';
        this.config.set('orientation', orientation);

        this.releases = this.dataExtractor.extractFromDOM(this.state.originalGridContainer);

        if(!this.releases || this.releases.length === 0) {
            Spicetify.showNotification('No releases found to display', true, 3000);
            return;
        }

        if(this.state.originalGridContainer) {
            this.state.originalGridContainer.style.display = 'none';
        }

        this.renderTimeline(this.releases);

        this.state.saveViewPref(viewType);
        this.state.update({ 
            isTimelineActive: true,
            currentView: viewType 
        });

        if (this.state.injectedButton) {
            this.state.injectedButton.classList.add('timeline-view-button--active');
            this.state.injectedButton.setAttribute('aria-selected', 'true');
        }

        const viewName = orientation === 'vertical' ? 'Snake' : 'Horizontal';
        Spicetify.showNotification(`Timeline (${viewName}) activated`, false, 2000);
    }

    switchToGrid() {
        if (this.state.timelineContainer) {
            this.state.timelineContainer.remove();
            this.state.update({timelineContainer: null});
        }

        if (this.state.originalGridContainer) {
            this.state.originalGridContainer.style.display = '';
        }

        this.state.saveViewPref('grid');
        this.state.update({ 
            isTimelineActive: false,
            currentView: 'grid'
        });

        if (this.state.injectedButton) {
            this.state.injectedButton.classList.remove('timeline-view-button--active');
            this.state.injectedButton.setAttribute('aria-selected', 'false');
        }

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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getPlayIcon() {
        return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>`;
    }
}