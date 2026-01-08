// DOM Elements
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const changeLocationBtn = document.getElementById('change-location');
const statusEl = document.getElementById('status');
const statusText = statusEl.querySelector('.status-text');
const urlInput = document.getElementById('url-input');
const goBtn = document.getElementById('go-btn');
const browser = document.getElementById('browser');
const presetBtns = document.querySelectorAll('.preset-btn');
const clickedCoordsEl = document.getElementById('clicked-coords');

// Change Location Handler
changeLocationBtn.addEventListener('click', async () => {
    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);

    // Validate inputs
    if (isNaN(latitude) || isNaN(longitude)) {
        showStatus('Enter valid coordinates', false);
        return;
    }

    if (latitude < -90 || latitude > 90) {
        showStatus('Latitude: -90 to 90', false);
        return;
    }

    if (longitude < -180 || longitude > 180) {
        showStatus('Longitude: -180 to 180', false);
        return;
    }

    // Update button state
    changeLocationBtn.disabled = true;
    changeLocationBtn.textContent = 'Setting...';

    try {
        const result = await window.locationAPI.setLocation(latitude, longitude);

        if (result.success) {
            showStatus(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, true);

            // Reload the webview to apply new location
            browser.reload();
        } else {
            showStatus('Failed to set location', false);
        }
    } catch (error) {
        console.error('Error setting location:', error);
        showStatus('Error setting location', false);
    }

    // Reset button
    changeLocationBtn.disabled = false;
    changeLocationBtn.textContent = 'Change Location';
});

// Show status message
function showStatus(message, isSuccess) {
    statusText.textContent = message;

    if (isSuccess) {
        statusEl.classList.add('active');
    } else {
        statusEl.classList.remove('active');
    }
}

// URL Navigation
goBtn.addEventListener('click', navigateToUrl);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') navigateToUrl();
});

function navigateToUrl() {
    let url = urlInput.value.trim();

    if (!url) return;

    // Add https if no protocol specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    browser.src = url;
}

// Preset buttons
presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        latitudeInput.value = btn.dataset.lat;
        longitudeInput.value = btn.dataset.lng;

        // Trigger the change location
        changeLocationBtn.click();
    });
});

// Update URL bar when webview navigates
browser.addEventListener('did-navigate', (e) => {
    urlInput.value = e.url;
    extractCoordsFromUrl(e.url);
});

browser.addEventListener('did-navigate-in-page', (e) => {
    if (e.isMainFrame) {
        urlInput.value = e.url;
        extractCoordsFromUrl(e.url);
    }
});

// Extract coordinates from Google Maps URL
function extractCoordsFromUrl(url) {
    try {
        // Google Maps URL patterns:
        // https://www.google.com/maps/@48.8584,2.2945,15z
        // https://www.google.com/maps/place/.../@48.8584,2.2945,15z

        const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (atMatch) {
            const lat = parseFloat(atMatch[1]);
            const lng = parseFloat(atMatch[2]);
            clickedCoordsEl.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

            // Also update input fields
            latitudeInput.value = lat.toFixed(6);
            longitudeInput.value = lng.toFixed(6);
            return;
        }

        // Try query param format: ?q=lat,lng
        const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (qMatch) {
            const lat = parseFloat(qMatch[1]);
            const lng = parseFloat(qMatch[2]);
            clickedCoordsEl.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            latitudeInput.value = lat.toFixed(6);
            longitudeInput.value = lng.toFixed(6);
            return;
        }
    } catch (e) {
        console.log('Could not extract coords from URL');
    }
}

// Load saved location on startup
window.addEventListener('DOMContentLoaded', async () => {
    const currentLocation = await window.locationAPI.getCurrentLocation();

    if (currentLocation.latitude !== 0 || currentLocation.longitude !== 0) {
        latitudeInput.value = currentLocation.latitude;
        longitudeInput.value = currentLocation.longitude;
        showStatus(`${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`, true);
    }
});
