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
