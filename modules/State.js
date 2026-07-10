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