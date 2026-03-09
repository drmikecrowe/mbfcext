# Build Instructions

## Requirements

- Node.js 24 or later (v24.0.0+ required)
- pnpm 10.x

## Setup

```sh
npm install -g pnpm
pnpm install
```

## Building

Build and package for **Firefox** (Mozilla Add-ons submission):

```sh
pnpm package:firefox
# Output: build/firefox-mv3-prod.zip
```

Build and package for **Chrome** (Chrome Web Store submission):

```sh
pnpm package:chrome
# Output: build/chrome-mv3-prod.zip
```

Build both targets at once:

```sh
pnpm package:all
```

## Tools Used

This extension uses the following build tools (required disclosure for Mozilla review):

- **Plasmo** — browser extension framework (bundles and packages the extension)
- **Parcel** — bundler (combines multiple source files into single output files)
- **TypeScript** — compiled to JavaScript
- **React/JSX** — transformed via SWC
- **Tailwind CSS + PostCSS** — CSS processed at build time
- **Parcel minifier** — output JS is minified

## Usage Testing

- Install the unpacked extension from `build/firefox-mv3-prod/` or `build/chrome-mv3-prod/`
- In Settings, make sure "Left", "Right" etc are checked to "Collapse"
- Navigate to https://www.facebook.com/msnbc or https://cnn.com (for example) and you can see these sites collapsed in Facebook, or the icon flashing on the actual website

## Source Code

Located here: https://github.com/drmikecrowe/mbfcext
