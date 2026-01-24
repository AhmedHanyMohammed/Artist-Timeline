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