# Project Hub - Chrome Extension

This folder contains the Chrome Extension version of Project Hub. The extension shares the same codebase as the web app but is packaged for use in Chrome as both a side panel and full-page extension.

## Features

- **Side Panel Mode**: Opens in Chrome's side panel for quick access while browsing
- **Full Page Mode**: Opens in a full browser tab for extended use
- **Shared Codebase**: Uses the same React app as the web version
- **Offline Support**: All assets are bundled with the extension

## Prerequisites

- Node.js and npm installed
- Chrome browser (version 114+ recommended for side panel support)

## Building the Extension

### Step 1: Install Dependencies

```bash
# From the project root
npm install
```

### Step 2: Build the Web App

```bash
npm run build
```

This creates the `dist/` folder with the production build.

### Step 3: Build the Extension

```bash
npm run build:extension
```

This command:
1. Takes the production build from `dist/`
2. Adds extension-specific files (manifest, background worker, HTML pages)
3. Outputs everything to `dist-extension/`

**Note**: You'll need to add this script to your `package.json`:

```json
{
  "scripts": {
    "build:extension": "node chrome-extension/build-extension.js"
  }
}
```

And install the required dependency:

```bash
npm install --save-dev fs-extra glob
```

## Testing Locally

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `dist-extension/` folder
5. The extension should now appear in your extensions list

### Testing Side Panel

1. Click the extension icon in the Chrome toolbar
2. The side panel should open on the right side of the browser
3. If side panel is not supported, it will fallback to opening in a new tab

### Testing Full Page

1. Right-click the extension icon
2. Select "Open in Full Page" from the context menu
3. Or click the extension icon and select the full page option

## Icons

The extension requires icons in the following sizes:
- 16x16 pixels (toolbar icon)
- 32x32 pixels (Windows computers)
- 48x48 pixels (extensions page)
- 128x128 pixels (Chrome Web Store)

Place your icons in `chrome-extension/icons/` with these filenames:
- `icon16.png`
- `icon32.png`
- `icon48.png`
- `icon128.png`

If icons are missing, the extension will still work but will use Chrome's default icon.

## Publishing to Chrome Web Store

### Preparation

1. Create a ZIP file of the `dist-extension/` folder:
   ```bash
   cd dist-extension
   zip -r ../project-hub-extension.zip .
   cd ..
   ```

2. Ensure you have:
   - All required icons (16, 32, 48, 128)
   - A privacy policy URL (if collecting user data)
   - Screenshots for the store listing
   - A detailed description

### Upload Process

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Pay the one-time $5 developer registration fee (if not already paid)
3. Click **New Item**
4. Upload your `project-hub-extension.zip` file
5. Fill in the required information:
   - Detailed description
   - Screenshots (1280x800 or 640x400)
   - Category
   - Privacy policy URL
   - Support URL
6. Submit for review

### Review Process

- Initial review: 1-3 days typically
- Updates: Usually faster, within 1 day
- You'll receive email notifications about review status

## Updating the Extension

To release an update:

1. Update the `version` in `chrome-extension/manifest.json`
2. Rebuild: `npm run build && npm run build:extension`
3. Create a new ZIP file
4. Upload to Chrome Web Store as an update

## Architecture Notes

### Routing

The extension uses **hash-based routing** (`HashRouter`) instead of browser routing to avoid conflicts with Chrome's extension URL scheme.

The app automatically detects it's running in extension mode via the `window.__EXTENSION__` flag and switches routers accordingly.

### Storage

When running as an extension, the app can use either:
- `localStorage` (same as web version)
- `chrome.storage.local` (syncs across devices if user is signed into Chrome)

### Authentication & Supabase

The extension maintains the same Supabase connection as the web app:
- Authentication works identically
- Database queries function the same
- Real-time subscriptions are supported

### Environment Variables

The extension inherits the same environment variables from the web build:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Troubleshooting

### Extension doesn't load
- Check that `manifest.json` is valid (use a JSON validator)
- Ensure all file paths in manifest exist
- Check Chrome DevTools for errors: Extensions page → Details → Inspect views → background page

### Side panel not working
- Side panel requires Chrome 114+
- Check if `chrome.sidePanel` is available in the console
- Extension will fallback to full page mode if unavailable

### Authentication issues
- Ensure Supabase credentials are correctly set in the build
- Check that redirect URLs in Supabase allow extension URLs
- Extension origin: `chrome-extension://[extension-id]`

### Assets not loading
- Verify `web_accessible_resources` in manifest.json
- Check that asset paths are relative, not absolute
- Inspect Network tab in DevTools for 404 errors

## Security & Privacy

### Permissions

The extension requests these permissions:
- `storage`: To save user preferences and cache data
- `sidePanel`: To use the side panel feature
- `tabs`: To open full page mode when requested
- `<all_urls>`: To allow the extension to work on any page (only if needed)

### Data Handling

- User data is stored in Supabase (same as web app)
- No data is sent to third parties except Supabase
- No tracking or analytics by default
- All communication uses HTTPS

### Privacy Policy

If you collect any user data, you MUST provide a privacy policy URL in:
1. `chrome-extension/manifest.json` (optional but recommended)
2. Chrome Web Store listing (required)

## Development Workflow

### Making Changes

1. Edit source files in `src/` (same as web app)
2. Test changes in web mode: `npm run dev`
3. Build and test in extension mode:
   ```bash
   npm run build
   npm run build:extension
   ```
4. Reload extension in `chrome://extensions/`

### Debugging

- **Background Worker**: `chrome://extensions/` → Extension details → Inspect views → background page
- **Side Panel**: Right-click in side panel → Inspect
- **Full Page**: Standard Chrome DevTools (F12)

### Hot Reload

For development, you can use a tool like `chrome-extension-reloader` to auto-reload the extension when files change. However, you'll still need to rebuild after each change.

## Known Limitations

1. **OAuth Redirects**: Some OAuth flows may need adjustment for extension URLs
2. **Local Storage Limits**: Extensions have storage quotas (usually 10MB for `chrome.storage.local`)
3. **CORS**: Some APIs may block requests from extension origins
4. **Service Worker Lifecycle**: Background service worker can be terminated by Chrome; design accordingly

## Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Web Store Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Side Panel API](https://developer.chrome.com/docs/extensions/reference/sidePanel/)

## Support

For issues specific to the extension build:
1. Check this README
2. Review Chrome DevTools console for errors
3. Check the Issues tab on GitHub

For app functionality issues:
- These are shared with the web app
- Report in the main project repository
