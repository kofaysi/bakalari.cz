// ==UserScript==
// @name         Unique Header Color at zs-bhrabala.bakalari.cz
// @namespace    https://github.com/kofaysi/bakalari.cz/blob/main/zs-bhrabala-bakalari-cz_header_color_adjustment.user.js
// @version      0.4
// @description  Sets a unique color on #topheader based on the .lusername text, flips if too dark
// @match        https://zs-bhrabala.bakalari.cz/*
// @author       https://github.com/kofaysi
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. Grab the element with the lusername class
    const usernameElement = document.querySelector('.lusername');
    if (!usernameElement) return;

    // Get the text from the element
    const usernameText = usernameElement.textContent.trim();

    // 2. Convert the string to a hash value
    function stringToHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    // 3. Convert the hash to HSL color (focus on H)
    //    We'll use a single hue (0-359), with fixed saturation & lightness
    function stringToHSL(str) {
        const hash = stringToHash(str);
        // Hue in [0..359]
        const hue = Math.abs(hash) % 360; 
        const saturation = 70; // can be tweaked
        const lightness = 50;  // can be tweaked

        return { h: hue, s: saturation, l: lightness };
    }

    // Convert HSL to RGB (returns {r, g, b})
    // Formula adapted from common HSL-to-RGB conversions
    function hslToRgb(h, s, l) {
        // Convert percentages to [0..1]
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;

        let rPrime = 0, gPrime = 0, bPrime = 0;

        if (0 <= h && h < 60) {
            rPrime = c; gPrime = x; bPrime = 0;
        } else if (60 <= h && h < 120) {
            rPrime = x; gPrime = c; bPrime = 0;
        } else if (120 <= h && h < 180) {
            rPrime = 0; gPrime = c; bPrime = x;
        } else if (180 <= h && h < 240) {
            rPrime = 0; gPrime = x; bPrime = c;
        } else if (240 <= h && h < 300) {
            rPrime = x; gPrime = 0; bPrime = c;
        } else {
            rPrime = c; gPrime = 0; bPrime = x;
        }

        return {
            r: Math.round((rPrime + m) * 255),
            g: Math.round((gPrime + m) * 255),
            b: Math.round((bPrime + m) * 255)
        };
    }

    // Convert RGB to hex format
    function rgbToHex(r, g, b) {
        const toHex = (val) => {
            const hex = val.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    // Calculate brightness (0..255) for a color (r,g,b)
    function getBrightness(r, g, b) {
        // weighted formula for luminance
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // Invert the RGB color
    function invertColor(r, g, b) {
        return {
            r: 255 - r,
            g: 255 - g,
            b: 255 - b
        };
    }

    // ---- MAIN LOGIC ----

    // 4. Get the color from username
    const hslColor = stringToHSL(usernameText);

    // 5. Convert HSL -> RGB
    let { r, g, b } = hslToRgb(hslColor.h, hslColor.s, hslColor.l);

    // 6. Check if it’s "dark" (tweak threshold if you like)
    if (getBrightness(r, g, b) < 128) {
        // invert if too dark
        const inverted = invertColor(r, g, b);
        r = inverted.r;
        g = inverted.g;
        b = inverted.b;
    }

    // 7. Convert final color to hex
    const finalColor = rgbToHex(r, g, b);

    // 8. Apply the color to #topheader
    const topHeader = document.querySelector('#topheader');
    if (topHeader) {
        topHeader.style.backgroundColor = finalColor;
    }
})();
