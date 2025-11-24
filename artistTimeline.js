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
        for (const sel of selector) {
            try {
                const element = await DOMUtils.waitForElement(sel, 3000);
                state.update({ originalGridContainer: element });
                return element;
            } catch (_e) {
                continue;
            }
        }
        throw new Error('Artist Timeline: Discography section not found');
    }

    function extractReleaseFromDOM(root){
        if(!root) return [];

        const cardAnchors = Array.from(root.querySelectorAll(
            // Typical card link under discography
            '[data-testid="card"] a[href*="/album/"], a[href*="/album/"]'
        ));

        const player = Spicertify?.Player;
        const playingAlbumUri = player?.data?.item?.album?.uri || '';

        const releases = cardAnchors.map(anchor => {
            const href = anchor.getAttribute('href') || '';
            const idMatch = href.match(/\/album\/([a-zA-Z0-9]+)/);
            const albumId = idMatch ? idMatch[1] : null;
            const uri = albumId ? `spotify:album:${albumId}` : null;

            const titleNode =
                anchor.querySelector('[data-testid="entity-title"]') ||
                anchor.querySelector('[dir]') ||
                anchor.querySelector('span') ||
                anchor;

            const name = (titleNode?.textContent || '').trim();

            // Image
            const img = anchor.querySelector('img');
            const image = img?.getAttribute('src') || img?.getAttribute('data-src') || '';

            // Type (Album, Single, Compilation)
            const aria = anchor.getAttribute('aria-label') || '';
            let type = /single/i.test(aria) ? 'Single' :
                       /compilation/i.test(aria) ? 'Compilation' :
                       'Album';
            // Try tiny text chips
            const typeChip = anchor.querySelector('[data-testid*="subtitle"], [class*="TypeBadge"], small, .Type__TypeElement');
            if (typeChip) {
                const t = typeChip.textContent.toLowerCase();
                if (t.includes('single')) type = 'single';
                else if (t.includes('compilation')) type = 'compilation';
                else if (t.includes('album')) type = 'album';
            }

            // Date — try <time> or year-like fragments
            let dateStr = '';
            const timeEl = anchor.querySelector('time');
            if (timeEl?.getAttribute('datetime')) {
                dateStr = timeEl.getAttribute('datetime');
            }
            else if (timeEl?.textContent) {dateStr = timeEl.textContent;}
            else {
                // fall back to text that looks like a year
                const dateNode = anchor.querySelector('[data-testid*="release"], [class*="date"], [class*="year"], small');
                dateStr = (dateNode?.textContent || '').trim();
            }

            let date = null;
            if (dateStr) {
                const d = new Date(dateStr);
                if (!Number.isNaN(d.getTime())) date = d;
                else {
                    // try year-only
                    const yr = dateStr.match(/(19|20)\d{2}/);
                    if (yr) date = new Date(parseInt(yr[0], 10), 0, 1);
                }
            }

            const isPlaying = !!(uri && playingAlbumUri && playingAlbumUri === uri);
            return {uri, name, type, image, date, isPlaying};
        });
        // Filter incomplete items and sort by date ascending
        return releases
            .filter(x => x.uri && x.name)
            .sort((a, b) => {
                const ta = xTime(a.date), tb = xTime(b.date);
                return ta - tb;
            });

        function xTime(d) { return d instanceof Date ? d.getTime() : Number.MAX_SAFE_INTEGER; }
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