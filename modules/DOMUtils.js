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

    // boolean
    static isArtistPage(url) {
        return url.startsWith('artist/');
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