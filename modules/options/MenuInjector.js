/**
 * MenuInjector - Handles injection of Timeline options into Spotify's dropdown menu
 */
class MenuInjector {
    constructor(core) {
        this.core = core;
        this.menuObserver = null;
    }

    /**
     * Initialize menu injection
     * @param {HTMLElement} container - The discography container
     */
    async initialize(container) {
        const comboboxButton = await this.findComboboxButton(container);
        
        if (!comboboxButton) {
            console.warn('[MenuInjector] Combobox button not found, falling back to custom button');
            this.injectFallbackButton(container);
            return;
        }

        this.core.state.update({ comboboxButton });
        this.observeDropdownMenu(comboboxButton);
    }

    /**
     * Clean up injected elements and observers
     */
    destroy() {
        this.removeInjectedOptions();
        
        if (this.menuObserver) {
            this.menuObserver.disconnect();
            this.menuObserver = null;
        }
    }

    /**
     * Find the Spotify sort/view combobox button
     * @param {HTMLElement} container - Container to search in
     * @returns {Promise<HTMLElement|null>} Combobox button or null
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
                if (button) return button;
            }
            searchArea = searchArea.parentElement;
            attempts++;
        }

        // Document-wide search near discography
        for (const selector of selectors) {
            const buttons = document.querySelectorAll(selector);
            for (const button of buttons) {
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
     * Observe for dropdown menu appearing and inject options
     * @param {HTMLElement} comboboxButton - The combobox button element
     */
    observeDropdownMenu(comboboxButton) {
        this.menuObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const menu = node.querySelector?.('[role="listbox"], [role="menu"]') || 
                                    (node.getAttribute?.('role') === 'listbox' || 
                                     node.getAttribute?.('role') === 'menu' ? node : null);
                        
                        if (menu || node.id === 'sort-and-view-picker') {
                            this.injectTimelineOptions(menu || node);
                        }
                    }
                }
            }
        });

        this.menuObserver.observe(document.body, { childList: true, subtree: true });

        // Check if menu is already open
        const existingMenu = document.querySelector('#sort-and-view-picker, [role="listbox"]');
        if (existingMenu) {
            this.injectTimelineOptions(existingMenu);
        }
    }

    /**
     * Inject Timeline options into the dropdown menu
     * @param {HTMLElement} menu - The dropdown menu element
     */
    injectTimelineOptions(menu) {
        // Check if already injected
        if (menu.querySelector('.timeline-menu-option')) {
            this.updateMenuSelection(menu);
            return;
        }

        console.log('[MenuInjector] Injecting options into dropdown menu');

        const existingOptions = menu.querySelectorAll('[role="option"], [role="menuitemradio"]');
        if (!existingOptions.length) {
            console.warn('[MenuInjector] No existing options found in menu');
            return;
        }

        const templateOption = existingOptions[0];
        const lastExistingOption = existingOptions[existingOptions.length - 1];

        // Create separator
        const separator = this.createSeparator();

        // Create header
        const header = this.createHeader();

        // Create timeline options
        const horizontalOption = this.createMenuOption(
            templateOption,
            'Timeline (Horizontal)',
            'timeline-horizontal',
            this.getHorizontalIcon()
        );

        const verticalOption = this.createMenuOption(
            templateOption,
            'Timeline (Snake)',
            'timeline-vertical',
            this.getVerticalIcon()
        );

        // Insert after the last existing option
        if (lastExistingOption.nextSibling) {
            menu.insertBefore(separator, lastExistingOption.nextSibling);
            menu.insertBefore(header, separator.nextSibling);
            menu.insertBefore(horizontalOption, header.nextSibling);
            menu.insertBefore(verticalOption, horizontalOption.nextSibling);
        } else {
            menu.appendChild(separator);
            menu.appendChild(header);
            menu.appendChild(horizontalOption);
            menu.appendChild(verticalOption);
        }

        this.updateMenuSelection(menu);
        this.setupNativeOptionListeners(existingOptions);
    }

    /**
     * Create a separator element
     * @returns {HTMLElement} Separator div
     */
    createSeparator() {
        const separator = document.createElement('div');
        separator.className = 'timeline-menu-separator';
        separator.style.cssText = 'height: 1px; background: var(--spice-button, rgba(255,255,255,0.1)); margin: 8px 0;';
        separator.setAttribute('role', 'separator');
        return separator;
    }

    /**
     * Create a header element
     * @returns {HTMLElement} Header div
     */
    createHeader() {
        const header = document.createElement('div');
        header.className = 'timeline-menu-header';
        header.style.cssText = `
            padding: 8px 16px 4px 16px;
            font-size: 11px;
            color: var(--spice-subtext, rgba(255,255,255,0.5));
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        header.textContent = 'Timeline Views';
        return header;
    }

    /**
     * Create a menu option element
     * @param {HTMLElement} templateOption - Existing option to copy styling from
     * @param {string} label - Option label text
     * @param {string} value - Option value identifier
     * @param {string} icon - SVG icon HTML
     * @returns {HTMLElement} Option element
     */
    createMenuOption(templateOption, label, value, icon) {
        const option = document.createElement('div');
        option.className = `${templateOption.className} timeline-menu-option`;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        option.setAttribute('data-timeline-value', value);
        option.tabIndex = 0;

        option.innerHTML = `
            <span class="e-91000-text encore-text-body-small" data-encore-id="text" style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
                    ${icon}
                </span>
                ${label}
            </span>
        `;

        option.style.cssText = `
            padding: 12px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            transition: background-color 0.1s ease;
        `;

        // Hover effects
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
            
            // Close dropdown
            const combobox = this.core.state.comboboxButton;
            if (combobox) combobox.click();

            // Deselect native options
            const menu = option.closest('[role="listbox"], [role="menu"]');
            if (menu) {
                menu.querySelectorAll('[role="option"], [role="menuitemradio"]').forEach(opt => {
                    if (!opt.classList.contains('timeline-menu-option')) {
                        opt.setAttribute('aria-selected', 'false');
                    }
                });
            }

            // Switch to timeline view
            await this.core.viewSwitcher.switchToTimeline(value);
        });

        return option;
    }

    /**
     * Set up click listeners on Spotify's native options (Grid/List)
     * @param {NodeList} options - Native option elements
     */
    setupNativeOptionListeners(options) {
        options.forEach(option => {
            option.addEventListener('click', () => {
                if (this.core.state.isTimelineActive) {
                    this.core.viewSwitcher.switchToGrid();
                }
            });
        });
    }

    /**
     * Update selection state of menu options
     * @param {HTMLElement} menu - The menu element
     */
    updateMenuSelection(menu) {
        const timelineOptions = menu.querySelectorAll('.timeline-menu-option');
        timelineOptions.forEach(opt => {
            const isSelected = opt.getAttribute('data-timeline-value') === this.core.state.currentView;
            opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            opt.style.backgroundColor = isSelected ? 'var(--spice-button, rgba(255,255,255,0.07))' : '';
        });

        if (this.core.state.isTimelineActive) {
            menu.querySelectorAll('[role="option"], [role="menuitemradio"]').forEach(opt => {
                if (!opt.classList.contains('timeline-menu-option')) {
                    opt.setAttribute('aria-selected', 'false');
                }
            });
        }
    }

    /**
     * Remove all injected elements
     */
    removeInjectedOptions() {
        document.querySelectorAll('.timeline-menu-option, .timeline-menu-separator, .timeline-menu-header')
            .forEach(el => el.remove());
    }

    /**
     * Inject fallback button when combobox not found
     * @param {HTMLElement} container - Container element
     */
    injectFallbackButton(container) {
        const controlsBar = this.findControlsBar(container);
        if (!controlsBar || this.core.state.injectedButton) return;

        const button = document.createElement('button');
        button.className = 'Button-sc-1dqy6lx-0 timeline-view-button';
        button.innerHTML = `
            <span class="e-91000-text encore-text-body-small-bold">Timeline</span>
            <span aria-hidden="true" class="e-91000-button__icon-wrapper">
                ${this.getHorizontalIcon()}
            </span>
        `;
        button.setAttribute('aria-label', 'Timeline view');
        button.addEventListener('click', () => this.core.viewSwitcher.handleButtonClick());
        
        controlsBar.appendChild(button);
        this.core.state.update({ injectedButton: button });
    }

    /**
     * Find the controls bar element
     * @param {HTMLElement} container - Container to search in
     * @returns {HTMLElement|null} Controls bar or null
     */
    findControlsBar(container) {
        const selectors = [
            '[role="toolbar"]', '[role="controls"]', '.view-header-controls', 
            '[class*="filterButton"]', '[class*="viewControls"]', '[class*="toolbar"]'
        ];
        
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

    // Icon methods
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
}