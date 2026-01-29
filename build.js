const fs = require('fs');

// Module order - these are your SOURCE files
const moduleOrder = [
    'modules/Config.js',
    'modules/State.js',
    'modules/DOMUtils.js',
    'modules/Navigator.js',
    'modules/DataExtractor.js',
    'modules/views/Horizontal.js',
    'modules/views/Vertical.js',
    'modules/options/FilterManager.js',
    'modules/options/MenuInjector.js',
    'modules/options/ViewSwitcher.js',
    'modules/TimelineCore.js',
    'src/main.js'  // Or keep as separate entry point
];

// Read CSS
const cssContent = fs.readFileSync('styles/timeline.css', 'utf8');

// Build combined JS
let combinedJS = `
// ============================================
// Artist Discography Timeline - Bundled Build
// Author: AhmedHanyMohammed
// ============================================

(function() {
    const style = document.createElement('style');
    style.id = 'artist-timeline-styles';
    style.textContent = \`${cssContent.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`;
    if (!document.getElementById('artist-timeline-styles')) {
        document.head.appendChild(style);
    }
})();

`;

// Combine modules
moduleOrder.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        combinedJS += `\n// ========== ${filePath} ==========\n`;
        combinedJS += content;
        combinedJS += '\n';
    } else {
        console.warn(`Warning: ${filePath} not found`);
    }
});

// Write bundled output
fs.writeFileSync('artistTimeline.js', combinedJS);
console.log('✅ Build complete: artistTimeline.js');

// Watch mode
if (process.argv.includes('--watch')) {
    console.log('👀 Watching for changes...');
    ['modules', 'modules/options', 'modules/views', 'styles', 'src'].forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.watch(dir, { recursive: true }, (_, file) => {
                if (file?.endsWith('.js') || file?.endsWith('.css')) {
                    console.log(`📝 ${file} changed, rebuilding...`);
                    require('child_process').execSync('node build.js', { stdio: 'inherit' });
                }
            });
        }
    });
}