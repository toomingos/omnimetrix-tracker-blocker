# Omnimetrix Tracker Blocker

A simple Chrome extension that blocks the Omnimetrix analytics tracker on specified domains.

## How it works

The extension leverages Omnimetrix's built-in disable mechanism by setting `localStorage.setItem('disable_omnimetrix', 'true')` on domains where you want to block tracking.

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon in your toolbar
2. Toggle "Block on this domain" to enable/disable tracking on the current site
3. Add additional domains using the input field (supports wildcards like `*.example.com`)
4. Manage your blocked domains list from the popup

## Features

- ✅ Simple one-click blocking for current domain
- ✅ Wildcard domain support (`*.example.com`)
- ✅ Persistent domain list across browser sessions
- ✅ Clean, minimal interface
- ✅ No unnecessary permissions or network blocking

## Files

- `manifest.json` - Extension configuration
- `content.js` - Content script that sets localStorage flag
- `popup.html` - Extension popup interface  
- `popup.js` - Popup functionality
- `README.md` - This file

## Privacy

This extension only stores your blocked domains list locally in Chrome's sync storage. No data is sent to external servers.

## License

MIT License