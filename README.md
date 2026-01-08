# Location Spoofer

A simple Electron app that spoofs your browser's geolocation for testing and development purposes.

## Features

- 📍 **Spoof GPS Coordinates** - Enter any latitude/longitude to fake your location
- 🌐 **Built-in Browser** - Browse any website with spoofed location
- 🎯 **Quick Presets** - One-click to set location to popular cities
- 🎨 **Modern Dark UI** - Clean, beautiful interface

## Screenshot

![Location Spoofer App](screenshot.png)

## Installation

```bash
# Clone the repository
git clone https://github.com/yeshaswi3060/fake-punching-system.git
cd fake-punching-system

# Install dependencies
npm install

# Run the app
npm start
```

## Building Executable

```bash
# Build portable .exe
npm run build

# Build installer
npm run build:installer
```

## Usage

1. Enter latitude and longitude coordinates
2. Click "Change Location"
3. Navigate to any website that uses geolocation (e.g., Google Maps)
4. The website will detect your fake location!

## How It Works

This app uses Electron's Chrome DevTools Protocol (CDP) to override the browser's geolocation. The `Emulation.setGeolocationOverride` command is used to set custom coordinates.

## Tech Stack

- Electron 28
- Chrome DevTools Protocol
- Vanilla JS/CSS

## License

MIT
