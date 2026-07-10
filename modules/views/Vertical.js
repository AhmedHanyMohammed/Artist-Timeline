class VerticalView {
    constructor(core) {
        this.core = core;
    }

    render(container, releases) {
        // Configure container for Vertical Winding (Snake) layout
        container.classList.add('timeline--vertical-snake');
        container.classList.remove('timeline--horizontal');
        
        container.style.overflowX = 'hidden';
        container.style.overflowY = 'auto';
        container.style.maxHeight = 'calc(100vh - 220px)';
        container.style.display = 'block';

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
        this.addMouseWheelScroll(container);
    }

    addMouseWheelScroll(container) {
        const handleWheel = DOMUtils.debounce((e) => {
            const verticalIntent = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
            if (!verticalIntent) return;

            const atTop = container.scrollTop <= 0;
            const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;

            // Let Spotify page scroll continue when timeline is already at an edge.
            if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
                return;
            }

            e.preventDefault();
            container.scrollBy({ top: e.deltaY, behavior: 'auto' });
        }, 8);

        container.addEventListener('wheel', handleWheel, { passive: false });
    }
}