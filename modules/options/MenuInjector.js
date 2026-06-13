/**
 * MenuInjector - Handles injection of Timeline options into Spotify's dropdown menu
 */
class MenuInjector {
    constructor(core) {
        this.core = core;
        this.menuObserver = null;
        this.currentSortOrder = 'desc';
        this._pollingInterval = null;
    }

    async initialize(container) {
        console.log('[MenuInjector] Initializing...');
        
        // Wait for Spotify to render
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const comboboxButton = await this.findComboboxButton();
        
        if (!comboboxButton) {
            console.warn('[MenuInjector] Combobox button not found, using fallback');
            this.injectFallbackButton(container);
            return;
        }

        console.log('[MenuInjector] ✓ Found combobox button');
        this.core.state.update({ comboboxButton });
        
        // Strategy 1: Observer (Primary)
        this.observeDropdownMenu();

        // Strategy 2: Polling (Backup Safety Net)
        // Checks every 1.5 seconds if the menu is open but we missed injecting it
        this.startPolling();
    }

    destroy() {
        this.removeInjectedOptions();
        this.stopPolling();
        if (this.menuObserver) {
            this.menuObserver.disconnect();
            this.menuObserver = null;
        }
    }

    startPolling() {
        this.stopPolling();
        this._pollingInterval = setInterval(() => {
            const menu = document.querySelector('ul[role="menu"], #sort-and-view-picker');
            if (menu && this.isValidMenu(menu)) {
                // Only try to inject if our option isn't there yet
                if (!menu.querySelector('.timeline-menu-option')) {
                    console.log('[MenuInjector] Menu found via polling (Observer missed it)');
                    this.injectTimelineOption(menu);
                }
            }
        }, 1500);
    }

    stopPolling() {
        if (this._pollingInterval) {
            clearInterval(this._pollingInterval);
            this._pollingInterval = null;
        }
    }

    /**
     * Find the combobox button
     */
    async findComboboxButton() {
        // Expanded selectors to handle different Spotify versions
        const selectors = [
            'button[aria-controls="sort-and-view-picker"]',
            'button[role="combobox"][aria-haspopup="true"]',
            'button[data-testid="sort-and-view-picker-button"]',
            'button[aria-haspopup="listbox"]',
            'button[aria-haspopup="menu"]',
            // Try finding by button near the discography section
            '[data-testid="artist-page"] button[aria-haspopup]',
            '[data-testid="artist-page"] button[role="combobox"]',
            // Generic combobox button
            'button:has([class*="dropdown"], [class*="menu"], [class*="sort"], [class*="view"])'
        ];

        for (let attempt = 0; attempt < 30; attempt++) {
            for (const selector of selectors) {
                const button = document.querySelector(selector);
                if (button) {
                    // Validate it's likely the sort/view button
                    const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
                    const title = button.getAttribute('title')?.toLowerCase() || '';
                    const text = button.textContent?.toLowerCase() || '';

                    // Check if it looks like a sort/view button
                    const isSortViewButton = ariaLabel.includes('sort') || ariaLabel.includes('view') ||
                                           title.includes('sort') || title.includes('view') ||
                                           text.includes('sort') || text.includes('view') ||
                                           text.length === 0; // Icon-only buttons are common

                    if (isSortViewButton) {
                        console.log(`[MenuInjector] Found combobox via: ${selector}`);
                        return button;
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        return null;
    }

    /**
     * Observe for dropdown menu
     */
    observeDropdownMenu() {
        console.log('[MenuInjector] Setting up menu observer');
        
        this.menuObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check the node itself
                        if (this.isValidMenu(node)) {
                            this.injectTimelineOption(node);
                            return;
                        }
                        // Check children (Spotify often wraps the UL in a div)
                        const menu = node.querySelector?.('ul[role="menu"]');
                        if (menu && this.isValidMenu(menu)) {
                            this.injectTimelineOption(menu);
                            return;
                        }
                    }
                }
            }
        });

        // Observe body for portals
        this.menuObserver.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Validates if a node is the correct "Sort & View" menu
     * Uses text content matching and structure validation
     */
    isValidMenu(node) {
        // 1. Must be a menu-like element
        const isMenu = (node.tagName === 'UL' || node.getAttribute?.('role') === 'menu') ||
                       node.querySelector?.('ul[role="menu"]');

        if (!isMenu) return false;

        // 2. Check for menu items with specific keywords
        const text = node.textContent || '';

        // Must have at least one view option (Grid or List)
        const hasViewOption = text.includes('Grid') || text.includes('List');

        // Should have sort options (but be lenient - might be translated or have different names)
        const hasSortLike = text.includes('Sort') || text.includes('Release') ||
                           text.includes('Name') || text.length > 50;

        // Valid if it has view options and looks like a sort menu
        return hasViewOption && hasSortLike;
    }

    /**
     * Inject Timeline option into menu
     */
    injectTimelineOption(menu) {
        if (menu.querySelector('.timeline-menu-option')) {
            this.updateMenuSelection(menu);
            return;
        }

        console.log('[MenuInjector] Injecting Timeline option');

        // Find Grid option
        const menuItems = menu.querySelectorAll('li[role="presentation"]');
        let gridItem = null;

        for (const item of menuItems) {
            const btn = item.querySelector('button[role="menuitemradio"]');
            if (btn && btn.textContent?.toLowerCase().includes('grid')) {
                gridItem = item;
                break;
            }
        }

        if (!gridItem) {
            // Fallback: Use the last item if Grid isn't found
            if (menuItems.length > 0) {
                 gridItem = menuItems[menuItems.length - 1];
            } else {
                 return;
            }
        }

        // Create Timeline option
        const timelineItem = this.createTimelineMenuItem(gridItem);
        
        // Insert after Grid (or whatever item we found)
        if (gridItem.nextSibling) {
            gridItem.parentNode.insertBefore(timelineItem, gridItem.nextSibling);
        } else {
            gridItem.parentNode.appendChild(timelineItem);
        }

        this.handleSortOptions(menu);
        this.updateMenuSelection(menu);
        this.setupNativeOptionListeners(menu);
    }

    /**
     * Create Timeline menu item matching Spotify's structure
     */
    createTimelineMenuItem(templateItem) {
        const li = document.createElement('li');
        li.setAttribute('role', 'presentation');
        li.className = templateItem.className;
        li.classList.add('timeline-menu-option');

        const templateButton = templateItem.querySelector('button');
        const button = document.createElement('button');
        button.className = templateButton ? templateButton.className : ''; 
        button.setAttribute('role', 'menuitemradio');
        button.setAttribute('aria-checked', this.core.state.isTimelineActive ? 'true' : 'false');
        button.setAttribute('tabindex', '-1');

        button.innerHTML = `
            ${this.getTimelineIcon()}
            <span class="e-91000-text encore-text-body-small ellipsis-one-line" data-encore-id="text" dir="auto">Timeline</span>
            ${this.core.state.isTimelineActive ? this.getCheckmarkIcon() : ''}
        `;

        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('[MenuInjector] Timeline clicked');
            this.closeDropdown();
            await this.core.viewSwitcher.switchToTimeline('timeline-horizontal');
        });

        li.appendChild(button);
        return li;
    }

    handleSortOptions(menu) {
        if (!this.core.state.isTimelineActive) return;
        
        const menuItems = menu.querySelectorAll('li[role="presentation"]');
        
        for (const item of menuItems) {
            const button = item.querySelector('button[role="menuitemradio"]');
            if (!button) continue;
            
            const text = button.textContent?.toLowerCase() || '';
            
            // Disable Name sort
            if (text === 'name') {
                button.style.opacity = '0.4';
                button.style.pointerEvents = 'none';
                button.setAttribute('aria-disabled', 'true');
                item.classList.add('timeline-disabled-option');
            }
            
            // Add ascending option for Release date
            if (text.includes('release date') && !menu.querySelector('.timeline-sort-asc-option')) {
                this.addAscendingOption(button, item, menu);
            }
        }
    }

    addAscendingOption(button, item, menu) {
        const ascItem = document.createElement('li');
        ascItem.setAttribute('role', 'presentation');
        ascItem.className = item.className;
        ascItem.classList.add('timeline-sort-asc-option');

        const ascButton = document.createElement('button');
        ascButton.className = button.className;
        ascButton.setAttribute('role', 'menuitemradio');
        ascButton.setAttribute('aria-checked', this.currentSortOrder === 'asc' ? 'true' : 'false');
        ascButton.setAttribute('tabindex', '-1');

        ascButton.innerHTML = `
            <span class="e-91000-text encore-text-body-small ellipsis-one-line" data-encore-id="text" dir="auto">Release date ↑</span>
            ${this.currentSortOrder === 'asc' ? this.getCheckmarkIcon() : ''}
        `;

        ascButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.currentSortOrder = 'asc';
            this.core.state.update({ sortOrder: 'asc' });
            this.closeDropdown();
            await this.core.viewSwitcher.refresh();
            Spicetify.showNotification('Sorted oldest first', false, 2000);
        });

        ascItem.appendChild(ascButton);

        // Update existing to show descending
        const span = button.querySelector('span[data-encore-id="text"]');
        if (span && !span.textContent.includes('↓')) {
            span.textContent = 'Release date ↓';
        }

        item.parentNode.insertBefore(ascItem, item.nextSibling);
    }

    closeDropdown() {
        const btn = this.core.state.comboboxButton;
        if (btn) btn.click();
    }

    setupNativeOptionListeners(menu) {
        const items = menu.querySelectorAll('li[role="presentation"]');
        
        for (const item of items) {
            if (item.classList.contains('timeline-menu-option') || 
                item.classList.contains('timeline-sort-asc-option')) continue;
            
            const btn = item.querySelector('button[role="menuitemradio"]');
            if (!btn) continue;
            
            const text = btn.textContent?.toLowerCase() || '';
            if (text.includes('grid') || text.includes('list')) {
                btn.addEventListener('click', () => {
                    if (this.core.state.isTimelineActive) {
                        this.core.viewSwitcher.switchToGrid();
                    }
                });
            }
        }
    }

    updateMenuSelection(menu) {
        const timelineBtn = menu.querySelector('.timeline-menu-option button');
        if (timelineBtn) {
            const isActive = this.core.state.isTimelineActive;
            timelineBtn.setAttribute('aria-checked', isActive ? 'true' : 'false');
            
            const checkmark = timelineBtn.querySelector('svg:last-child');
             // Be careful not to remove the icon if it's the only svg
            const isCheckmark = checkmark && !checkmark.classList.contains('e-91000-icon'); 

            if (isActive && !isCheckmark) {
                timelineBtn.insertAdjacentHTML('beforeend', this.getCheckmarkIcon());
            } else if (!isActive && isCheckmark) {
                checkmark.remove();
            }
        }

        if (this.core.state.isTimelineActive) {
            menu.querySelectorAll('li[role="presentation"]').forEach(item => {
                if (item.classList.contains('timeline-menu-option')) return;
                const btn = item.querySelector('button[role="menuitemradio"]');
                if (!btn) return;
                const text = btn.textContent?.toLowerCase() || '';
                if (text.includes('grid') || text.includes('list')) {
                    btn.setAttribute('aria-checked', 'false');
                    // Try to find checkmark to remove
                     const cm = btn.querySelector('svg:last-child');
                     // Simple heuristic: checkmarks are usually the last child SVG
                     if (cm && cm.innerHTML.includes('path')) cm.remove();
                }
            });
        }
    }

    removeInjectedOptions() {
        document.querySelectorAll('.timeline-menu-option, .timeline-sort-asc-option, .timeline-disabled-option')
            .forEach(el => el.remove());
    }

    injectFallbackButton(container) {
        const actionBar = document.querySelector('[data-testid="action-bar-row"]') ||
                         document.querySelector('[data-testid="action-bar"]');
        
        if (!actionBar || this.core.state.injectedButton) return;

        const button = document.createElement('button');
        button.className = 'timeline-fallback-button';
        button.innerHTML = `${this.getTimelineIcon()} Timeline`;
        button.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 500px;
            color: #fff;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            margin-left: 8px;
        `;
        
        button.addEventListener('click', () => this.core.viewSwitcher.handleButtonClick());
        actionBar.appendChild(button);
        this.core.state.update({ injectedButton: button });
    }

    findControlsBar(container) {
        return document.querySelector('[data-testid="action-bar-row"]') ||
               document.querySelector('[data-testid="action-bar"]');
    }

    getTimelineIcon() {
        return `<svg data-encore-id="icon" role="img" aria-hidden="true" class="e-91000-icon e-91000-baseline" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 3a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm5 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm3 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zM3.5 3h1m3 0h2m3 0h1" stroke="currentColor"/><path d="M14 4.5c0 2-2 3-6 3s-6 1-6 2" fill="none" stroke="currentColor"/><path d="M2 10.5c0 1 2 1.5 6 1.5s6-.5 6-1.5" fill="none" stroke="currentColor"/><circle cx="2" cy="13" r="1.5" fill="currentColor"/><circle cx="6" cy="13" r="1" stroke="currentColor" fill="none"/><circle cx="10" cy="13" r="1" stroke="currentColor" fill="none"/><circle cx="14" cy="13" r="1.5" fill="currentColor"/></svg>`;
    }

    getCheckmarkIcon() {
        return `<svg role="img" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M15.53 2.47a.75.75 0 0 1 0 1.06L4.907 14.153.47 9.716a.75.75 0 0 1 1.06-1.06l3.377 3.376L14.47 2.47a.75.75 0 0 1 1.06 0"></path></svg>`;
    }
}