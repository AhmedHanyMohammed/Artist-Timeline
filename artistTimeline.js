// NAME: Artist Discography Timeline
// AUTHOR: AhmedHanyMohammed
// DESCRIPTION: Visualize artist discography as an interactive timeline

async function artistTimeline(){
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

    const missingComponent = checkSpicetifyReady();
    if (missingComponent.length){
        console.log(`Artist Timeline: Waiting for Spicetify to be ready. Missing: ${missingComponent.join(', ')}`);
        setTimeout(artistTimeline, 100);
        return;
    }

    const config = new Config();
    const state = new State();

    async function onArtistPageLoad(artistId) {
        try{
            await waitForDiscography();
            // phase 3 will continue from here
        } catch (error) {
            console.error("Artist Timeline: Error loading discography", error);
        }
    }

    async function waitForDiscography() {
        const selector = [
            '[data-testid="artist-page-discography"]',
            '.main-gridController-gridContainer',
            '[class*="discography"]',
            'main[role="main"]'
        ];
        for(const sel of selector){
            try {
                const element = await DOMUtils.waitForElement(selector, 3000);
                state.update({originalGridContainer :element});
                return element;
            } catch (error){
                console.warn(`Artist Timeline: Could not find discography using selector: ${sel}`);
                continue;
            }
        }
        throw new Error('Artist Timeline: Discography section not found');
    }
    // Create the Navigator instance
    // Pass it the state object and the callback function
    const navigator = new Navigator(state, onArtistPageLoad);

    // Start listening to navigation
    navigator.start();


     // Clean up when Spotify is closing
     // This prevents memory leaks
    window.addEventListener('beforeunload', () => {
        console.log('[Timeline] Cleaning up before page unload');

        // Stop listening to navigation
        navigator.stop();

        // Clean up any DOM elements
        navigator.cleanup();
    });
}