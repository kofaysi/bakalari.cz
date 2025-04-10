// ==UserScript==
// @name         Unique Header Color at zs-bhrabala.bakalari.cz
// @namespace    https://github.com/kofaysi/bakalari.cz/blob/main/zs-bhrabala-bakalari-cz_header_color_adjustment.user.js
// @version      0.3
// @description  Sets a unique color on #topheader based on the .lusername text, flips if too dark
// @match        https://zs-bhrabala.bakalari.cz/*
// @author       https://github.com/kofaysi
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Grab the element with the lusername class
    const usernameElement = document.querySelector('.lusername');
    if (!usernameElement) return;

    // Get the text from the element, trim whitespace
    const usernameText = usernameElement.textContent.trim();

    // Simple function to generate a consistent color from any string
    function stringToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            // Create a hash value from character codes
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Build the color in the form #RRGGBB
        let color = '#';
        for (let i = 0; i < 3; i++) {
            // Shift bits and mask for 8-bit
            const value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).slice(-2);
        }
        return color;
    }

    // Convert username to a unique color
    let uniqueColor = stringToColor(usernameText);

    // Convert hex color (#RRGGBB) to RGB values
    function hexToRgb(hex) {
        const cleanHex = hex.replace('#', '');
        // parse R, G, B from the hex string
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return { r, g, b };
    }

    // Convert R, G, B back to hex color
    function rgbToHex(r, g, b) {
        const toHex = (val) => {
            const hex = val.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    // Calculate brightness using a common formula
    // For a color (r, g, b), brightness is approximately 0.299*r + 0.587*g + 0.114*b
    // We compare it to a threshold (e.g. 128) to decide if it's "dark"
    function isDarkColor(r, g, b) {
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        // Adjust the threshold to your preference (0 to 255)
        return brightness < 128;
    }

    // Invert the color
    function invertColor(r, g, b) {
        return {
            r: 255 - r,
            g: 255 - g,
            b: 255 - b
        };
    }

    const { r, g, b } = hexToRgb(uniqueColor);

    // If the color is dark, invert it
    if (isDarkColor(r, g, b)) {
        const inverted = invertColor(r, g, b);
        uniqueColor = rgbToHex(inverted.r, inverted.g, inverted.b);
    }

    // Find #topheader and apply the generated color
    const topHeader = document.querySelector('#topheader');
    if (topHeader) {
        topHeader.style.backgroundColor = uniqueColor;
    }
})();

