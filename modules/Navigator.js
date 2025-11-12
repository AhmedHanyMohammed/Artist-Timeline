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
        if(this.state.timelinecontainer)
            this.state.timelinecontainer.remove();

        if(this.state.injectedButton)
            this.state.injectedButton.remove();

        if(this.state.originalGridContainer)
            this.state.originalGridContainer.style.display = '';

        this.state.reset();
    }
}