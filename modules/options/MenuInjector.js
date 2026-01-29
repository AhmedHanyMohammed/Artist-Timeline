/**
 * MenuInjector - Handles injection of Timeline options into Spotify's dropdown menu
 */
class MenuInjector {
    constructor(core) {
        this.core = core;
        this.menuObserver = null;
        this.currentSortOrder = 'desc';
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
        this.observeDropdownMenu();
    }

    destroy() {
        this.removeInjectedOptions();
        if (this.menuObserver) {
            this.menuObserver.disconnect();
            this.menuObserver = null;
        }
    }

    /**
     * Find the combobox button
     * Target: button[role="combobox"][aria-controls="sort-and-view-picker"]
     */
    async findComboboxButton() {
        const primarySelector = 'button[role="combobox"][aria-controls="sort-and-view-picker"]';
        
        for (let attempt = 0; attempt < 20; attempt++) {
            const button = document.querySelector(primarySelector);
            if (button) {
                return button;
            }

            // Fallback selectors
            const fallbacks = [
                'button[role="combobox"][aria-haspopup="true"]',
                'button[aria-haspopup="listbox"]',
            ];

            for (const sel of fallbacks) {
                const btn = document.querySelector(sel);
                if (btn) return btn;
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
                        const menu = this.findTargetMenu(node);
                        if (menu) {
                            console.log('[MenuInjector] ✓ Menu detected');
                            setTimeout(() => this.injectTimelineOption(menu), 50);
                        }
                    }
                }
            }
        });

        this.menuObserver.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Find the dropdown menu
     */
    findTargetMenu(node) {
        // Direct match
        if (node.tagName === 'UL' && node.getAttribute('role') === 'menu') {
            return node;
        }
        
        // Search inside
        const menu = node.querySelector?.('ul[role="menu"]');
        if (menu) return menu;
        
        // Check ID
        if (node.id === 'sort-and-view-picker') return node;
        const byId = node.querySelector?.('#sort-and-view-picker');
        if (byId) return byId;
        
        return null;
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
            console.warn('[MenuInjector] Grid option not found');
            return;
        }

        // Create Timeline option
        const timelineItem = this.createTimelineMenuItem(gridItem);
        
        // Insert after Grid
        gridItem.parentNode.insertBefore(timelineItem, gridItem.nextSibling);

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
        button.className = templateButton.className;
        button.setAttribute('role', 'menuitemradio');
        button.setAttribute('aria-checked', this.core.state.isTimelineActive ? 'true' : 'false');
        button.setAttribute('tabindex', '-1');

        // Use the exact same structure as Grid/List buttons
        button.innerHTML = `
            ${this.getTimelineIcon()}
            <span class="e-91000-text encore-text-body-small ellipsis-one-line yjdsntzei5QWfVvE" data-encore-id="text" dir="auto">Timeline</span>
            <div class="ZjUuEcrKk8dIiPHd"></div>
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
            
            const checkmark = timelineBtn.querySelector('.YP0GJXkJCEklub1V');
            if (isActive && !checkmark) {
                timelineBtn.insertAdjacentHTML('beforeend', this.getCheckmarkIcon());
            } else if (!isActive && checkmark) {
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
                    const cm = btn.querySelector('.YP0GJXkJCEklub1V');
                    if (cm) cm.remove();
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

    /**
     * Timeline icon matching your uploaded snake image
     */
    getTimelineIcon() {
        return `<svg data-encore-id="icon" role="img" aria-hidden="true" class="e-91000-icon e-91000-baseline" viewBox="0 0 16 16" style="--encore-icon-height: var(--encore-graphic-size-decorative-smaller); --encore-icon-width: var(--encore-graphic-size-decorative-smaller);"><circle cx="2" cy="3" r="1.5" fill="currentColor"/><circle cx="6" cy="3" r="1" stroke="currentColor" stroke-width="1" fill="none"/><circle cx="10" cy="3" r="1" stroke="currentColor" stroke-width="1" fill="none"/><circle cx="14" cy="3" r="1.5" fill="currentColor"/><path d="M3.5 3h1m3 0h2m3 0h1" stroke="currentColor" stroke-width="1"/><path d="M14 4.5c0 2-2 3-6 3s-6 1-6 2" stroke="currentColor" stroke-width="1" fill="none"/><circle cx="2" cy="13" r="1.5" fill="currentColor"/><circle cx="6" cy="13" r="1" stroke="currentColor" stroke-width="1" fill="none"/><circle cx="10" cy="13" r="1" stroke="currentColor" stroke-width="1" fill="none"/><circle cx="14" cy="13" r="1.5" fill="currentColor"/><path d="M3.5 13h1m3 0h2m3 0h1" stroke="currentColor" stroke-width="1"/><path d="M2 10.5c0 1 2 1.5 6 1.5s6-.5 6-1.5" stroke="currentColor" stroke-width="1" fill="none"/></svg>`;
    }

    /**
     * Checkmark icon used by Spotify
     */
    getCheckmarkIcon() {
        return `<svg data-encore-id="icon" role="img" aria-hidden="true" class="e-91000-icon e-91000-baseline YP0GJXkJCEklub1V" viewBox="0 0 16 16" style="--encore-icon-height: var(--encore-graphic-size-decorative-smaller); --encore-icon-width: var(--encore-graphic-size-decorative-smaller);"><path d="M15.53 2.47a.75.75 0 0 1 0 1.06L4.907 14.153.47 9.716a.75.75 0 0 1 1.06-1.06l3.377 3.376L14.47 2.47a.75.75 0 0 1 1.06 0"></path></svg>`;
    }
}