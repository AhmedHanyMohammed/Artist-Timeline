/**
 * MenuInjector - Handles injection of Timeline options into Spotify's dropdown menu
 */
class MenuInjector {
    constructor(core) {
        this.core = core;
        this.menuObserver = null;
        this.currentSortOrder = 'desc'; // Default: newest first (descending)
    }

    /**
     * Initialize menu injection
     * @param {HTMLElement} container - The discography container
     */
    async initialize(container) {
        console.log('[MenuInjector] Initializing...');
        
        // Wait for Spotify to fully render the page
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const comboboxButton = await this.findComboboxButton(container);
        
        if (!comboboxButton) {
            console.warn('[MenuInjector] Combobox button not found, falling back to custom button');
            this.injectFallbackButton(container);
            return;
        }

        console.log('[MenuInjector] Found combobox button:', comboboxButton);
        this.core.state.update({ comboboxButton });
        this.observeDropdownMenu();
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
     * Target: button[role="combobox"][aria-controls="sort-and-view-picker"]
     */
    async findComboboxButton(container) {
        // Primary selector - exact match for the button you provided
        const primarySelector = 'button[role="combobox"][aria-controls="sort-and-view-picker"]';
        
        // Try multiple times with delay
        for (let attempt = 0; attempt < 15; attempt++) {
            // Try primary selector first
            const button = document.querySelector(primarySelector);
            if (button) {
                console.log('[MenuInjector] Found button with primary selector');
                return button;
            }

            // Fallback selectors
            const fallbackSelectors = [
                'button[role="combobox"][aria-haspopup="true"]',
                'button[aria-controls*="sort"]',
                'button[aria-controls*="view"]',
            ];

            for (const selector of fallbackSelectors) {
                const btn = document.querySelector(selector);
                if (btn) {
                    console.log('[MenuInjector] Found button with fallback selector:', selector);
                    return btn;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        return null;
    }

    /**
     * Observe for dropdown menu appearing and inject options
     * Target menu: ul[role="menu"] with id "sort-and-view-picker"
     */
    observeDropdownMenu() {
        console.log('[MenuInjector] Setting up dropdown observer');
        
        this.menuObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Look for the specific menu structure
                        const menu = this.findTargetMenu(node);
                        if (menu) {
                            console.log('[MenuInjector] Dropdown menu detected:', menu);
                            this.injectTimelineOption(menu);
                        }
                    }
                }
            }
        });

        this.menuObserver.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Find the target dropdown menu
     * Target: ul[role="menu"] that contains "Sort by" and "View as" sections
     */
    findTargetMenu(node) {
        // Check if node itself is the menu
        if (node.tagName === 'UL' && node.getAttribute('role') === 'menu') {
            return node;
        }
        
        // Check for menu inside node
        const menu = node.querySelector?.('ul[role="menu"]');
        if (menu) return menu;
        
        // Check if node is inside a tippy/popover container
        if (node.classList?.contains('tippy-content') || node.querySelector?.('.tippy-content')) {
            const innerMenu = node.querySelector('ul[role="menu"]');
            if (innerMenu) return innerMenu;
        }

        // Check for the menu by ID
        const menuById = node.querySelector?.('#sort-and-view-picker') || 
                        (node.id === 'sort-and-view-picker' ? node : null);
        if (menuById) return menuById;
        
        return null;
    }

    /**
     * Inject Timeline option into the dropdown menu (under Grid option)
     * @param {HTMLElement} menu - The ul[role="menu"] element
     */
    injectTimelineOption(menu) {
        // Check if already injected
        if (menu.querySelector('.timeline-menu-option')) {
            this.updateMenuSelection(menu);
            return;
        }

        console.log('[MenuInjector] Injecting Timeline option into menu');

        // Find the Grid button (it's the last "View as" option)
        const menuItems = menu.querySelectorAll('li[role="presentation"]');
        let gridItem = null;
        let listItem = null;

        for (const item of menuItems) {
            const button = item.querySelector('button[role="menuitemradio"]');
            if (button) {
                const text = button.textContent?.toLowerCase() || '';
                if (text.includes('grid')) {
                    gridItem = item;
                } else if (text.includes('list')) {
                    listItem = item;
                }
            }
        }

        if (!gridItem) {
            console.warn('[MenuInjector] Grid option not found in menu');
            return;
        }

        // Create Timeline option (matching Spotify's exact structure)
        const timelineItem = this.createTimelineMenuItem(gridItem);
        
        // Insert after Grid option
        if (gridItem.nextSibling) {
            gridItem.parentNode.insertBefore(timelineItem, gridItem.nextSibling);
        } else {
            gridItem.parentNode.appendChild(timelineItem);
        }

        // Handle sort options for timeline
        this.handleSortOptions(menu);
        
        // Update selection state
        this.updateMenuSelection(menu);
        
        // Set up listeners on native options
        this.setupNativeOptionListeners(menu);
    }

    /**
     * Create Timeline menu item matching Spotify's exact HTML structure
     * @param {HTMLElement} templateItem - The Grid li element to copy structure from
     * @returns {HTMLElement} Timeline menu item
     */
    createTimelineMenuItem(templateItem) {
        const li = document.createElement('li');
        li.setAttribute('role', 'presentation');
        li.className = templateItem.className + ' timeline-menu-option';

        const button = document.createElement('button');
        button.className = templateItem.querySelector('button').className;
        button.setAttribute('role', 'menuitemradio');
        button.setAttribute('aria-checked', this.core.state.isTimelineActive ? 'true' : 'false');
        button.setAttribute('tabindex', '-1');

        // Build button content matching Spotify's structure
        button.innerHTML = `
            ${this.getTimelineIcon()}
            <span class="e-91000-text encore-text-body-small ellipsis-one-line yjdsntzei5QWfVvE" data-encore-id="text" dir="auto">Timeline</span>
            <div class="ZjUuEcrKk8dIiPHd"></div>
            ${this.core.state.isTimelineActive ? this.getCheckmarkIcon() : ''}
        `;

        // Click handler
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('[MenuInjector] Timeline option clicked');
            
            // Close the dropdown menu
            this.closeDropdown();

            // Switch to timeline view
            await this.core.viewSwitcher.switchToTimeline('timeline-horizontal');
        });

        li.appendChild(button);
        return li;
    }

    /**
     * Handle sort options - when timeline is active, modify sort behavior
     * @param {HTMLElement} menu - The dropdown menu
     */
    handleSortOptions(menu) {
        const menuItems = menu.querySelectorAll('li[role="presentation"]');
        
        for (const item of menuItems) {
            const button = item.querySelector('button[role="menuitemradio"]');
            if (!button) continue;
            
            const text = button.textContent?.toLowerCase() || '';
            
            // Handle "Name" sort option - disable when timeline is active
            if (text.includes('name') && !text.includes('release')) {
                if (this.core.state.isTimelineActive) {
                    this.disableSortOption(button, item);
                }
            }
            
            // Handle "Release date" sort option - add ascending option when timeline is active
            if (text.includes('release date')) {
                if (this.core.state.isTimelineActive) {
                    this.enhanceReleaseDateOption(button, item, menu);
                }
            }
        }
    }

    /**
     * Disable a sort option (for Name when timeline is active)
     * @param {HTMLElement} button - Button element
     * @param {HTMLElement} item - Li element
     */
    disableSortOption(button, item) {
        button.style.opacity = '0.4';
        button.style.pointerEvents = 'none';
        button.style.cursor = 'not-allowed';
        button.setAttribute('aria-disabled', 'true');
        button.title = 'Name sorting is not available in Timeline view';
        
        // Mark as disabled
        item.classList.add('timeline-disabled-option');
    }

    /**
     * Enhance Release date option with ascending/descending toggle
     * @param {HTMLElement} button - Release date button
     * @param {HTMLElement} item - Li element
     * @param {HTMLElement} menu - Menu container
     */
    enhanceReleaseDateOption(button, item, menu) {
        // Check if we already added the ascending option
        if (menu.querySelector('.timeline-sort-asc-option')) return;

        // Create "Release date (Oldest first)" option
        const ascItem = document.createElement('li');
        ascItem.setAttribute('role', 'presentation');
        ascItem.className = item.className + ' timeline-sort-asc-option';

        const ascButton = document.createElement('button');
        ascButton.className = button.className;
        ascButton.setAttribute('role', 'menuitemradio');
        ascButton.setAttribute('aria-checked', this.currentSortOrder === 'asc' ? 'true' : 'false');
        ascButton.setAttribute('tabindex', '-1');

        ascButton.innerHTML = `
            <span class="e-91000-text encore-text-body-small ellipsis-one-line yjdsntzei5QWfVvE" data-encore-id="text" dir="auto">Release date ↑</span>
            <div class="ZjUuEcrKk8dIiPHd"></div>
            ${this.currentSortOrder === 'asc' ? this.getCheckmarkIcon() : ''}
        `;

        ascButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            this.currentSortOrder = 'asc';
            this.core.state.update({ sortOrder: 'asc' });
            
            this.closeDropdown();
            
            // Refresh timeline with new sort order
            await this.core.viewSwitcher.refresh();
            Spicetify.showNotification('Sorted by oldest first', false, 2000);
        });

        ascItem.appendChild(ascButton);

        // Update the existing "Release date" button to show it's descending
        const existingSpan = button.querySelector('span[data-encore-id="text"]');
        if (existingSpan && !existingSpan.textContent.includes('↓')) {
            existingSpan.textContent = 'Release date ↓';
        }

        // Update click handler for existing release date option
        button.addEventListener('click', async (e) => {
            if (this.core.state.isTimelineActive) {
                e.preventDefault();
                e.stopPropagation();
                
                this.currentSortOrder = 'desc';
                this.core.state.update({ sortOrder: 'desc' });
                
                this.closeDropdown();
                
                await this.core.viewSwitcher.refresh();
                Spicetify.showNotification('Sorted by newest first', false, 2000);
            }
        });

        // Insert ascending option after descending
        if (item.nextSibling) {
            item.parentNode.insertBefore(ascItem, item.nextSibling);
        } else {
            item.parentNode.appendChild(ascItem);
        }
    }

    /**
     * Close the dropdown menu
     */
    closeDropdown() {
        const combobox = this.core.state.comboboxButton;
        if (combobox) {
            combobox.click();
        } else {
            // Fallback: press Escape
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        }
    }

    /**
     * Set up click listeners on Spotify's native options (Grid/List)
     * @param {HTMLElement} menu - The menu element
     */
    setupNativeOptionListeners(menu) {
        const menuItems = menu.querySelectorAll('li[role="presentation"]');
        
        for (const item of menuItems) {
            // Skip our injected options
            if (item.classList.contains('timeline-menu-option') || 
                item.classList.contains('timeline-sort-asc-option') ||
                item.classList.contains('timeline-disabled-option')) {
                continue;
            }
            
            const button = item.querySelector('button[role="menuitemradio"]');
            if (!button) continue;
            
            const text = button.textContent?.toLowerCase() || '';
            
            // Only handle Grid and List options
            if (text.includes('grid') || text.includes('list')) {
                button.addEventListener('click', () => {
                    if (this.core.state.isTimelineActive) {
                        console.log('[MenuInjector] Native view option clicked, switching to grid');
                        this.core.viewSwitcher.switchToGrid();
                    }
                });
            }
        }
    }

    /**
     * Update selection state of menu options
     * @param {HTMLElement} menu - The menu element
     */
    updateMenuSelection(menu) {
        // Update Timeline option
        const timelineOption = menu.querySelector('.timeline-menu-option button');
        if (timelineOption) {
            const isSelected = this.core.state.isTimelineActive;
            timelineOption.setAttribute('aria-checked', isSelected ? 'true' : 'false');
            
            // Add/remove checkmark
            const existingCheckmark = timelineOption.querySelector('.YP0GJXkJCEklub1V');
            if (isSelected && !existingCheckmark) {
                timelineOption.insertAdjacentHTML('beforeend', this.getCheckmarkIcon());
            } else if (!isSelected && existingCheckmark) {
                existingCheckmark.remove();
            }
        }

        // If timeline is active, uncheck Grid and List options
        if (this.core.state.isTimelineActive) {
            const menuItems = menu.querySelectorAll('li[role="presentation"]');
            for (const item of menuItems) {
                if (item.classList.contains('timeline-menu-option')) continue;
                
                const button = item.querySelector('button[role="menuitemradio"]');
                if (!button) continue;
                
                const text = button.textContent?.toLowerCase() || '';
                if (text.includes('grid') || text.includes('list')) {
                    button.setAttribute('aria-checked', 'false');
                    // Remove checkmark if present
                    const checkmark = button.querySelector('.YP0GJXkJCEklub1V');
                    if (checkmark) checkmark.remove();
                }
            }
        }
    }

    /**
     * Remove all injected elements
     */
    removeInjectedOptions() {
        document.querySelectorAll('.timeline-menu-option, .timeline-sort-asc-option, .timeline-disabled-option')
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
        button.className = 'Button-sc-1dqy6lx-0 timeline-view-button e-91000-button--small';
        button.innerHTML = `
            <span style="display: flex; align-items: center; gap: 6px;">
                ${this.getTimelineIcon()}
                <span class="e-91000-text encore-text-body-small" data-encore-id="text">Timeline</span>
            </span>
        `;
        button.setAttribute('aria-label', 'Timeline view');
        button.style.cssText = `
            background: transparent;
            border: none;
            border-radius: 4px;
            color: var(--text-base, #fff);
            padding: 8px 12px;
            cursor: pointer;
            font-size: 14px;
            margin-left: 8px;
            transition: background-color 0.2s;
        `;
        
        button.addEventListener('click', () => this.core.viewSwitcher.handleButtonClick());
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = 'rgba(255,255,255,0.1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = 'transparent';
        });
        
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
            '[data-testid="action-bar-row"]',
            '[data-testid="action-bar"]',
            '[data-testid="actionBarRow"]',
            '[class*="ActionBar"]',
            '[class*="actionBar"]',
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element;
        }
        
        return null;
    }

    /**
     * Get the Timeline/Snake icon SVG (matching your uploaded image)
     * @returns {string} SVG HTML
     */
    getTimelineIcon() {
        return `<svg data-encore-id="icon" role="img" aria-hidden="true" class="e-91000-icon e-91000-baseline" style="--encore-icon-height: var(--encore-graphic-size-decorative-smaller); --encore-icon-width: var(--encore-graphic-size-decorative-smaller);" viewBox="0 0 16 16">
            <circle cx="2" cy="3" r="1.5" fill="currentColor"/>
            <circle cx="6" cy="3" r="1.25" stroke="currentColor" stroke-width="1" fill="none"/>
            <circle cx="10" cy="3" r="1.25" stroke="currentColor" stroke-width="1" fill="none"/>
            <circle cx="14" cy="3" r="1.5" fill="currentColor"/>
            <path d="M3.5 3 H4.75 M7.25 3 H8.75 M11.25 3 H12.5" stroke="currentColor" stroke-width="1"/>
            <path d="M14 4.5 Q14 7 12 8 Q8 10 4 8 Q2 7 2 9" stroke="currentColor" stroke-width="1" fill="none"/>
            <circle cx="2" cy="13" r="1.5" fill="currentColor"/>
            <circle cx="6" cy="13" r="1.25" stroke="currentColor" stroke-width="1" fill="none"/>
            <circle cx="10" cy="13" r="1.25" stroke="currentColor" stroke-width="1" fill="none"/>
            <circle cx="14" cy="13" r="1.5" fill="currentColor"/>
            <path d="M3.5 13 H4.75 M7.25 13 H8.75 M11.25 13 H12.5" stroke="currentColor" stroke-width="1"/>
            <path d="M2 10.5 Q2 12 4 12 Q8 12 12 12 Q14 12 14 11.5" stroke="currentColor" stroke-width="1" fill="none"/>
        </svg>`;
    }

    /**
     * Get the checkmark icon (used by Spotify for selected options)
     * @returns {string} SVG HTML
     */
    getCheckmarkIcon() {
        return `<svg data-encore-id="icon" role="img" aria-hidden="true" class="e-91000-icon e-91000-baseline YP0GJXkJCEklub1V" style="--encore-icon-height: var(--encore-graphic-size-decorative-smaller); --encore-icon-width: var(--encore-graphic-size-decorative-smaller);" viewBox="0 0 16 16"><path d="M15.53 2.47a.75.75 0 0 1 0 1.06L4.907 14.153.47 9.716a.75.75 0 0 1 1.06-1.06l3.377 3.376L14.47 2.47a.75.75 0 0 1 1.06 0"></path></svg>`;
    }
}