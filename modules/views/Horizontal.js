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