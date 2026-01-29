// NAME: Artist Discography Timeline
// AUTHOR: AhmedHanyMohammed
// DESCRIPTION: Visualize artist discography as an interactive timeline

(async function main() {
    // ========================================
    // PHASE 1: Wait for Spicetify to be ready
    // ========================================

    function checkSpicetifyReady() {
        const required = {
            'Spicetify': typeof Spicetify !== 'undefined',
            'Platform': Spicetify?.Platform,
            'Player': Spicetify?.Player,
        };

        const missing = Object.entries(required)
            .filter(([name, exists]) => !exists)
            .map(([name]) => name);

        return missing;
    }

    const missingComponents = checkSpicetifyReady();
    if (missingComponents.length) {
        console.log(`[Timeline] Waiting for Spicetify. Missing: ${missingComponents.join(', ')}`);
        setTimeout(main, 100);
        return;
    }

    console.log('[Timeline] ✓ Spicetify ready, initializing extension...');

    // ========================================
    // PHASE 2: Initialize all modules
    // ========================================

    const config = new Config();
    const state = new State();
    const dataExtractor = new DataExtractor();
    const timelineCore = new TimelineCore(config, state);

    // ========================================
    // PHASE 3: Set up artist page detection
    // ========================================

    async function onArtistPageDetected(artistId) {
        console.log(`[Timeline] Artist page detected: ${artistId}`);

        try {
            // Wait for the page content to load
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Wait for discography section to appear in DOM
            const discographyContainer = await waitForDiscography();
            
            if (!discographyContainer) {
                console.warn('[Timeline] No discography container found');
                return;
            }
            
            console.log('[Timeline] ✓ Discography container found:', discographyContainer);

            // Store reference
            state.update({ originalGridContainer: discographyContainer });

            // Initialize timeline
            await timelineCore.initialize(discographyContainer, dataExtractor);
            console.log('[Timeline] ✓ Timeline initialized');

        } catch (error) {
            console.error('[Timeline] ✗ Error initializing timeline:', error);
        }
    }

    /**
     * Wait for discography section to load
     * This function now properly waits for the grid container that holds album cards
     */
    async function waitForDiscography() {
        console.log('[Timeline] Waiting for discography container...');
        
        // These selectors target the actual content container
        const selectors = [
            // Grid container that holds the cards
            '[data-testid="grid-container"]',
            'div[role="grid"]',
            // Main grid container class
            '.main-gridContainer-gridContainer',
            // Section containing cards
            'section[data-testid="artist-page"] [role="grid"]',
            // Discography specific
            '[data-testid="artist-discography"]',
            // Card container
            '.contentSpacing section',
            // Fallback - any container with cards
            'div[class*="grid"] div[class*="Card"]',
        ];

        // Try each selector with retries
        for (let attempt = 0; attempt < 30; attempt++) {
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    // Verify it has album cards or is near them
                    const hasCards = element.querySelector('[class*="Card"]') || 
                                    element.closest('section')?.querySelector('[class*="Card"]');
                    
                    if (hasCards || attempt > 15) {
                        console.log(`[Timeline] Found container with: ${selector}`);
                        
                        // Return the parent that contains all cards
                        const cardContainer = element.closest('section') || 
                                            element.closest('[data-testid="grid-container"]') ||
                                            element;
                        return cardContainer;
                    }
                }
            }
            
            // Also try finding by card presence
            const cards = document.querySelectorAll('[class*="Card"][draggable="true"]');
            if (cards.length > 0) {
                const container = cards[0].closest('[data-testid="grid-container"]') ||
                                cards[0].closest('div[role="grid"]') ||
                                cards[0].closest('section') ||
                                cards[0].parentElement?.parentElement;
                if (container) {
                    console.log('[Timeline] Found container via card elements');
                    return container;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.warn('[Timeline] Could not find discography container');
        return null;
    }

    // ========================================
    // PHASE 4: Start navigation listener
    // ========================================

    const navigator = new Navigator(state, onArtistPageDetected);
    navigator.start();

    // ========================================
    // PHASE 5: Set up cleanup on page unload
    // ========================================

    window.addEventListener('beforeunload', () => {
        console.log('[Timeline] Cleaning up...');
        navigator.stop();
        navigator.cleanup();
        timelineCore.destroy();
    });

    console.log('[Timeline] ✓✓✓ Extension loaded successfully!');
})();