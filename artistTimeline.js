// NAME: Artist Discography Timeline
// AUTHOR: AhmedHanyMohammed
// DESCRIPTION: Visualize artist discography as an interactive timeline

/**
 * Main entry point for the Artist Timeline extension
 *
 * This file orchestrates all modules and initializes the extension.
 * It's kept minimal - all logic is delegated to specialized modules.
 *
 * Architecture:
 * - Config: Manages user settings (orientation, card size, etc.)
 * - State: Tracks current state (artist ID, view mode, DOM references)
 * - DOMUtils: Generic DOM helper utilities
 * - Navigator: Detects artist page navigation
 * - DataExtractor: Extracts release data from DOM/GraphQL
 * - TimelineCore: Handles all timeline rendering and interactions
 */

(async function main() {
    // ========================================
    // PHASE 1: Wait for Spicetify to be ready
    // ========================================

    /**
     * Check if all required Spicetify APIs are available
     * @returns {string[]} Array of missing component names
     */
    function checkSpicetifyReady() {
        const required = {
            'Spicetify': typeof Spicetify !== 'undefined',
            'Platform': Spicetify?.Platform,
            'Player': Spicetify?.Player,
            'CosmosAsync': Spicetify?.CosmosAsync,
        };

        const missing = Object.entries(required)
            .filter(([name, exists]) => !exists)
            .map(([name]) => name);

        return missing;
    }

    // Retry until Spicetify is ready
    const missingComponents = checkSpicetifyReady();
    if (missingComponents.length) {
        console.log(`[Timeline] Waiting for Spicetify. Missing: ${missingComponents.join(', ')}`);
        setTimeout(main, 100);
        return;
    }


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

    /**
     * Called when user navigates to an artist page
     * @param {string} artistId - Spotify artist ID
     */
    async function onArtistPageDetected(artistId) {
        console.log(`[Timeline] Artist page detected: ${artistId}`);

        try {
            // Wait for discography section to appear in DOM
            const discographyContainer = await waitForDiscography();
            console.log('[Timeline] ✓ Discography container found');

            // Initialize timeline (button injection + optional rendering)
            await timelineCore.initialize(discographyContainer, dataExtractor);
            console.log('[Timeline] ✓ Timeline initialized');

        } catch (error) {
            console.error('[Timeline] ✗ Error initializing timeline:', error);
            Spicetify.showNotification('Timeline failed to load', true);
        }
    }

    /**
     * Wait for discography section to load using multiple selector fallbacks
     * @returns {Promise<HTMLElement>} Discography container element
     * @throws {Error} If no container found after trying all selectors
     */
    async function waitForDiscography() {
        const selectors = [
            '[data-testid="artist-page-discography"]',  // Primary selector
            '.main-gridController-gridContainer',        // Fallback 1
            '[class*="discography"]',                    // Fallback 2
            'main[role="main"]'                          // Fallback 3 (broadest)
        ];

        for (const selector of selectors) {
            try {
                const element = await DOMUtils.waitForElement(selector, 3000);
                state.update({ originalGridContainer: element });
                console.log(`[Timeline] Found container with: ${selector}`);
                return element;
            } catch (_) {
                // Try next selector
                continue;
            }
        }

        throw new Error('Discography section not found after trying all selectors');
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
        console.log('[Timeline] Cleaning up before page unload...');
        navigator.stop();
        navigator.cleanup();
        timelineCore.destroy();
    });

    // ========================================
    // SUCCESS!
    // ========================================

    console.log('[Timeline] ✓✓✓ Extension loaded successfully!');
    Spicetify.showNotification('Artist Timeline ready! 🎵');
})();