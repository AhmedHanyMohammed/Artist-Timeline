const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Read all module files in the correct order
const moduleOrder = [
    'modules/Config.js',
    'modules/State.js',
    'modules/DOMUtils.js',
    'modules/Navigator.js',
    'modules/DataExtractor.js',
    'modules/views/Horizontal.js',
    'modules/views/Vertical.js',
    'modules/TimelineCore.js',
    'artistTimeline.js'
];

// Read CSS file
const cssContent = fs.readFileSync('styles/timeline.css', 'utf8');

// Combine all JS files
let combinedJS = '';

// Add CSS injection at the top
combinedJS += `
// ============================================
// Artist Discography Timeline - Bundled Build
// Author: AhmedHanyMohammed
// ============================================

(function() {
    // Inject CSS styles
    const style = document.createElement('style');
    style.id = 'artist-timeline-styles';
    style.textContent = \`${cssContent.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`;
    if (!document.getElementById('artist-timeline-styles')) {
        document.head.appendChild(style);
    }
})();

`;

// Read and combine all modules
moduleOrder.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        combinedJS += `\n// ========== ${filePath} ==========\n`;
        combinedJS += content;
        combinedJS += '\n';
    } else {
        console.warn(`Warning: ${filePath} not found`);
    }
});

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Write the bundled file
fs.writeFileSync('dist/artistTimeline.js', combinedJS);

console.log('✅ Build complete: dist/artistTimeline.js');

// If --watch flag is provided, watch for changes
if (process.argv.includes('--watch')) {
    console.log('👀 Watching for changes...');
    
    const watchPaths = ['modules', 'styles', '.'];
    
    watchPaths.forEach(watchPath => {
        if (fs.existsSync(watchPath)) {
            fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
                if (filename && (filename.endsWith('.js') || filename.endsWith('.css'))) {
                    console.log(`\n📝 ${filename} changed, rebuilding...`);
                    try {
                        // Re-run build
                        require('child_process').execSync('node build.js', { stdio: 'inherit' });
                    } catch (e) {
                        console.error('Build failed:', e.message);
                    }
                }
            });
        }
    });
}