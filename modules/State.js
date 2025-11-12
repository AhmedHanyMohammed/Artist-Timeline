class State {
    constructor() {
        // View preferences key
        this.VIEW_PREF_KEY = 'artist-timeline-view-preference';

        this. currentArtistId = null;
        this. currentView = this.loadViewPref();
        this.isTimelineActive = false;
        this. timelinecontainer = null;
        this.originalGridContainer = null;
        this. injectedButton = null;
        this. lastPathname = null;
    }

    loadViewPref() {
        return localStorage.getItem(this.VIEW_PREF_KEY) || 'grid';
    }

    saveViewPref(view) {
        localStorage.setItem(this.VIEW_PREF_KEY, view);
        this.currentView = view;
    }

    update(updates) {
        Object.assign(this, updates);
    }

    reset() {
        this.currentArtistId = null;
        this.currentView = this.loadViewPref();
        this.isTimelineActive = false;
        this.timelinecontainer = null;
        this.originalGridContainer = null;
        this.injectedButton = null;
        this.lastPathname = null;
    }
}