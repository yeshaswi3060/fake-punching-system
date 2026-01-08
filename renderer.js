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

// Change Location Handler
changeLocationBtn.addEventListener('click', async () => {
    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);

    // Validate inputs
    if (isNaN(latitude) || isNaN(longitude)) {
        showStatus('Please enter valid coordinates', false);
        return;
    }

    if (latitude < -90 || latitude > 90) {
        showStatus('Latitude must be between -90 and 90', false);
        return;
    }

    if (longitude < -180 || longitude > 180) {
        showStatus('Longitude must be between -180 and 180', false);
        return;
    }

    // Update button state
    changeLocationBtn.disabled = true;
    changeLocationBtn.innerHTML = '<span class="btn-icon">⏳</span> Setting...';

    try {
        const result = await window.locationAPI.setLocation(latitude, longitude);

        if (result.success) {
            showStatus(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, true);

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
    changeLocationBtn.innerHTML = '<span class="btn-icon">🎯</span> Change Location';
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
});

browser.addEventListener('did-navigate-in-page', (e) => {
    if (e.isMainFrame) {
        urlInput.value = e.url;
    }
});

// Load saved location on startup
window.addEventListener('DOMContentLoaded', async () => {
    const currentLocation = await window.locationAPI.getCurrentLocation();

    if (currentLocation.latitude !== 0 || currentLocation.longitude !== 0) {
        latitudeInput.value = currentLocation.latitude;
        longitudeInput.value = currentLocation.longitude;
        showStatus(`Location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`, true);
    }
});
