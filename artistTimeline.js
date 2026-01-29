
// ============================================
// Artist Discography Timeline - Bundled Build
// Author: AhmedHanyMohammed
// ============================================

(function() {
    // Inject CSS styles
    const style = document.createElement('style');
    style.id = 'artist-timeline-styles';
    style.textContent = `/**
 * Artist Timeline Styles
 * Updated with Snake Layout and Glow Effects
 */

/* ========================================
   TIMELINE BUTTON
   ======================================== */
.timeline-view-button {
    padding: 8px 16px;
    margin: 0 4px;
    background-color: transparent;
    border: none;
    border-radius: 4px;
    color: var(--spice-subtext, #b3b3b3);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.timeline-view-button:hover {
    background-color: var(--spice-button-active, rgba(255, 255, 255, 0.1));
    color: var(--spice-text, #ffffff);
}

.timeline-view-button--active {
    background-color: var(--spice-button, rgba(255, 255, 255, 0.07));
    color: var(--spice-text, #ffffff);
}

.timeline-orientation-button {
    padding: 8px; /* Square button */
}

/* ========================================
   TIMELINE CONTAINER
   ======================================== */
.timeline-view {
    position: relative;
    padding: 60px 20px;
    min-height: 400px;
    /* Default scrollbar styling */
    scrollbar-width: thin;
    scrollbar-color: var(--spice-button, rgba(255, 255, 255, 0.1)) transparent;
}

/* ========================================
   HORIZONTAL LAYOUT
   ======================================== */
.timeline--horizontal .timeline-track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--spice-button, rgba(255, 255, 255, 0.1));
    transform: translateY(-50%);
    z-index: 1;
}

.timeline--horizontal .timeline-cards {
    display: flex;
    align-items: center; /* Center cards on the line */
    gap: 48px; /* Default gap, overridden by JS if proportional */
    padding: 20px;
    position: relative;
    z-index: 2;
}

/* ========================================
   SNAKE (VERTICAL) LAYOUT
   ======================================== */
.timeline--vertical-snake .timeline-snake-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}

.timeline-snake-row {
    display: flex;
    position: relative;
    padding: 40px 0;
    width: 100%;
    justify-content: flex-start; /* Standard L->R */
    align-items: center;
}

.timeline-snake-row--reverse {
    flex-direction: row-reverse; /* Reverse R->L */
}

/* The horizontal line for each row */
.timeline-snake-line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--spice-button, rgba(255, 255, 255, 0.1));
    z-index: 0;
    transform: translateY(-50%);
}

/* Turns (Curves connecting rows) */
.timeline-snake-turn {
    width: 100%; /* Spans full width */
    height: 80px; /* Vertical gap between rows */
    position: relative;
    margin-top: -40px; /* Overlap to connect lines */
    margin-bottom: -40px;
    z-index: 0;
    pointer-events: none;
}

/* Right Turn: Connects end of Row 1 (Right) to start of Row 2 (Right) */
.timeline-snake-turn--right {
    border-right: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-top: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-bottom: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-top-right-radius: 40px;
    border-bottom-right-radius: 40px;
    width: 50%;
    margin-left: 50%; /* Shift to right half */
}

/* Left Turn: Connects end of Row 2 (Left) to start of Row 3 (Left) */
.timeline-snake-turn--left {
    border-left: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-top: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-bottom: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-top-left-radius: 40px;
    border-bottom-left-radius: 40px;
    width: 50%;
    margin-right: 50%; /* Shift to left half */
}


/* ========================================
   TIMELINE CARDS
   ======================================== */
.timeline-card {
    flex-shrink: 0;
    cursor: pointer;
    transition: transform 0.2s ease;
    outline: none;
    position: relative;
    z-index: 2; /* Above lines */
}

.timeline-card:hover {
    transform: scale(1.05);
    z-index: 10;
}

/* Marker (Dot) */
.timeline-card__marker {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--spice-text, #ffffff);
    margin: 0 auto 16px; /* Centered above content */
    box-shadow: 0 0 0 4px var(--spice-main-transition, #121212); /* Fake border to mask line */
}

/* GLOW EFFECT & PLAYING STATE */
.timeline-card--playing .timeline-card__marker {
    background-color: var(--spice-main, #1db954);
    box-shadow: 0 0 15px 2px var(--spice-main, #1db954);
    animation: pulse 2s infinite;
}

.timeline-card--playing .timeline-card__image {
    box-shadow: 0 0 25px 5px rgba(29, 185, 84, 0.5); /* Green glow behind image */
    border: 2px solid var(--spice-main, #1db954);
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
}

/* Card Content */
.timeline-card__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 200px;
    background-color: var(--spice-main-transition, #121212); /* Background to cover line if needed */
    padding: 10px;
    border-radius: 8px;
}

.timeline-card__image-wrapper {
    position: relative;
    width: 180px;
    height: 180px;
    margin-bottom: 12px;
}

.timeline-card__image {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    transition: box-shadow 0.3s ease;
}

/* Play Button */
.timeline-card__play-button {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--spice-main, #1db954);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.timeline-card__image-wrapper:hover .timeline-card__play-button {
    opacity: 1;
    transform: scale(1);
}

.timeline-card__play-button:hover {
    background-color: #1ed760;
    transform: scale(1.1);
}

.timeline-card__play-button svg {
    width: 20px;
    height: 20px;
    fill: #000000;
}

/* Text Info */
.timeline-card__info {
    text-align: center;
}

.timeline-card__title {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--spice-text, #ffffff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
}

.timeline-card__meta {
    font-size: 13px;
    color: var(--spice-subtext, #b3b3b3);
}

/* ========================================
   SCROLL BUTTONS (Horizontal Only)
   ======================================== */
.timeline-scroll-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(0,0,0, 0.5);
    border: 1px solid rgba(255,255,255,0.1);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    transition: all 0.2s ease;
    opacity: 0; /* Hidden by default, show on hover of container */
}

.timeline-view:hover .timeline-scroll-button {
    opacity: 1;
}

.timeline-scroll-button:hover {
    background-color: rgba(0,0,0, 0.8);
    transform: translateY(-50%) scale(1.1);
}

.timeline-scroll-button--left { left: 10px; }
.timeline-scroll-button--right { right: 10px; }

.timeline-scroll-button svg {
    width: 24px;
    height: 24px;
    fill: #ffffff;
}

.timeline-scroll-button:disabled {
    opacity: 0;
    pointer-events: none;
}`;
    if (!document.getElementById('artist-timeline-styles')) {
        document.head.appendChild(style);
    }
})();


// ========== modules/Config.js ==========
class Config {
    constructor() {
        this.Storage_Key = 'artist_timeline_config';
        this.Defaults = {
            orientation : 'horizontal',
            cardSize : 'medium',
            autoScrollToPlay : true,
            animationSpeed : 0,
        };
        this.config = this.load();
    }

    load() {
        try{
            const saved = localStorage.getItem(this.Storage_Key);
            if(saved){
                return {...this.Defaults, ...JSON.parse(saved)};
            }
        }
        catch (error) {
            console.error('Error loading config:', error);
        }
        return {...this.Defaults};
    }

    // How It works:
    // Take the config object
    // Convert it to a JSON string
    // Save it to localstorage
    save(config) {
        try{
            const jsonString = JSON.stringify(config);
            localStorage.setItem(this.Storage_Key, jsonString);
            this.config = config;
        }
        catch (error) {
            console.error('Error saving config:', error);
        }
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        this.save(this.config);
    }

    reset() {
        this.config = {...this.Defaults};
        this.save(this.config);
    }
}

// ========== modules/State.js ==========
class State {
    constructor() {
        // View preferences key
        this.VIEW_PREF_KEY = 'artist-timeline-view-preference';
        this.SORT_ORDER_KEY = 'artist-timeline-sort-order';

        this.currentArtistId = null;
        this.currentView = this.loadViewPref();
        this.sortOrder = this.loadSortOrder();
        this.isTimelineActive = false;
        this.timelineContainer = null;
        this.originalGridContainer = null;
        this.injectedButton = null;
        this.comboboxButton = null;
        this.lastPathname = null;
    }

    loadViewPref() {
        return localStorage.getItem(this.VIEW_PREF_KEY) || 'grid';
    }

    saveViewPref(view) {
        localStorage.setItem(this.VIEW_PREF_KEY, view);
        this.currentView = view;
    }

    loadSortOrder() {
        return localStorage.getItem(this.SORT_ORDER_KEY) || 'desc';
    }

    saveSortOrder(order) {
        localStorage.setItem(this.SORT_ORDER_KEY, order);
        this.sortOrder = order;
    }

    update(updates) {
        // If sortOrder is being updated, save it
        if (updates.sortOrder) {
            this.saveSortOrder(updates.sortOrder);
        }
        Object.assign(this, updates);
    }

    reset() {
        this.currentArtistId = null;
        this.currentView = this.loadViewPref();
        this.sortOrder = this.loadSortOrder();
        this.isTimelineActive = false;
        this.timelineContainer = null;
        this.originalGridContainer = null;
        this.injectedButton = null;
        this.comboboxButton = null;
        this.lastPathname = null;
    }
}

// ========== modules/DOMUtils.js ==========
class DOMUtils {
    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const existingElement = document.querySelector(selector);
            if (existingElement) {
                return resolve(existingElement);
            }

            const timeoutId = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout, Element with selector "${selector}" not found within ${timeout}ms`));
            }, timeout);

            // Create a MutationObserver to watch for changes in the DOM
            const observer = new MutationObserver((mutations) => {
                const element = document.querySelector(selector);
                if (element) {
                    clearTimeout(timeoutId); // Clear the timeout
                    observer.disconnect();  // Stop observing
                    resolve(element);
                }
            });
            observer.observe(document.body, {
                childList: true, subtree: true
            });// Start observing the body for added nodes
        });
    }

    static extractArtistId(url) {
        const match = url.match(/artist\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    }

    // boolean - now includes discography pages
    static isArtistPage(url) {
        return url.match(/^\/?artist\/[a-zA-Z0-9]+/) !== null;
    }

    static isDiscographyPage(url) {
        return url.match(/^\/?artist\/[a-zA-Z0-9]+\/discography/) !== null;
    }

    // limiter how often a function can run
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func(...args);
            } , wait);
        }
    }
}

// ========== modules/Navigator.js ==========
class Navigator {
    constructor(state, onArtistPageDetected) {
        this.state = state;
        this.onArtistPageDetected = onArtistPageDetected;
        // Get Spotify's History API
        // This is what lets us detect navigation
        this.History = Spicetify.Platform.History;
    }

    start() {
        // Get current location (where user is right now)
        const currentLocation = this.History.location;
        this.handleNavigation(currentLocation);

        // Listen for future navigation changes
        // History.listen() returns a function to stop listening
        this.unlistener = this.History.listen((location) => {
            // This callback runs every time URL changes
            this.handleNavigation(location);
        });
    }

    stop(){
       if(this.unlistener){
           this.unlistener();
           this.unlistener = null;
       }
    }

    handleNavigation(location) {
        const pathname = location.pathname;

        // Skip if we're already on this exact page
        // This prevents processing the same page multiple times
        if (pathname === this.state.lastPathname) {
            return; // Exit early, nothing to do
        }
        this.state.update({ lastPathname: pathname });

        // Check if it's an artist page
        if (!DOMUtils.isArtistPage(pathname)) {
            if(this.state.isTimelineActive)
                this.cleanup();
            return; // Not an artist page, exit early
        }
        const artistId = DOMUtils.extractArtistId(pathname);

        // Validate artistId
        if (!artistId) {
            console.warn("Navigator: Invalid artist ID extracted.");
            return; // Invalid artist ID, exit early
        }

        this.state.update({ currentArtistId: artistId });

        // Save to localStorage
        localStorage.setItem('lastArtistId', artistId);

        // Notify that we're on an artist page
        this.onArtistPageDetected(artistId);
    }

    // Removes the element in the DOM that we created
    cleanup() {
        if (this.state.timelineContainer)
            this.state.timelineContainer.remove();

        if (this.state.injectedButton)
            this.state.injectedButton.remove();
        // Only restore if we actually hid it
        if (this.state.originalGridContainer && this.state.isTimelineActive)
            this.state.originalGridContainer.style.display = '';

        this.state.reset();
    }
}

// ========== modules/DataExtractor.js ==========
/**
 * DataExtractor - Extracts release data from DOM and GraphQL
 *
 * Responsibilities:
 * - Extract release information from DOM (cards in discography grid)
 * - Fallback to GraphQL when DOM data is incomplete
 * - Merge and normalize data from both sources
 * - Handle missing data gracefully
 */
class DataExtractor {
    constructor() {
        this.lastExtractedData = null;
    }

    /**
     * Extract release data from DOM
     * @param {HTMLElement} container - Discography container element
     * @returns {Array} Array of release objects
     */
    extractFromDOM(container) {
        if (!container) {
            console.warn('[DataExtractor] No container provided');
            return [];
        }

        const releases = [];

        // Try multiple selectors to find album cards
        const cardSelectors = [
            '[data-testid="card-item"]',
            '[data-testid="grid-card"]',
            '.main-card-card',
            '[class*="Card"]',
            'article',
        ];

        let cards = [];
        for (const selector of cardSelectors) {
            cards = container.querySelectorAll(selector);
            if (cards.length > 0) {
                console.log(`[DataExtractor] Found ${cards.length} cards using: ${selector}`);
                break;
            }
        }

        if (cards.length === 0) {
            console.warn('[DataExtractor] No album cards found in DOM');
            return releases;
        }

        cards.forEach((card, index) => {
            try {
                const release = this.extractReleaseFromCard(card, index);
                if (release) {
                    releases.push(release);
                }
            } catch (error) {
                console.warn('[DataExtractor] Error extracting card data:', error);
            }
        });

        console.log(`[DataExtractor] Extracted ${releases.length} releases from DOM`);
        this.lastExtractedData = releases;
        return releases;
    }

    /**
     * Extract release data from a single card element
     * @param {HTMLElement} card - Card element
     * @param {number} index - Card index
     * @returns {Object|null} Release object or null
     */
    extractReleaseFromCard(card, index) {
        // Extract URI (most reliable identifier)
        const uri = this.extractUri(card);
        if (!uri) {
            console.warn('[DataExtractor] Card missing URI, skipping');
            return null;
        }

        // Extract other data
        const name = this.extractName(card);
        const image = this.extractImage(card);
        const type = this.extractType(card);
        const date = this.extractDate(card);

        return {
            uri,
            name: name || 'Unknown Album',
            image: image || this.getPlaceholderImage(),
            type: type || 'Album',
            date: date || null,
            isPlaying: this.isCurrentlyPlaying(uri),
            index
        };
    }

    /**
     * Extract URI from card
     * @param {HTMLElement} card - Card element
     * @returns {string|null} Spotify URI
     */
    extractUri(card) {
        // Try data attribute
        const dataUri = card.getAttribute('data-uri');
        if (dataUri) return dataUri;

        // Try link href
        const link = card.querySelector('a[href*="/album/"]');
        if (link) {
            const albumId = link.href.match(/\/album\/([a-zA-Z0-9]+)/)?.[1];
            if (albumId) return `spotify:album:${albumId}`;
        }

        // Try button or play elements
        const playButton = card.querySelector('[data-uri]');
        if (playButton) {
            return playButton.getAttribute('data-uri');
        }

        return null;
    }

    /**
     * Extract album/release name from card
     * @param {HTMLElement} card - Card element
     * @returns {string|null} Album name
     */
    extractName(card) {
        // Try multiple selectors
        const selectors = [
            '[data-testid="card-title"]',
            '.main-card-card-title',
            '.main-cardHeader-text',
            'h3',
            'h4',
            '[class*="title"]',
        ];

        for (const selector of selectors) {
            const element = card.querySelector(selector);
            if (element?.textContent) {
                return element.textContent.trim();
            }
        }

        return null;
    }

    /**
     * Extract cover image from card
     * @param {HTMLElement} card - Card element
     * @returns {string|null} Image URL
     */
    extractImage(card) {
        // Try img tag
        const img = card.querySelector('img');
        if (img?.src) {
            return img.src;
        }

        // Try background image
        const imageContainer = card.querySelector('[style*="background-image"]');
        if (imageContainer) {
            const bgImage = imageContainer.style.backgroundImage;
            const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (match) return match[1];
        }

        return null;
    }

    /**
     * Extract release type (Album, Single, EP, etc.)
     * @param {HTMLElement} card - Card element
     * @returns {string|null} Release type
     */
    extractType(card) {
        // Try subtitle/meta elements
        const selectors = [
            '[data-testid="card-subtitle"]',
            '.main-card-card-subtitle',
            '.main-cardSubHeader-text',
            '[class*="subtitle"]',
        ];

        for (const selector of selectors) {
            const element = card.querySelector(selector);
            if (element?.textContent) {
                const text = element.textContent.trim();
                // Extract type (usually the first word: "Album", "Single", "EP")
                const typeMatch = text.match(/^(Album|Single|EP|Compilation)/i);
                if (typeMatch) return typeMatch[1];
                return text.split('•')[0].trim();
            }
        }

        return null;
    }

    /**
     * Extract release date from card
     * @param {HTMLElement} card - Card element
     * @returns {Date|null} Release date
     */
    extractDate(card) {
        // Try time element
        const timeElement = card.querySelector('time[datetime]');
        if (timeElement) {
            const datetime = timeElement.getAttribute('datetime');
            if (datetime) {
                const date = new Date(datetime);
                if (!isNaN(date.getTime())) return date;
            }
        }

        // Try parsing from subtitle text (e.g., "Album • 2023")
        const selectors = [
            '[data-testid="card-subtitle"]',
            '.main-card-card-subtitle',
            '[class*="subtitle"]',
        ];

        for (const selector of selectors) {
            const element = card.querySelector(selector);
            if (element?.textContent) {
                const text = element.textContent;
                // Look for year (4 digits)
                const yearMatch = text.match(/\b(19|20)\d{2}\b/);
                if (yearMatch) {
                    const year = parseInt(yearMatch[0]);
                    return new Date(year, 0, 1); // Jan 1st of that year
                }
            }
        }

        return null;
    }

    /**
     * Check if a URI is currently playing
     * @param {string} uri - Spotify URI
     * @returns {boolean} True if playing
     */
    isCurrentlyPlaying(uri) {
        try {
            const currentTrack = Spicetify.Player?.data?.item;
            if (!currentTrack) return false;

            const currentAlbumUri = currentTrack.metadata?.album_uri;
            return currentAlbumUri === uri;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get placeholder image for missing album art
     * @returns {string} Data URL for placeholder image
     */
    getPlaceholderImage() {
        // Simple 1x1 gray pixel
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=';
    }

    /**
     * Fetch release data using GraphQL as fallback
     * @param {string} artistId - Spotify artist ID
     * @returns {Promise<Array>} Array of release objects
     */
    async fetchFromGraphQL(artistId) {
        if (!artistId) {
            console.warn('[DataExtractor] No artist ID provided for GraphQL');
            return [];
        }

        try {
            console.log('[DataExtractor] Fetching from GraphQL for artist:', artistId);

            // Use Spicetify's GraphQL API
            const response = await Spicetify.GraphQL.Request(
                Spicetify.GraphQL.Definitions.queryArtistDiscographyAll,
                { uri: `spotify:artist:${artistId}` }
            );

            if (!response?.data?.artist?.discography) {
                console.warn('[DataExtractor] No discography data in GraphQL response');
                return [];
            }

            const releases = this.parseGraphQLResponse(response.data.artist.discography);
            console.log(`[DataExtractor] Fetched ${releases.length} releases from GraphQL`);
            return releases;
        } catch (error) {
            console.error('[DataExtractor] GraphQL fetch failed:', error);
            return [];
        }
    }

    /**
     * Parse GraphQL response into release objects
     * @param {Object} discography - GraphQL discography object
     * @returns {Array} Array of release objects
     */
    parseGraphQLResponse(discography) {
        const releases = [];

        // GraphQL returns releases in categories: albums, singles, compilations, etc.
        const categories = ['albums', 'singles', 'compilations'];

        categories.forEach(category => {
            const items = discography[category]?.items || [];
            items.forEach((item, index) => {
                try {
                    const release = this.parseGraphQLRelease(item, category);
                    if (release) {
                        releases.push(release);
                    }
                } catch (error) {
                    console.warn('[DataExtractor] Error parsing GraphQL release:', error);
                }
            });
        });

        // Sort by date (newest first)
        releases.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date - a.date;
        });

        return releases;
    }

    /**
     * Parse a single GraphQL release item
     * @param {Object} item - GraphQL release item
     * @param {string} category - Release category
     * @returns {Object|null} Release object
     */
    parseGraphQLRelease(item, category) {
        const uri = item.uri || item.releases?.items?.[0]?.uri;
        if (!uri) return null;

        // Extract release date
        let date = null;
        const dateString = item.date?.year
            ? `${item.date.year}-${String(item.date.month || 1).padStart(2, '0')}-${String(item.date.day || 1).padStart(2, '0')}`
            : null;
        if (dateString) {
            date = new Date(dateString);
            if (isNaN(date.getTime())) date = null;
        }

        // Extract image
        const image = item.coverArt?.sources?.[0]?.url || this.getPlaceholderImage();

        // Normalize type
        let type = 'Album';
        if (category === 'singles') type = 'Single';
        else if (category === 'compilations') type = 'Compilation';
        else if (item.type) type = item.type;

        return {
            uri,
            name: item.name || 'Unknown Album',
            image,
            type,
            date,
            isPlaying: this.isCurrentlyPlaying(uri),
        };
    }

    /**
     * Merge DOM and GraphQL data
     * @param {Array} domReleases - Releases from DOM
     * @param {Array} graphqlReleases - Releases from GraphQL
     * @returns {Array} Merged releases
     */
    mergeData(domReleases, graphqlReleases) {
        const merged = [...domReleases];
        const domUris = new Set(domReleases.map(r => r.uri));

        // Add GraphQL releases that aren't in DOM data
        graphqlReleases.forEach(gqlRelease => {
            const domRelease = merged.find(r => r.uri === gqlRelease.uri);

            if (domRelease) {
                // Merge: prefer DOM data but fill missing fields from GraphQL
                if (!domRelease.date && gqlRelease.date) {
                    domRelease.date = gqlRelease.date;
                }
                if (!domRelease.type && gqlRelease.type) {
                    domRelease.type = gqlRelease.type;
                }
                if (!domRelease.image || domRelease.image === this.getPlaceholderImage()) {
                    domRelease.image = gqlRelease.image;
                }
            } else if (!domUris.has(gqlRelease.uri)) {
                // Add GraphQL-only release
                merged.push(gqlRelease);
            }
        });

        // Sort by date (newest first)
        merged.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date - a.date;
        });

        console.log(`[DataExtractor] Merged ${merged.length} total releases`);
        return merged;
    }

    /**
     * Extract releases with GraphQL fallback
     * @param {HTMLElement} container - DOM container
     * @param {string} artistId - Artist ID for GraphQL fallback
     * @returns {Promise<Array>} Array of release objects
     */
    async extractWithFallback(container, artistId) {
        // First try DOM extraction
        const domReleases = this.extractFromDOM(container);

        // Check if DOM data is incomplete (missing dates/types)
        const isIncomplete = domReleases.some(r => !r.date || !r.type);

        if (isIncomplete || domReleases.length === 0) {
            console.log('[DataExtractor] DOM data incomplete, using GraphQL fallback');
            const graphqlReleases = await this.fetchFromGraphQL(artistId);

            // Merge both sources
            return this.mergeData(domReleases, graphqlReleases);
        }

        return domReleases;
    }
}

// ========== modules/views/Horizontal.js ==========
class HorizontalView {
    constructor(core) {
        this.core = core;
    }

    render(container, releases) {
        // Configure container for horizontal scrolling
        container.classList.add('timeline--horizontal');
        container.classList.remove('timeline--vertical');
        
        // Ensure horizontal scrollbar (slider) appears at the bottom
        container.style.overflowX = 'auto';
        container.style.overflowY = 'hidden';
        container.style.display = 'block';

        const proportionalSpacing = this.core.config.get('proportionalSpacing') || false;
        if (proportionalSpacing) {
            container.setAttribute('data-proportional-spacing', 'true');
        }

        // Create timeline track (the line)
        const track = document.createElement('div');
        track.className = 'timeline-track';
        track.setAttribute('aria-hidden', true);
        container.appendChild(track);

        // Create cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'timeline-cards';
        cardsContainer.setAttribute('role', 'list');

        // Render cards
        releases.forEach((release, index) => {
            const card = this.core.createCard(release, index);

            // Apply proportional spacing
            if (proportionalSpacing && index > 0) {
                const spacing = this.core.calculateSpacing(releases[index - 1], release);
                card.style.marginLeft = `${spacing}px`;
            }

            cardsContainer.appendChild(card);
        });

        container.appendChild(cardsContainer);

        // Add horizontal specific interactions
        if (this.core.config.get('showScrollButtons')) {
            this.addScrollButtons(container);
        }
        this.addMouseWheelScroll(container);
    }

    /**
     * Add scroll buttons (Left/Right arrows)
     */
    addScrollButtons(container) {
        // Left scroll button
        const leftButton = document.createElement('button');
        leftButton.className = 'timeline-scroll-button timeline-scroll-button--left';
        leftButton.setAttribute('aria-label', 'Scroll left');
        leftButton.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;

        // Right scroll button
        const rightButton = document.createElement('button');
        rightButton.className = 'timeline-scroll-button timeline-scroll-button--right';
        rightButton.setAttribute('aria-label', 'Scroll right');
        rightButton.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`;

        const scrollAmount = 250;

        leftButton.addEventListener('click', () => {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        rightButton.addEventListener('click', () => {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        const updateButtonStates = () => {
            const isAtStart = container.scrollLeft <= 0;
            const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
            leftButton.disabled = isAtStart;
            rightButton.disabled = isAtEnd;
        };

        // Initial state and listeners
        updateButtonStates();
        container.addEventListener('scroll', DOMUtils.debounce(updateButtonStates, 100));

        container.appendChild(leftButton);
        container.appendChild(rightButton);
    }

    /**
     * Add mouse wheel horizontal scroll support
     */
    addMouseWheelScroll(container) {
        const handleWheel = DOMUtils.debounce((e) => {
            // Only handle horizontal scroll if not already scrolling vertically
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                container.scrollBy({
                    left: e.deltaY,
                    behavior: 'smooth'
                });
            }
        }, 10);

        container.addEventListener('wheel', handleWheel, { passive: false });
    }
}

// ========== modules/views/Vertical.js ==========
class VerticalView {
    constructor(core) {
        this.core = core;
    }

    render(container, releases) {
        // Configure container for Vertical Winding (Snake) layout
        container.classList.add('timeline--vertical-snake');
        container.classList.remove('timeline--horizontal');
        
        container.style.overflowX = 'hidden';
        container.style.overflowY = 'auto'; // Standard vertical scrollbar
        container.style.display = 'block';

        const proportionalSpacing = this.core.config.get('proportionalSpacing') || false;

        // Create cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'timeline-snake-container';
        
        // Group releases into rows
        const itemsPerRow = 4; // Adjust based on your preference
        const rows = [];
        
        for (let i = 0; i < releases.length; i += itemsPerRow) {
            rows.push(releases.slice(i, i + itemsPerRow));
        }

        // Render Rows
        rows.forEach((rowItems, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'timeline-snake-row';
            
            // Alternate direction: Odd rows (index 1, 3...) go Right-to-Left
            const isReverse = rowIndex % 2 !== 0;
            if (isReverse) {
                rowDiv.classList.add('timeline-snake-row--reverse');
                // We reverse the items array for rendering so the DOM order matches visual order 
                // (simpler for spacing calculation)
                rowItems.reverse();
            }

            // Create connector line container for this row
            const line = document.createElement('div');
            line.className = 'timeline-snake-line';
            rowDiv.appendChild(line);

            rowItems.forEach((release, index) => {
                const card = this.core.createCard(release, index + (rowIndex * itemsPerRow));
                
                // Add margins for spacing
                if (proportionalSpacing && index > 0) {
                    // For reverse rows, we are calculating space from the "previous" item 
                    // which is physically to the right/left depending on flow.
                    // Because we reversed the array above, we can just look at index-1
                    const spacing = this.core.calculateSpacing(rowItems[index-1], release);
                    
                    // In a flex row, margin-left pushes item right.
                    // In a reverse flex row, margin-right pushes item left (conceptually).
                    // We'll apply margin-left uniformly and let Flexbox handle direction.
                    card.style.marginLeft = `${spacing}px`;
                }

                rowDiv.appendChild(card);
            });

            cardsContainer.appendChild(rowDiv);
            
            // Add "Turn" connectors between rows
            if (rowIndex < rows.length - 1) {
                const turn = document.createElement('div');
                turn.className = isReverse 
                    ? 'timeline-snake-turn timeline-snake-turn--left' 
                    : 'timeline-snake-turn timeline-snake-turn--right';
                cardsContainer.appendChild(turn);
            }
        });

        container.appendChild(cardsContainer);
    }
}

// ========== modules/options/FilterManager.js ==========
/**
 * FilterManager - Handles detection and observation of Spotify's discography filters
 * (Albums, Singles & EPs, Compilations, All)
 */
class FilterManager {
    constructor(core) {
        this.core = core;
        this.currentFilter = 'all';
        this._handleFilterChange = this.handleFilterChange.bind(this);
        this.filterObserver = null;
    }

    /**
     * Initialize filter detection and observation
     * @param {HTMLElement} discographyContainer - The discography container element
     */
    initialize(discographyContainer) {
        this.discographyContainer = discographyContainer;
        this.detectCurrentFilter();
        this.observeFilterChanges();
    }

    /**
     * Clean up observers and listeners
     */
    destroy() {
        if (this.filterObserver) {
            this.filterObserver.disconnect();
            this.filterObserver = null;
        }
        
        // Remove tab click listeners
        const tabContainer = this.findTabContainer();
        if (tabContainer) {
            tabContainer.removeEventListener('click', this._handleFilterChange);
        }
    }

    /**
     * Get the current active filter
     * @returns {string} Current filter ('all', 'albums', 'singles', 'compilations')
     */
    getCurrentFilter() {
        return this.currentFilter;
    }

    /**
     * Detect the current filter from URL or active tab
     */
    detectCurrentFilter() {
        const pathname = window.location.pathname;
        
        // Check URL patterns
        if (pathname.includes('/discography/album')) {
            this.currentFilter = 'albums';
        } else if (pathname.includes('/discography/single') || pathname.includes('/discography/ep')) {
            this.currentFilter = 'singles';
        } else if (pathname.includes('/discography/compilation')) {
            this.currentFilter = 'compilations';
        } else {
            // Check for active tab in DOM
            this.currentFilter = this.detectFilterFromTabs() || 'all';
        }
        
        console.log('[FilterManager] Detected filter:', this.currentFilter);
    }

    /**
     * Detect filter from active tab element
     * @returns {string|null} Filter type or null
     */
    detectFilterFromTabs() {
        const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
        if (!activeTab) return null;

        const tabText = activeTab.textContent?.toLowerCase() || '';
        
        if (tabText.includes('album') && !tabText.includes('single')) {
            return 'albums';
        } else if (tabText.includes('single') || tabText.includes('ep')) {
            return 'singles';
        } else if (tabText.includes('compilation')) {
            return 'compilations';
        }
        
        return null;
    }

    /**
     * Find the tab container element
     * @returns {HTMLElement|null} Tab container or null
     */
    findTabContainer() {
        const tabSelectors = [
            '[role="tablist"]',
            '[data-testid="discography-tabs"]',
            '.discography-tabs',
        ];

        for (const selector of tabSelectors) {
            const container = document.querySelector(selector);
            if (container) return container;
        }
        return null;
    }

    /**
     * Set up observers for filter changes (tab clicks, URL changes, DOM mutations)
     */
    observeFilterChanges() {
        // Watch for tab clicks
        const tabContainer = this.findTabContainer();
        if (tabContainer) {
            tabContainer.addEventListener('click', this._handleFilterChange);
        }

        // Observe DOM changes for dynamic content updates
        this.filterObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    const gridChanged = this.isGridMutation(mutation);
                    
                    if (gridChanged && this.core.state.isTimelineActive) {
                        this.handleFilterChange();
                    }
                }
            }
        });

        if (this.discographyContainer) {
            this.filterObserver.observe(this.discographyContainer, { 
                childList: true, 
                subtree: true,
                attributes: true,
                attributeFilter: ['aria-selected', 'class']
            });
        }

        // Listen for Spicetify history changes
        this.setupHistoryListener();
    }

    /**
     * Check if a mutation affects the grid content
     * @param {MutationRecord} mutation - The mutation record
     * @returns {boolean} True if grid was affected
     */
    isGridMutation(mutation) {
        return mutation.target.classList?.contains('main-gridContainer-gridContainer') ||
               mutation.target.querySelector?.('[data-testid="grid-container"]');
    }

    /**
     * Set up listener for Spicetify history/navigation changes
     */
    setupHistoryListener() {
        if (Spicetify.Platform?.History) {
            Spicetify.Platform.History.listen((location) => {
                if (location.pathname.includes('/discography')) {
                    setTimeout(() => this.handleFilterChange(), 300);
                }
            });
        }
    }

    /**
     * Handle filter/tab change - notify core to re-render
     * @param {Event} [event] - Click event (optional)
     */
    async handleFilterChange(event) {
        const oldFilter = this.currentFilter;
        this.detectCurrentFilter();

        // If filter changed and timeline is active, notify core
        if (this.core.state.isTimelineActive && (oldFilter !== this.currentFilter || event)) {
            console.log('[FilterManager] Filter changed from', oldFilter, 'to', this.currentFilter);
            
            // Wait for Spotify to update the DOM
            await this.waitForDOMUpdate();
            
            // Notify core to refresh
            this.core.onFilterChange();
        }
    }

    /**
     * Wait for Spotify's DOM to update after filter change
     * @returns {Promise<void>}
     */
    async waitForDOMUpdate() {
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    /**
     * Find the updated grid container after filter change
     * @returns {Promise<HTMLElement|null>} Updated container or null
     */
    async findUpdatedGridContainer() {
        const gridSelectors = [
            '[data-testid="grid-container"]',
            '.main-gridContainer-gridContainer',
            '[class*="grid"]',
        ];

        for (let attempt = 0; attempt < 5; attempt++) {
            for (const selector of gridSelectors) {
                const container = this.discographyContainer?.querySelector(selector) ||
                                document.querySelector(selector);
                if (container && container !== this.core.state.originalGridContainer) {
                    return container;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return null;
    }
}

// ========== modules/options/MenuInjector.js ==========
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

// ========== modules/options/ViewSwitcher.js ==========
/**
 * ViewSwitcher - Handles switching between Grid and Timeline views
 */
class ViewSwitcher {
    constructor(core) {
        this.core = core;
    }

    /**
     * Handle fallback button click
     */
    async handleButtonClick() {
        if (this.core.state.isTimelineActive) {
            this.switchToGrid();
        } else {
            await this.switchToTimeline('timeline-horizontal');
        }
    }

    /**
     * Switch to a timeline view
     * @param {string} viewType - 'timeline-horizontal' or 'timeline-vertical'
     */
    async switchToTimeline(viewType = 'timeline-horizontal') {
        console.log('[ViewSwitcher] Switching to timeline:', viewType);
        
        const orientation = viewType === 'timeline-vertical' ? 'vertical' : 'horizontal';
        this.core.config.set('orientation', orientation);

        // Extract releases from current DOM content
        let releases = this.core.dataExtractor.extractFromDOM(this.core.state.originalGridContainer);

        if (!releases || releases.length === 0) {
            Spicetify.showNotification('No releases found to display', true, 3000);
            return;
        }

        // Apply sort order
        releases = this.applySortOrder(releases);

        // Hide original grid
        if (this.core.state.originalGridContainer) {
            this.core.state.originalGridContainer.style.display = 'none';
        }

        // Render timeline
        this.core.renderTimeline(releases);

        // Update state
        this.core.state.saveViewPref(viewType);
        this.core.state.update({ 
            isTimelineActive: true,
            currentView: viewType 
        });

        // Update fallback button if exists
        this.updateFallbackButton(true);

        const viewName = orientation === 'vertical' ? 'Snake' : 'Horizontal';
        Spicetify.showNotification(`Timeline (${viewName}) activated`, false, 2000);
    }

    /**
     * Apply sort order to releases
     * @param {Array} releases - Array of release objects
     * @returns {Array} Sorted releases
     */
    applySortOrder(releases) {
        const sortOrder = this.core.state.sortOrder || 'desc';
        
        return [...releases].sort((a, b) => {
            // Handle missing dates
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;  // Push items without dates to the end
            if (!b.date) return -1;
            
            const dateA = a.date.getTime();
            const dateB = b.date.getTime();
            
            if (sortOrder === 'asc') {
                return dateA - dateB;  // Oldest first
            } else {
                return dateB - dateA;  // Newest first (default)
            }
        });
    }

    /**
     * Switch back to grid view
     */
    switchToGrid() {
        console.log('[ViewSwitcher] Switching to grid');
        
        // Remove timeline container
        if (this.core.state.timelineContainer) {
            this.core.state.timelineContainer.remove();
            this.core.state.update({ timelineContainer: null });
        }

        // Show original grid
        if (this.core.state.originalGridContainer) {
            this.core.state.originalGridContainer.style.display = '';
        }

        // Update state
        this.core.state.saveViewPref('grid');
        this.core.state.update({ 
            isTimelineActive: false,
            currentView: 'grid'
        });

        // Update fallback button if exists
        this.updateFallbackButton(false);

        Spicetify.showNotification('Grid view activated', false, 2000);
    }

    /**
     * Update the fallback button's active state
     * @param {boolean} isActive - Whether timeline is active
     */
    updateFallbackButton(isActive) {
        const button = this.core.state.injectedButton;
        if (!button) return;

        if (isActive) {
            button.classList.add('timeline-view-button--active');
            button.setAttribute('aria-selected', 'true');
            button.style.backgroundColor = 'var(--spice-button-active, rgba(255,255,255,0.2))';
        } else {
            button.classList.remove('timeline-view-button--active');
            button.setAttribute('aria-selected', 'false');
            button.style.backgroundColor = 'var(--spice-button, rgba(255,255,255,0.07))';
        }
    }

    /**
     * Refresh the current view (re-extract and re-render)
     */
    async refresh() {
        if (!this.core.state.isTimelineActive) return;

        console.log('[ViewSwitcher] Refreshing timeline');
        
        let releases = this.core.dataExtractor.extractFromDOM(this.core.state.originalGridContainer);
        
        if (releases && releases.length > 0) {
            // Apply sort order
            releases = this.applySortOrder(releases);
            this.core.renderTimeline(releases);
        } else {
            console.log('[ViewSwitcher] No releases found for current filter');
        }
    }
}

// ========== modules/TimelineCore.js ==========
/**
 * TimelineCore - Orchestrates timeline view rendering and interactions
 * 
 * Delegates responsibilities to:
 * - FilterManager: Filter detection & observation
 * - MenuInjector: Dropdown menu injection
 * - ViewSwitcher: View switching logic
 * - HorizontalView/VerticalView: Rendering
 */
class TimelineCore {
    constructor(config, state) {
        this.config = config;
        this.state = state;
        this.dataExtractor = null;
        this.discographyContainer = null;
        this.releases = null;

        // Initialize view renderers
        this.horizontalView = new HorizontalView(this);
        this.verticalView = new VerticalView(this);

        // Initialize option managers
        this.filterManager = new FilterManager(this);
        this.menuInjector = new MenuInjector(this);
        this.viewSwitcher = new ViewSwitcher(this);
    }

    /**
     * Initialize the timeline core and all sub-modules
     * @param {HTMLElement} discographyContainer - The discography container
     * @param {DataExtractor} dataExtractor - Data extraction instance
     */
    async initialize(discographyContainer, dataExtractor) {
        this.discographyContainer = discographyContainer;
        this.dataExtractor = dataExtractor;

        // Initialize sub-modules
        this.filterManager.initialize(discographyContainer);
        await this.menuInjector.initialize(discographyContainer);

        // Restore previous view if it was a timeline
        if (this.state.currentView === 'timeline-horizontal' || 
            this.state.currentView === 'timeline-vertical') {
            await this.viewSwitcher.switchToTimeline(this.state.currentView);
        }
    }

    /**
     * Clean up all resources
     */
    destroy() {
        if (this.state.timelineContainer) {
            this.state.timelineContainer.remove();
        }
        if (this.state.originalGridContainer) {
            this.state.originalGridContainer.style.display = '';
        }
        
        // Destroy sub-modules
        this.filterManager.destroy();
        this.menuInjector.destroy();
        
        this.discographyContainer = null;
        this.dataExtractor = null;
        this.releases = null;
    }

    /**
     * Called by FilterManager when filter changes
     */
    async onFilterChange() {
        // Find updated grid container
        const newContainer = await this.filterManager.findUpdatedGridContainer();
        if (newContainer) {
            this.state.update({ originalGridContainer: newContainer });
        }
        
        // Refresh the view
        await this.viewSwitcher.refresh();
    }

    /**
     * Render the timeline with given releases
     * @param {Array} releases - Array of release objects
     */
    renderTimeline(releases) {
        this.releases = releases;
        
        // Remove existing timeline
        if (this.state.timelineContainer) {
            this.state.timelineContainer.remove();
        }

        // Create new container
        const container = document.createElement('div');
        container.className = 'timeline-view';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Artist discography timeline');

        // Add filter indicator
        const currentFilter = this.filterManager.getCurrentFilter();
        if (currentFilter !== 'all') {
            container.setAttribute('data-filter', currentFilter);
        }

        // Render based on orientation
        const orientation = this.config.get('orientation') || 'horizontal';
        if (orientation === 'horizontal') {
            this.horizontalView.render(container, releases);
        } else {
            this.verticalView.render(container, releases);
        }

        // Insert into DOM
        this.state.originalGridContainer.parentNode.insertBefore(
            container, 
            this.state.originalGridContainer.nextSibling
        );
        this.state.update({ timelineContainer: container });
    }

    /**
     * Create a timeline card element
     * @param {Object} release - Release data object
     * @param {number} index - Card index
     * @returns {HTMLElement} Card element
     */
    createCard(release, index) {
        const card = document.createElement('div');
        card.className = 'timeline-card';
        card.setAttribute('role', 'listitem');
        card.dataset.uri = release.uri;
        card.dataset.index = index;
        card.dataset.type = release.type?.toLowerCase() || 'album';

        if (release.isPlaying) {
            card.classList.add('timeline-card--playing');
            card.setAttribute('aria-current', 'true');
        }

        const dateText = release.date
            ? release.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
            : 'Unknown Date';

        card.innerHTML = `
            <div class="timeline-card__marker" aria-hidden="true"></div>
            <div class="timeline-card__content">
                <div class="timeline-card__image-wrapper">
                    <img src="${release.image}" alt="${this.escapeHtml(release.name)}" 
                         class="timeline-card__image" loading="lazy" />
                    <button class="timeline-card__play-button" 
                            aria-label="Play ${this.escapeHtml(release.name)}" 
                            data-uri="${release.uri}">
                        ${this.getPlayIcon()}
                    </button>
                </div>
                <div class="timeline-card__info">
                    <h3 class="timeline-card__title">${this.escapeHtml(release.name)}</h3>
                    <div class="timeline-card__meta">
                        <span class="timeline-card__type">${release.type}</span>
                        <span class="timeline-card__separator">•</span>
                        <time class="timeline-card__date" datetime="${release.date?.toISOString() || ''}">
                            ${dateText}
                        </time>
                    </div>
                </div>
            </div>
        `;

        this.attachCardListeners(card, release);
        return card;
    }

    /**
     * Attach event listeners to a card
     * @param {HTMLElement} card - Card element
     * @param {Object} release - Release data
     */
    attachCardListeners(card, release) {
        // Play button
        const playButton = card.querySelector('.timeline-card__play-button');
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                e.stopPropagation();
                Spicetify.Player.playUri(release.uri);
            });
        }

        // Card click - navigate to album
        card.addEventListener('click', () => {
            const albumID = release.uri.split(':')[2];
            Spicetify.Platform.History.push(`/album/${albumID}`);
        });

        // Keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    }

    /**
     * Calculate spacing between cards based on release dates
     * @param {Object} prevRelease - Previous release
     * @param {Object} currentRelease - Current release
     * @returns {number} Spacing in pixels
     */
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

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get play icon SVG
     * @returns {string} SVG HTML
     */
    getPlayIcon() {
        return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>`;
    }
}

// ========== artistTimeline.js ==========

// ============================================
// Artist Discography Timeline - Bundled Build
// Author: AhmedHanyMohammed
// ============================================

(function() {
    // Inject CSS styles
    const style = document.createElement('style');
    style.id = 'artist-timeline-styles';
    style.textContent = `/**
 * Artist Timeline Styles
 * Updated with Snake Layout and Glow Effects
 */

/* ========================================
   TIMELINE BUTTON
   ======================================== */
.timeline-view-button {
    padding: 8px 16px;
    margin: 0 4px;
    background-color: transparent;
    border: none;
    border-radius: 4px;
    color: var(--spice-subtext, #b3b3b3);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.timeline-view-button:hover {
    background-color: var(--spice-button-active, rgba(255, 255, 255, 0.1));
    color: var(--spice-text, #ffffff);
}

.timeline-view-button--active {
    background-color: var(--spice-button, rgba(255, 255, 255, 0.07));
    color: var(--spice-text, #ffffff);
}

.timeline-orientation-button {
    padding: 8px; /* Square button */
}

/* ========================================
   TIMELINE CONTAINER
   ======================================== */
.timeline-view {
    position: relative;
    padding: 60px 20px;
    min-height: 400px;
    /* Default scrollbar styling */
    scrollbar-width: thin;
    scrollbar-color: var(--spice-button, rgba(255, 255, 255, 0.1)) transparent;
}

/* ========================================
   HORIZONTAL LAYOUT
   ======================================== */
.timeline--horizontal .timeline-track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--spice-button, rgba(255, 255, 255, 0.1));
    transform: translateY(-50%);
    z-index: 1;
}

.timeline--horizontal .timeline-cards {
    display: flex;
    align-items: center; /* Center cards on the line */
    gap: 48px; /* Default gap, overridden by JS if proportional */
    padding: 20px;
    position: relative;
    z-index: 2;
}

/* ========================================
   SNAKE (VERTICAL) LAYOUT
   ======================================== */
.timeline--vertical-snake .timeline-snake-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}

.timeline-snake-row {
    display: flex;
    position: relative;
    padding: 40px 0;
    width: 100%;
    justify-content: flex-start; /* Standard L->R */
    align-items: center;
}

.timeline-snake-row--reverse {
    flex-direction: row-reverse; /* Reverse R->L */
}

/* The horizontal line for each row */
.timeline-snake-line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--spice-button, rgba(255, 255, 255, 0.1));
    z-index: 0;
    transform: translateY(-50%);
}

/* Turns (Curves connecting rows) */
.timeline-snake-turn {
    width: 100%; /* Spans full width */
    height: 80px; /* Vertical gap between rows */
    position: relative;
    margin-top: -40px; /* Overlap to connect lines */
    margin-bottom: -40px;
    z-index: 0;
    pointer-events: none;
}

/* Right Turn: Connects end of Row 1 (Right) to start of Row 2 (Right) */
.timeline-snake-turn--right {
    border-right: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-top: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-bottom: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-top-right-radius: 40px;
    border-bottom-right-radius: 40px;
    width: 50%;
    margin-left: 50%; /* Shift to right half */
}

/* Left Turn: Connects end of Row 2 (Left) to start of Row 3 (Left) */
.timeline-snake-turn--left {
    border-left: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-top: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-bottom: 2px solid var(--spice-button, rgba(255, 255, 255, 0.1));
    border-top-left-radius: 40px;
    border-bottom-left-radius: 40px;
    width: 50%;
    margin-right: 50%; /* Shift to left half */
}


/* ========================================
   TIMELINE CARDS
   ======================================== */
.timeline-card {
    flex-shrink: 0;
    cursor: pointer;
    transition: transform 0.2s ease;
    outline: none;
    position: relative;
    z-index: 2; /* Above lines */
}

.timeline-card:hover {
    transform: scale(1.05);
    z-index: 10;
}

/* Marker (Dot) */
.timeline-card__marker {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--spice-text, #ffffff);
    margin: 0 auto 16px; /* Centered above content */
    box-shadow: 0 0 0 4px var(--spice-main-transition, #121212); /* Fake border to mask line */
}

/* GLOW EFFECT & PLAYING STATE */
.timeline-card--playing .timeline-card__marker {
    background-color: var(--spice-main, #1db954);
    box-shadow: 0 0 15px 2px var(--spice-main, #1db954);
    animation: pulse 2s infinite;
}

.timeline-card--playing .timeline-card__image {
    box-shadow: 0 0 25px 5px rgba(29, 185, 84, 0.5); /* Green glow behind image */
    border: 2px solid var(--spice-main, #1db954);
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
}

/* Card Content */
.timeline-card__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 200px;
    background-color: var(--spice-main-transition, #121212); /* Background to cover line if needed */
    padding: 10px;
    border-radius: 8px;
}

.timeline-card__image-wrapper {
    position: relative;
    width: 180px;
    height: 180px;
    margin-bottom: 12px;
}

.timeline-card__image {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    transition: box-shadow 0.3s ease;
}

/* Play Button */
.timeline-card__play-button {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--spice-main, #1db954);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.timeline-card__image-wrapper:hover .timeline-card__play-button {
    opacity: 1;
    transform: scale(1);
}

.timeline-card__play-button:hover {
    background-color: #1ed760;
    transform: scale(1.1);
}

.timeline-card__play-button svg {
    width: 20px;
    height: 20px;
    fill: #000000;
}

/* Text Info */
.timeline-card__info {
    text-align: center;
}

.timeline-card__title {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--spice-text, #ffffff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
}

.timeline-card__meta {
    font-size: 13px;
    color: var(--spice-subtext, #b3b3b3);
}

/* ========================================
   SCROLL BUTTONS (Horizontal Only)
   ======================================== */
.timeline-scroll-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(0,0,0, 0.5);
    border: 1px solid rgba(255,255,255,0.1);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    transition: all 0.2s ease;
    opacity: 0; /* Hidden by default, show on hover of container */
}

.timeline-view:hover .timeline-scroll-button {
    opacity: 1;
}

.timeline-scroll-button:hover {
    background-color: rgba(0,0,0, 0.8);
    transform: translateY(-50%) scale(1.1);
}

.timeline-scroll-button--left { left: 10px; }
.timeline-scroll-button--right { right: 10px; }

.timeline-scroll-button svg {
    width: 24px;
    height: 24px;
    fill: #ffffff;
}

.timeline-scroll-button:disabled {
    opacity: 0;
    pointer-events: none;
}`;
    if (!document.getElementById('artist-timeline-styles')) {
        document.head.appendChild(style);
    }
})();


// ========== modules/Config.js ==========
class Config {
    constructor() {
        this.Storage_Key = 'artist_timeline_config';
        this.Defaults = {
            orientation : 'horizontal',
            cardSize : 'medium',
            autoScrollToPlay : true,
            animationSpeed : 0,
        };
        this.config = this.load();
    }

    load() {
        try{
            const saved = localStorage.getItem(this.Storage_Key);
            if(saved){
                return {...this.Defaults, ...JSON.parse(saved)};
            }
        }
        catch (error) {
            console.error('Error loading config:', error);
        }
        return {...this.Defaults};
    }

    // How It works:
    // Take the config object
    // Convert it to a JSON string
    // Save it to localstorage
    save(config) {
        try{
            const jsonString = JSON.stringify(config);
            localStorage.setItem(this.Storage_Key, jsonString);
            this.config = config;
        }
        catch (error) {
            console.error('Error saving config:', error);
        }
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        this.save(this.config);
    }

    reset() {
        this.config = {...this.Defaults};
        this.save(this.config);
    }
}

// ========== modules/State.js ==========
class State {
    constructor() {
        // View preferences key
        this.VIEW_PREF_KEY = 'artist-timeline-view-preference';
        this.SORT_ORDER_KEY = 'artist-timeline-sort-order';

        this.currentArtistId = null;
        this.currentView = this.loadViewPref();
        this.sortOrder = this.loadSortOrder();
        this.isTimelineActive = false;
        this.timelineContainer = null;
        this.originalGridContainer = null;
        this.injectedButton = null;
        this.comboboxButton = null;
        this.lastPathname = null;
    }

    loadViewPref() {
        return localStorage.getItem(this.VIEW_PREF_KEY) || 'grid';
    }

    saveViewPref(view) {
        localStorage.setItem(this.VIEW_PREF_KEY, view);
        this.currentView = view;
    }

    loadSortOrder() {
        return localStorage.getItem(this.SORT_ORDER_KEY) || 'desc';
    }

    saveSortOrder(order) {
        localStorage.setItem(this.SORT_ORDER_KEY, order);
        this.sortOrder = order;
    }

    update(updates) {
        // If sortOrder is being updated, save it
        if (updates.sortOrder) {
            this.saveSortOrder(updates.sortOrder);
        }
        Object.assign(this, updates);
    }

    reset() {
        this.currentArtistId = null;
        this.currentView = this.loadViewPref();
        this.sortOrder = this.loadSortOrder();
        this.isTimelineActive = false;
        this.timelineContainer = null;
        this.originalGridContainer = null;
        this.injectedButton = null;
        this.comboboxButton = null;
        this.lastPathname = null;
    }
}

// ========== modules/DOMUtils.js ==========
class DOMUtils {
    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const existingElement = document.querySelector(selector);
            if (existingElement) {
                return resolve(existingElement);
            }

            const timeoutId = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout, Element with selector "${selector}" not found within ${timeout}ms`));
            }, timeout);

            // Create a MutationObserver to watch for changes in the DOM
            const observer = new MutationObserver((mutations) => {
                const element = document.querySelector(selector);
                if (element) {
                    clearTimeout(timeoutId); // Clear the timeout
                    observer.disconnect();  // Stop observing
                    resolve(element);
                }
            });
            observer.observe(document.body, {
                childList: true, subtree: true
            });// Start observing the body for added nodes
        });
    }

    static extractArtistId(url) {
        const match = url.match(/artist\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    }

    // boolean - now includes discography pages
    static isArtistPage(url) {
        return url.match(/^\/?artist\/[a-zA-Z0-9]+/) !== null;
    }

    static isDiscographyPage(url) {
        return url.match(/^\/?artist\/[a-zA-Z0-9]+\/discography/) !== null;
    }

    // limiter how often a function can run
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func(...args);
            } , wait);
        }
    }
}

// ========== modules/Navigator.js ==========
class Navigator {
    constructor(state, onArtistPageDetected) {
        this.state = state;
        this.onArtistPageDetected = onArtistPageDetected;
        // Get Spotify's History API
        // This is what lets us detect navigation
        this.History = Spicetify.Platform.History;
    }

    start() {
        // Get current location (where user is right now)
        const currentLocation = this.History.location;
        this.handleNavigation(currentLocation);

        // Listen for future navigation changes
        // History.listen() returns a function to stop listening
        this.unlistener = this.History.listen((location) => {
            // This callback runs every time URL changes
            this.handleNavigation(location);
        });
    }

    stop(){
       if(this.unlistener){
           this.unlistener();
           this.unlistener = null;
       }
    }

    handleNavigation(location) {
        const pathname = location.pathname;

        // Skip if we're already on this exact page
        // This prevents processing the same page multiple times
        if (pathname === this.state.lastPathname) {
            return; // Exit early, nothing to do
        }
        this.state.update({ lastPathname: pathname });

        // Check if it's an artist page
        if (!DOMUtils.isArtistPage(pathname)) {
            if(this.state.isTimelineActive)
                this.cleanup();
            return; // Not an artist page, exit early
        }
        const artistId = DOMUtils.extractArtistId(pathname);

        // Validate artistId
        if (!artistId) {
            console.warn("Navigator: Invalid artist ID extracted.");
            return; // Invalid artist ID, exit early
        }

        this.state.update({ currentArtistId: artistId });

        // Save to localStorage
        localStorage.setItem('lastArtistId', artistId);

        // Notify that we're on an artist page
        this.onArtistPageDetected(artistId);
    }

    // Removes the element in the DOM that we created
    cleanup() {
        if (this.state.timelineContainer)
            this.state.timelineContainer.remove();

        if (this.state.injectedButton)
            this.state.injectedButton.remove();
        // Only restore if we actually hid it
        if (this.state.originalGridContainer && this.state.isTimelineActive)
            this.state.originalGridContainer.style.display = '';

        this.state.reset();
    }
}

// ========== modules/DataExtractor.js ==========
/**
 * DataExtractor - Extracts release data from DOM and GraphQL
 *
 * Responsibilities:
 * - Extract release information from DOM (cards in discography grid)
 * - Fallback to GraphQL when DOM data is incomplete
 * - Merge and normalize data from both sources
 * - Handle missing data gracefully
 */
class DataExtractor {
    constructor() {
        this.lastExtractedData = null;
    }

    /**
     * Extract release data from DOM
     * @param {HTMLElement} container - Discography container element
     * @returns {Array} Array of release objects
     */
    extractFromDOM(container) {
        if (!container) {
            console.warn('[DataExtractor] No container provided');
            return [];
        }

        const releases = [];

        // Try multiple selectors to find album cards
        const cardSelectors = [
            '[data-testid="card-item"]',
            '[data-testid="grid-card"]',
            '.main-card-card',
            '[class*="Card"]',
            'article',
        ];

        let cards = [];
        for (const selector of cardSelectors) {
            cards = container.querySelectorAll(selector);
            if (cards.length > 0) {
                console.log(`[DataExtractor] Found ${cards.length} cards using: ${selector}`);
                break;
            }
        }

        if (cards.length === 0) {
            console.warn('[DataExtractor] No album cards found in DOM');
            return releases;
        }

        cards.forEach((card, index) => {
            try {
                const release = this.extractReleaseFromCard(card, index);
                if (release) {
                    releases.push(release);
                }
            } catch (error) {
                console.warn('[DataExtractor] Error extracting card data:', error);
            }
        });

        console.log(`[DataExtractor] Extracted ${releases.length} releases from DOM`);
        this.lastExtractedData = releases;
        return releases;
    }

    /**
     * Extract release data from a single card element
     * @param {HTMLElement} card - Card element
     * @param {number} index - Card index
     * @returns {Object|null} Release object or null
     */
    extractReleaseFromCard(card, index) {
        // Extract URI (most reliable identifier)
        const uri = this.extractUri(card);
        if (!uri) {
            console.warn('[DataExtractor] Card missing URI, skipping');
            return null;
        }

        // Extract other data
        const name = this.extractName(card);
        const image = this.extractImage(card);
        const type = this.extractType(card);
        const date = this.extractDate(card);

        return {
            uri,
            name: name || 'Unknown Album',
            image: image || this.getPlaceholderImage(),
            type: type || 'Album',
            date: date || null,
            isPlaying: this.isCurrentlyPlaying(uri),
            index
        };
    }

    /**
     * Extract URI from card
     * @param {HTMLElement} card - Card element
     * @returns {string|null} Spotify URI
     */
    extractUri(card) {
        // Try data attribute
        const dataUri = card.getAttribute('data-uri');
        if (dataUri) return dataUri;

        // Try link href
        const link = card.querySelector('a[href*="/album/"]');
        if (link) {
            const albumId = link.href.match(/\/album\/([a-zA-Z0-9]+)/)?.[1];
            if (albumId) return `spotify:album:${albumId}`;
        }

        // Try button or play elements
        const playButton = card.querySelector('[data-uri]');
        if (playButton) {
            return playButton.getAttribute('data-uri');
        }

        return null;
    }

    /**
     * Extract album/release name from card
     * @param {HTMLElement} card - Card element
     * @returns {string|null} Album name
     */
    extractName(card) {
        // Try multiple selectors
        const selectors = [
            '[data-testid="card-title"]',
            '.main-card-card-title',
            '.main-cardHeader-text',
            'h3',
            'h4',
            '[class*="title"]',
        ];

        for (const selector of selectors) {
            const element = card.querySelector(selector);
            if (element?.textContent) {
                return element.textContent.trim();
            }
        }

        return null;
    }

    /**
     * Extract cover image from card
     * @param {HTMLElement} card - Card element
     * @returns {string|null} Image URL
     */
    extractImage(card) {
        // Try img tag
        const img = card.querySelector('img');
        if (img?.src) {
            return img.src;
        }

        // Try background image
        const imageContainer = card.querySelector('[style*="background-image"]');
        if (imageContainer) {
            const bgImage = imageContainer.style.backgroundImage;
            const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (match) return match[1];
        }

        return null;
    }

    /**
     * Extract release type (Album, Single, EP, etc.)
     * @param {HTMLElement} card - Card element
     * @returns {string|null} Release type
     */
    extractType(card) {
        // Try subtitle/meta elements
        const selectors = [
            '[data-testid="card-subtitle"]',
            '.main-card-card-subtitle',
            '.main-cardSubHeader-text',
            '[class*="subtitle"]',
        ];

        for (const selector of selectors) {
            const element = card.querySelector(selector);
            if (element?.textContent) {
                const text = element.textContent.trim();
                // Extract type (usually the first word: "Album", "Single", "EP")
                const typeMatch = text.match(/^(Album|Single|EP|Compilation)/i);
                if (typeMatch) return typeMatch[1];
                return text.split('•')[0].trim();
            }
        }

        return null;
    }

    /**
     * Extract release date from card
     * @param {HTMLElement} card - Card element
     * @returns {Date|null} Release date
     */
    extractDate(card) {
        // Try time element
        const timeElement = card.querySelector('time[datetime]');
        if (timeElement) {
            const datetime = timeElement.getAttribute('datetime');
            if (datetime) {
                const date = new Date(datetime);
                if (!isNaN(date.getTime())) return date;
            }
        }

        // Try parsing from subtitle text (e.g., "Album • 2023")
        const selectors = [
            '[data-testid="card-subtitle"]',
            '.main-card-card-subtitle',
            '[class*="subtitle"]',
        ];

        for (const selector of selectors) {
            const element = card.querySelector(selector);
            if (element?.textContent) {
                const text = element.textContent;
                // Look for year (4 digits)
                const yearMatch = text.match(/\b(19|20)\d{2}\b/);
                if (yearMatch) {
                    const year = parseInt(yearMatch[0]);
                    return new Date(year, 0, 1); // Jan 1st of that year
                }
            }
        }

        return null;
    }

    /**
     * Check if a URI is currently playing
     * @param {string} uri - Spotify URI
     * @returns {boolean} True if playing
     */
    isCurrentlyPlaying(uri) {
        try {
            const currentTrack = Spicetify.Player?.data?.item;
            if (!currentTrack) return false;

            const currentAlbumUri = currentTrack.metadata?.album_uri;
            return currentAlbumUri === uri;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get placeholder image for missing album art
     * @returns {string} Data URL for placeholder image
     */
    getPlaceholderImage() {
        // Simple 1x1 gray pixel
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=';
    }

    /**
     * Fetch release data using GraphQL as fallback
     * @param {string} artistId - Spotify artist ID
     * @returns {Promise<Array>} Array of release objects
     */
    async fetchFromGraphQL(artistId) {
        if (!artistId) {
            console.warn('[DataExtractor] No artist ID provided for GraphQL');
            return [];
        }

        try {
            console.log('[DataExtractor] Fetching from GraphQL for artist:', artistId);

            // Use Spicetify's GraphQL API
            const response = await Spicetify.GraphQL.Request(
                Spicetify.GraphQL.Definitions.queryArtistDiscographyAll,
                { uri: `spotify:artist:${artistId}` }
            );

            if (!response?.data?.artist?.discography) {
                console.warn('[DataExtractor] No discography data in GraphQL response');
                return [];
            }

            const releases = this.parseGraphQLResponse(response.data.artist.discography);
            console.log(`[DataExtractor] Fetched ${releases.length} releases from GraphQL`);
            return releases;
        } catch (error) {
            console.error('[DataExtractor] GraphQL fetch failed:', error);
            return [];
        }
    }

    /**
     * Parse GraphQL response into release objects
     * @param {Object} discography - GraphQL discography object
     * @returns {Array} Array of release objects
     */
    parseGraphQLResponse(discography) {
        const releases = [];

        // GraphQL returns releases in categories: albums, singles, compilations, etc.
        const categories = ['albums', 'singles', 'compilations'];

        categories.forEach(category => {
            const items = discography[category]?.items || [];
            items.forEach((item, index) => {
                try {
                    const release = this.parseGraphQLRelease(item, category);
                    if (release) {
                        releases.push(release);
                    }
                } catch (error) {
                    console.warn('[DataExtractor] Error parsing GraphQL release:', error);
                }
            });
        });

        // Sort by date (newest first)
        releases.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date - a.date;
        });

        return releases;
    }

    /**
     * Parse a single GraphQL release item
     * @param {Object} item - GraphQL release item
     * @param {string} category - Release category
     * @returns {Object|null} Release object
     */
    parseGraphQLRelease(item, category) {
        const uri = item.uri || item.releases?.items?.[0]?.uri;
        if (!uri) return null;

        // Extract release date
        let date = null;
        const dateString = item.date?.year
            ? `${item.date.year}-${String(item.date.month || 1).padStart(2, '0')}-${String(item.date.day || 1).padStart(2, '0')}`
            : null;
        if (dateString) {
            date = new Date(dateString);
            if (isNaN(date.getTime())) date = null;
        }

        // Extract image
        const image = item.coverArt?.sources?.[0]?.url || this.getPlaceholderImage();

        // Normalize type
        let type = 'Album';
        if (category === 'singles') type = 'Single';
        else if (category === 'compilations') type = 'Compilation';
        else if (item.type) type = item.type;

        return {
            uri,
            name: item.name || 'Unknown Album',
            image,
            type,
            date,
            isPlaying: this.isCurrentlyPlaying(uri),
        };
    }

    /**
     * Merge DOM and GraphQL data
     * @param {Array} domReleases - Releases from DOM
     * @param {Array} graphqlReleases - Releases from GraphQL
     * @returns {Array} Merged releases
     */
    mergeData(domReleases, graphqlReleases) {
        const merged = [...domReleases];
        const domUris = new Set(domReleases.map(r => r.uri));

        // Add GraphQL releases that aren't in DOM data
        graphqlReleases.forEach(gqlRelease => {
            const domRelease = merged.find(r => r.uri === gqlRelease.uri);

            if (domRelease) {
                // Merge: prefer DOM data but fill missing fields from GraphQL
                if (!domRelease.date && gqlRelease.date) {
                    domRelease.date = gqlRelease.date;
                }
                if (!domRelease.type && gqlRelease.type) {
                    domRelease.type = gqlRelease.type;
                }
                if (!domRelease.image || domRelease.image === this.getPlaceholderImage()) {
                    domRelease.image = gqlRelease.image;
                }
            } else if (!domUris.has(gqlRelease.uri)) {
                // Add GraphQL-only release
                merged.push(gqlRelease);
            }
        });

        // Sort by date (newest first)
        merged.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date - a.date;
        });

        console.log(`[DataExtractor] Merged ${merged.length} total releases`);
        return merged;
    }

    /**
     * Extract releases with GraphQL fallback
     * @param {HTMLElement} container - DOM container
     * @param {string} artistId - Artist ID for GraphQL fallback
     * @returns {Promise<Array>} Array of release objects
     */
    async extractWithFallback(container, artistId) {
        // First try DOM extraction
        const domReleases = this.extractFromDOM(container);

        // Check if DOM data is incomplete (missing dates/types)
        const isIncomplete = domReleases.some(r => !r.date || !r.type);

        if (isIncomplete || domReleases.length === 0) {
            console.log('[DataExtractor] DOM data incomplete, using GraphQL fallback');
            const graphqlReleases = await this.fetchFromGraphQL(artistId);

            // Merge both sources
            return this.mergeData(domReleases, graphqlReleases);
        }

        return domReleases;
    }
}

// ========== modules/views/Horizontal.js ==========
class HorizontalView {
    constructor(core) {
        this.core = core;
    }

    render(container, releases) {
        // Configure container for horizontal scrolling
        container.classList.add('timeline--horizontal');
        container.classList.remove('timeline--vertical');
        
        // Ensure horizontal scrollbar (slider) appears at the bottom
        container.style.overflowX = 'auto';
        container.style.overflowY = 'hidden';
        container.style.display = 'block';

        const proportionalSpacing = this.core.config.get('proportionalSpacing') || false;
        if (proportionalSpacing) {
            container.setAttribute('data-proportional-spacing', 'true');
        }

        // Create timeline track (the line)
        const track = document.createElement('div');
        track.className = 'timeline-track';
        track.setAttribute('aria-hidden', true);
        container.appendChild(track);

        // Create cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'timeline-cards';
        cardsContainer.setAttribute('role', 'list');

        // Render cards
        releases.forEach((release, index) => {
            const card = this.core.createCard(release, index);

            // Apply proportional spacing
            if (proportionalSpacing && index > 0) {
                const spacing = this.core.calculateSpacing(releases[index - 1], release);
                card.style.marginLeft = `${spacing}px`;
            }

            cardsContainer.appendChild(card);
        });

        container.appendChild(cardsContainer);

        // Add horizontal specific interactions
        if (this.core.config.get('showScrollButtons')) {
            this.addScrollButtons(container);
        }
        this.addMouseWheelScroll(container);
    }

    /**
     * Add scroll buttons (Left/Right arrows)
     */
    addScrollButtons(container) {
        // Left scroll button
        const leftButton = document.createElement('button');
        leftButton.className = 'timeline-scroll-button timeline-scroll-button--left';
        leftButton.setAttribute('aria-label', 'Scroll left');
        leftButton.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;

        // Right scroll button
        const rightButton = document.createElement('button');
        rightButton.className = 'timeline-scroll-button timeline-scroll-button--right';
        rightButton.setAttribute('aria-label', 'Scroll right');
        rightButton.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`;

        const scrollAmount = 250;

        leftButton.addEventListener('click', () => {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        rightButton.addEventListener('click', () => {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        const updateButtonStates = () => {
            const isAtStart = container.scrollLeft <= 0;
            const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
            leftButton.disabled = isAtStart;
            rightButton.disabled = isAtEnd;
        };

        // Initial state and listeners
        updateButtonStates();
        container.addEventListener('scroll', DOMUtils.debounce(updateButtonStates, 100));

        container.appendChild(leftButton);
        container.appendChild(rightButton);
    }

    /**
     * Add mouse wheel horizontal scroll support
     */
    addMouseWheelScroll(container) {
        const handleWheel = DOMUtils.debounce((e) => {
            // Only handle horizontal scroll if not already scrolling vertically
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                container.scrollBy({
                    left: e.deltaY,
                    behavior: 'smooth'
                });
            }
        }, 10);

        container.addEventListener('wheel', handleWheel, { passive: false });
    }
}

// ========== modules/views/Vertical.js ==========
class VerticalView {
    constructor(core) {
        this.core = core;
    }

    render(container, releases) {
        // Configure container for Vertical Winding (Snake) layout
        container.classList.add('timeline--vertical-snake');
        container.classList.remove('timeline--horizontal');
        
        container.style.overflowX = 'hidden';
        container.style.overflowY = 'auto'; // Standard vertical scrollbar
        container.style.display = 'block';

        const proportionalSpacing = this.core.config.get('proportionalSpacing') || false;

        // Create cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'timeline-snake-container';
        
        // Group releases into rows
        const itemsPerRow = 4; // Adjust based on your preference
        const rows = [];
        
        for (let i = 0; i < releases.length; i += itemsPerRow) {
            rows.push(releases.slice(i, i + itemsPerRow));
        }

        // Render Rows
        rows.forEach((rowItems, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'timeline-snake-row';
            
            // Alternate direction: Odd rows (index 1, 3...) go Right-to-Left
            const isReverse = rowIndex % 2 !== 0;
            if (isReverse) {
                rowDiv.classList.add('timeline-snake-row--reverse');
                // We reverse the items array for rendering so the DOM order matches visual order 
                // (simpler for spacing calculation)
                rowItems.reverse();
            }

            // Create connector line container for this row
            const line = document.createElement('div');
            line.className = 'timeline-snake-line';
            rowDiv.appendChild(line);

            rowItems.forEach((release, index) => {
                const card = this.core.createCard(release, index + (rowIndex * itemsPerRow));
                
                // Add margins for spacing
                if (proportionalSpacing && index > 0) {
                    // For reverse rows, we are calculating space from the "previous" item 
                    // which is physically to the right/left depending on flow.
                    // Because we reversed the array above, we can just look at index-1
                    const spacing = this.core.calculateSpacing(rowItems[index-1], release);
                    
                    // In a flex row, margin-left pushes item right.
                    // In a reverse flex row, margin-right pushes item left (conceptually).
                    // We'll apply margin-left uniformly and let Flexbox handle direction.
                    card.style.marginLeft = `${spacing}px`;
                }

                rowDiv.appendChild(card);
            });

            cardsContainer.appendChild(rowDiv);
            
            // Add "Turn" connectors between rows
            if (rowIndex < rows.length - 1) {
                const turn = document.createElement('div');
                turn.className = isReverse 
                    ? 'timeline-snake-turn timeline-snake-turn--left' 
                    : 'timeline-snake-turn timeline-snake-turn--right';
                cardsContainer.appendChild(turn);
            }
        });

        container.appendChild(cardsContainer);
    }
}

// ========== modules/options/FilterManager.js ==========
/**
 * FilterManager - Handles detection and observation of Spotify's discography filters
 * (Albums, Singles & EPs, Compilations, All)
 */
class FilterManager {
    constructor(core) {
        this.core = core;
        this.currentFilter = 'all';
        this._handleFilterChange = this.handleFilterChange.bind(this);
        this.filterObserver = null;
    }

    /**
     * Initialize filter detection and observation
     * @param {HTMLElement} discographyContainer - The discography container element
     */
    initialize(discographyContainer) {
        this.discographyContainer = discographyContainer;
        this.detectCurrentFilter();
        this.observeFilterChanges();
    }

    /**
     * Clean up observers and listeners
     */
    destroy() {
        if (this.filterObserver) {
            this.filterObserver.disconnect();
            this.filterObserver = null;
        }
        
        // Remove tab click listeners
        const tabContainer = this.findTabContainer();
        if (tabContainer) {
            tabContainer.removeEventListener('click', this._handleFilterChange);
        }
    }

    /**
     * Get the current active filter
     * @returns {string} Current filter ('all', 'albums', 'singles', 'compilations')
     */
    getCurrentFilter() {
        return this.currentFilter;
    }

    /**
     * Detect the current filter from URL or active tab
     */
    detectCurrentFilter() {
        const pathname = window.location.pathname;
        
        // Check URL patterns
        if (pathname.includes('/discography/album')) {
            this.currentFilter = 'albums';
        } else if (pathname.includes('/discography/single') || pathname.includes('/discography/ep')) {
            this.currentFilter = 'singles';
        } else if (pathname.includes('/discography/compilation')) {
            this.currentFilter = 'compilations';
        } else {
            // Check for active tab in DOM
            this.currentFilter = this.detectFilterFromTabs() || 'all';
        }
        
        console.log('[FilterManager] Detected filter:', this.currentFilter);
    }

    /**
     * Detect filter from active tab element
     * @returns {string|null} Filter type or null
     */
    detectFilterFromTabs() {
        const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
        if (!activeTab) return null;

        const tabText = activeTab.textContent?.toLowerCase() || '';
        
        if (tabText.includes('album') && !tabText.includes('single')) {
            return 'albums';
        } else if (tabText.includes('single') || tabText.includes('ep')) {
            return 'singles';
        } else if (tabText.includes('compilation')) {
            return 'compilations';
        }
        
        return null;
    }

    /**
     * Find the tab container element
     * @returns {HTMLElement|null} Tab container or null
     */
    findTabContainer() {
        const tabSelectors = [
            '[role="tablist"]',
            '[data-testid="discography-tabs"]',
            '.discography-tabs',
        ];

        for (const selector of tabSelectors) {
            const container = document.querySelector(selector);
            if (container) return container;
        }
        return null;
    }

    /**
     * Set up observers for filter changes (tab clicks, URL changes, DOM mutations)
     */
    observeFilterChanges() {
        // Watch for tab clicks
        const tabContainer = this.findTabContainer();
        if (tabContainer) {
            tabContainer.addEventListener('click', this._handleFilterChange);
        }

        // Observe DOM changes for dynamic content updates
        this.filterObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    const gridChanged = this.isGridMutation(mutation);
                    
                    if (gridChanged && this.core.state.isTimelineActive) {
                        this.handleFilterChange();
                    }
                }
            }
        });

        if (this.discographyContainer) {
            this.filterObserver.observe(this.discographyContainer, { 
                childList: true, 
                subtree: true,
                attributes: true,
                attributeFilter: ['aria-selected', 'class']
            });
        }

        // Listen for Spicetify history changes
        this.setupHistoryListener();
    }

    /**
     * Check if a mutation affects the grid content
     * @param {MutationRecord} mutation - The mutation record
     * @returns {boolean} True if grid was affected
     */
    isGridMutation(mutation) {
        return mutation.target.classList?.contains('main-gridContainer-gridContainer') ||
               mutation.target.querySelector?.('[data-testid="grid-container"]');
    }

    /**
     * Set up listener for Spicetify history/navigation changes
     */
    setupHistoryListener() {
        if (Spicetify.Platform?.History) {
            Spicetify.Platform.History.listen((location) => {
                if (location.pathname.includes('/discography')) {
                    setTimeout(() => this.handleFilterChange(), 300);
                }
            });
        }
    }

    /**
     * Handle filter/tab change - notify core to re-render
     * @param {Event} [event] - Click event (optional)
     */
    async handleFilterChange(event) {
        const oldFilter = this.currentFilter;
        this.detectCurrentFilter();

        // If filter changed and timeline is active, notify core
        if (this.core.state.isTimelineActive && (oldFilter !== this.currentFilter || event)) {
            console.log('[FilterManager] Filter changed from', oldFilter, 'to', this.currentFilter);
            
            // Wait for Spotify to update the DOM
            await this.waitForDOMUpdate();
            
            // Notify core to refresh
            this.core.onFilterChange();
        }
    }

    /**
     * Wait for Spotify's DOM to update after filter change
     * @returns {Promise<void>}
     */
    async waitForDOMUpdate() {
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    /**
     * Find the updated grid container after filter change
     * @returns {Promise<HTMLElement|null>} Updated container or null
     */
    async findUpdatedGridContainer() {
        const gridSelectors = [
            '[data-testid="grid-container"]',
            '.main-gridContainer-gridContainer',
            '[class*="grid"]',
        ];

        for (let attempt = 0; attempt < 5; attempt++) {
            for (const selector of gridSelectors) {
                const container = this.discographyContainer?.querySelector(selector) ||
                                document.querySelector(selector);
                if (container && container !== this.core.state.originalGridContainer) {
                    return container;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return null;
    }
}

// ========== modules/options/MenuInjector.js ==========
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

// ========== modules/options/ViewSwitcher.js ==========
/**
 * ViewSwitcher - Handles switching between Grid and Timeline views
 */
class ViewSwitcher {
    constructor(core) {
        this.core = core;
    }

    /**
     * Handle fallback button click
     */
    async handleButtonClick() {
        if (this.core.state.isTimelineActive) {
            this.switchToGrid();
        } else {
            await this.switchToTimeline('timeline-horizontal');
        }
    }

    /**
     * Switch to a timeline view
     * @param {string} viewType - 'timeline-horizontal' or 'timeline-vertical'
     */
    async switchToTimeline(viewType = 'timeline-horizontal') {
        console.log('[ViewSwitcher] Switching to timeline:', viewType);
        
        const orientation = viewType === 'timeline-vertical' ? 'vertical' : 'horizontal';
        this.core.config.set('orientation', orientation);

        // Extract releases from current DOM content
        let releases = this.core.dataExtractor.extractFromDOM(this.core.state.originalGridContainer);

        if (!releases || releases.length === 0) {
            Spicetify.showNotification('No releases found to display', true, 3000);
            return;
        }

        // Apply sort order
        releases = this.applySortOrder(releases);

        // Hide original grid
        if (this.core.state.originalGridContainer) {
            this.core.state.originalGridContainer.style.display = 'none';
        }

        // Render timeline
        this.core.renderTimeline(releases);

        // Update state
        this.core.state.saveViewPref(viewType);
        this.core.state.update({ 
            isTimelineActive: true,
            currentView: viewType 
        });

        // Update fallback button if exists
        this.updateFallbackButton(true);

        const viewName = orientation === 'vertical' ? 'Snake' : 'Horizontal';
        Spicetify.showNotification(`Timeline (${viewName}) activated`, false, 2000);
    }

    /**
     * Apply sort order to releases
     * @param {Array} releases - Array of release objects
     * @returns {Array} Sorted releases
     */
    applySortOrder(releases) {
        const sortOrder = this.core.state.sortOrder || 'desc';
        
        return [...releases].sort((a, b) => {
            // Handle missing dates
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;  // Push items without dates to the end
            if (!b.date) return -1;
            
            const dateA = a.date.getTime();
            const dateB = b.date.getTime();
            
            if (sortOrder === 'asc') {
                return dateA - dateB;  // Oldest first
            } else {
                return dateB - dateA;  // Newest first (default)
            }
        });
    }

    /**
     * Switch back to grid view
     */
    switchToGrid() {
        console.log('[ViewSwitcher] Switching to grid');
        
        // Remove timeline container
        if (this.core.state.timelineContainer) {
            this.core.state.timelineContainer.remove();
            this.core.state.update({ timelineContainer: null });
        }

        // Show original grid
        if (this.core.state.originalGridContainer) {
            this.core.state.originalGridContainer.style.display = '';
        }

        // Update state
        this.core.state.saveViewPref('grid');
        this.core.state.update({ 
            isTimelineActive: false,
            currentView: 'grid'
        });

        // Update fallback button if exists
        this.updateFallbackButton(false);

        Spicetify.showNotification('Grid view activated', false, 2000);
    }

    /**
     * Update the fallback button's active state
     * @param {boolean} isActive - Whether timeline is active
     */
    updateFallbackButton(isActive) {
        const button = this.core.state.injectedButton;
        if (!button) return;

        if (isActive) {
            button.classList.add('timeline-view-button--active');
            button.setAttribute('aria-selected', 'true');
            button.style.backgroundColor = 'var(--spice-button-active, rgba(255,255,255,0.2))';
        } else {
            button.classList.remove('timeline-view-button--active');
            button.setAttribute('aria-selected', 'false');
            button.style.backgroundColor = 'var(--spice-button, rgba(255,255,255,0.07))';
        }
    }

    /**
     * Refresh the current view (re-extract and re-render)
     */
    async refresh() {
        if (!this.core.state.isTimelineActive) return;

        console.log('[ViewSwitcher] Refreshing timeline');
        
        let releases = this.core.dataExtractor.extractFromDOM(this.core.state.originalGridContainer);
        
        if (releases && releases.length > 0) {
            // Apply sort order
            releases = this.applySortOrder(releases);
            this.core.renderTimeline(releases);
        } else {
            console.log('[ViewSwitcher] No releases found for current filter');
        }
    }
}

// ========== modules/TimelineCore.js ==========
/**
 * TimelineCore - Orchestrates timeline view rendering and interactions
 * 
 * Delegates responsibilities to:
 * - FilterManager: Filter detection & observation
 * - MenuInjector: Dropdown menu injection
 * - ViewSwitcher: View switching logic
 * - HorizontalView/VerticalView: Rendering
 */
class TimelineCore {
    constructor(config, state) {
        this.config = config;
        this.state = state;
        this.dataExtractor = null;
        this.discographyContainer = null;
        this.releases = null;

        // Initialize view renderers
        this.horizontalView = new HorizontalView(this);
        this.verticalView = new VerticalView(this);

        // Initialize option managers
        this.filterManager = new FilterManager(this);
        this.menuInjector = new MenuInjector(this);
        this.viewSwitcher = new ViewSwitcher(this);
    }

    /**
     * Initialize the timeline core and all sub-modules
     * @param {HTMLElement} discographyContainer - The discography container
     * @param {DataExtractor} dataExtractor - Data extraction instance
     */
    async initialize(discographyContainer, dataExtractor) {
        this.discographyContainer = discographyContainer;
        this.dataExtractor = dataExtractor;

        // Initialize sub-modules
        this.filterManager.initialize(discographyContainer);
        await this.menuInjector.initialize(discographyContainer);

        // Restore previous view if it was a timeline
        if (this.state.currentView === 'timeline-horizontal' || 
            this.state.currentView === 'timeline-vertical') {
            await this.viewSwitcher.switchToTimeline(this.state.currentView);
        }
    }

    /**
     * Clean up all resources
     */
    destroy() {
        if (this.state.timelineContainer) {
            this.state.timelineContainer.remove();
        }
        if (this.state.originalGridContainer) {
            this.state.originalGridContainer.style.display = '';
        }
        
        // Destroy sub-modules
        this.filterManager.destroy();
        this.menuInjector.destroy();
        
        this.discographyContainer = null;
        this.dataExtractor = null;
        this.releases = null;
    }

    /**
     * Called by FilterManager when filter changes
     */
    async onFilterChange() {
        // Find updated grid container
        const newContainer = await this.filterManager.findUpdatedGridContainer();
        if (newContainer) {
            this.state.update({ originalGridContainer: newContainer });
        }
        
        // Refresh the view
        await this.viewSwitcher.refresh();
    }

    /**
     * Render the timeline with given releases
     * @param {Array} releases - Array of release objects
     */
    renderTimeline(releases) {
        this.releases = releases;
        
        // Remove existing timeline
        if (this.state.timelineContainer) {
            this.state.timelineContainer.remove();
        }

        // Create new container
        const container = document.createElement('div');
        container.className = 'timeline-view';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Artist discography timeline');

        // Add filter indicator
        const currentFilter = this.filterManager.getCurrentFilter();
        if (currentFilter !== 'all') {
            container.setAttribute('data-filter', currentFilter);
        }

        // Render based on orientation
        const orientation = this.config.get('orientation') || 'horizontal';
        if (orientation === 'horizontal') {
            this.horizontalView.render(container, releases);
        } else {
            this.verticalView.render(container, releases);
        }

        // Insert into DOM
        this.state.originalGridContainer.parentNode.insertBefore(
            container, 
            this.state.originalGridContainer.nextSibling
        );
        this.state.update({ timelineContainer: container });
    }

    /**
     * Create a timeline card element
     * @param {Object} release - Release data object
     * @param {number} index - Card index
     * @returns {HTMLElement} Card element
     */
    createCard(release, index) {
        const card = document.createElement('div');
        card.className = 'timeline-card';
        card.setAttribute('role', 'listitem');
        card.dataset.uri = release.uri;
        card.dataset.index = index;
        card.dataset.type = release.type?.toLowerCase() || 'album';

        if (release.isPlaying) {
            card.classList.add('timeline-card--playing');
            card.setAttribute('aria-current', 'true');
        }

        const dateText = release.date
            ? release.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
            : 'Unknown Date';

        card.innerHTML = `
            <div class="timeline-card__marker" aria-hidden="true"></div>
            <div class="timeline-card__content">
                <div class="timeline-card__image-wrapper">
                    <img src="${release.image}" alt="${this.escapeHtml(release.name)}" 
                         class="timeline-card__image" loading="lazy" />
                    <button class="timeline-card__play-button" 
                            aria-label="Play ${this.escapeHtml(release.name)}" 
                            data-uri="${release.uri}">
                        ${this.getPlayIcon()}
                    </button>
                </div>
                <div class="timeline-card__info">
                    <h3 class="timeline-card__title">${this.escapeHtml(release.name)}</h3>
                    <div class="timeline-card__meta">
                        <span class="timeline-card__type">${release.type}</span>
                        <span class="timeline-card__separator">•</span>
                        <time class="timeline-card__date" datetime="${release.date?.toISOString() || ''}">
                            ${dateText}
                        </time>
                    </div>
                </div>
            </div>
        `;

        this.attachCardListeners(card, release);
        return card;
    }

    /**
     * Attach event listeners to a card
     * @param {HTMLElement} card - Card element
     * @param {Object} release - Release data
     */
    attachCardListeners(card, release) {
        // Play button
        const playButton = card.querySelector('.timeline-card__play-button');
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                e.stopPropagation();
                Spicetify.Player.playUri(release.uri);
            });
        }

        // Card click - navigate to album
        card.addEventListener('click', () => {
            const albumID = release.uri.split(':')[2];
            Spicetify.Platform.History.push(`/album/${albumID}`);
        });

        // Keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    }

    /**
     * Calculate spacing between cards based on release dates
     * @param {Object} prevRelease - Previous release
     * @param {Object} currentRelease - Current release
     * @returns {number} Spacing in pixels
     */
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

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get play icon SVG
     * @returns {string} SVG HTML
     */
    getPlayIcon() {
        return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>`;
    }
}

// ========== artistTimeline.js ==========
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

