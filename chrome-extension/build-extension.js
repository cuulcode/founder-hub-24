const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

const DIST_DIR = path.resolve(__dirname, '../dist');
const DIST_EXTENSION_DIR = path.resolve(__dirname, '../dist-extension');
const CHROME_EXT_DIR = path.resolve(__dirname);

async function buildExtension() {
  console.log('🔧 Building Chrome Extension...');
  
  // Clean dist-extension directory
  if (fs.existsSync(DIST_EXTENSION_DIR)) {
    console.log('🧹 Cleaning dist-extension directory...');
    await fs.remove(DIST_EXTENSION_DIR);
  }
  
  // Create dist-extension directory
  await fs.ensureDir(DIST_EXTENSION_DIR);
  
  // Check if webapp build exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  // Copy webapp build to dist-extension
  console.log('📦 Copying webapp build files...');
  await fs.copy(DIST_DIR, DIST_EXTENSION_DIR);
  
  // Copy manifest.json
  console.log('📄 Copying manifest.json...');
  await fs.copy(
    path.join(CHROME_EXT_DIR, 'manifest.json'),
    path.join(DIST_EXTENSION_DIR, 'manifest.json')
  );
  
  // Copy background.js
  console.log('🔧 Copying background.js...');
  await fs.copy(
    path.join(CHROME_EXT_DIR, 'background.js'),
    path.join(DIST_EXTENSION_DIR, 'background.js')
  );
  
  // Copy icons
  console.log('🎨 Copying icons...');
  const iconsDir = path.join(CHROME_EXT_DIR, 'icons');
  if (fs.existsSync(iconsDir)) {
    await fs.copy(iconsDir, path.join(DIST_EXTENSION_DIR, 'icons'));
  } else {
    console.warn('⚠️  Warning: icons/ directory not found. Using placeholder icons.');
    // Create placeholder icons
    await fs.ensureDir(path.join(DIST_EXTENSION_DIR, 'icons'));
  }
  
  // Read the built index.html to extract asset paths
  const indexHtmlPath = path.join(DIST_EXTENSION_DIR, 'index.html');
  let indexHtml = await fs.readFile(indexHtmlPath, 'utf8');
  
  // Update HTML files with proper asset references
  console.log('🔄 Creating extension HTML files...');
  
  // Create sidepanel.html
  const sidepanelHtml = await fs.readFile(path.join(CHROME_EXT_DIR, 'sidepanel.html'), 'utf8');
  const updatedSidepanelHtml = injectAssets(sidepanelHtml, indexHtml);
  await fs.writeFile(path.join(DIST_EXTENSION_DIR, 'sidepanel.html'), updatedSidepanelHtml);
  
  // Create fullpage.html
  const fullpageHtml = await fs.readFile(path.join(CHROME_EXT_DIR, 'fullpage.html'), 'utf8');
  const updatedFullpageHtml = injectAssets(fullpageHtml, indexHtml);
  await fs.writeFile(path.join(DIST_EXTENSION_DIR, 'fullpage.html'), updatedFullpageHtml);
  
  // Create options.html
  const optionsHtml = await fs.readFile(path.join(CHROME_EXT_DIR, 'options.html'), 'utf8');
  const updatedOptionsHtml = injectAssets(optionsHtml, indexHtml);
  await fs.writeFile(path.join(DIST_EXTENSION_DIR, 'options.html'), updatedOptionsHtml);
  
  // Remove the original index.html (not needed in extension)
  await fs.remove(indexHtmlPath);
  
  console.log('✅ Chrome Extension build complete!');
  console.log(`📂 Output directory: ${DIST_EXTENSION_DIR}`);
  console.log('\n📦 Next steps:');
  console.log('1. Navigate to chrome://extensions/');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked"');
  console.log(`4. Select the folder: ${DIST_EXTENSION_DIR}`);
  console.log('\n🚀 To publish:');
  console.log('1. Zip the dist-extension/ folder');
  console.log('2. Upload to Chrome Web Store Developer Dashboard');
}

function injectAssets(templateHtml, builtIndexHtml) {
  // Extract CSS links from built index.html
  const cssMatches = builtIndexHtml.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
  const cssLinks = cssMatches.join('\n    ');
  
  // Extract JS scripts from built index.html
  const scriptMatches = builtIndexHtml.match(/<script[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g) || [];
  const scripts = scriptMatches.join('\n    ');
  
  // Inject CSS before </head>
  let result = templateHtml.replace(
    '<!-- CSS will be injected by build script -->',
    cssLinks
  );
  
  // Inject JS before </body>
  result = result.replace(
    '<!-- JS will be injected by build script -->',
    scripts
  );
  
  return result;
}

// Run the build
buildExtension().catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
