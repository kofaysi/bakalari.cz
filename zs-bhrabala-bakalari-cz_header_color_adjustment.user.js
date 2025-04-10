// ==UserScript==
// @name         Unique Header Color at zs-bhrabala.bakalari.cz
// @namespace    https://github.com/kofaysi/bakalari.cz/blob/main/zs-bhrabala-bakalari-cz_header_color_adjustment.user.js
// @version      0.5
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

    // 2. Get the text from the element
    const usernameText = usernameElement.textContent.trim();

    // Convert the string to a hash value
    function stringToHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    // Map the hash to an HSL color, focusing on the hue
    // with a fixed saturation/lightness
    function stringToHSL(str) {
        const hash = stringToHash(str);
        const hue = Math.abs(hash) % 360; // 0..359
        const saturation = 70;           // tweak as you wish
        const lightness = 50;            // tweak as you wish

        return { h: hue, s: saturation, l: lightness };
    }

    // Convert HSL to RGB
    // Adapts a common HSL-to-RGB formula
    function hslToRgb(h, s, l) {
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

        const r = Math.round((rPrime + m) * 255);
        const g = Math.round((gPrime + m) * 255);
        const b = Math.round((bPrime + m) * 255);
        return { r, g, b };
    }

    // Convert RGB to hex
    function rgbToHex(r, g, b) {
        const toHex = (val) => {
            const hex = val.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    // Luminance-based brightness check
    function getBrightness(r, g, b) {
        // 0.299*r + 0.587*g + 0.114*b is a common formula
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // Invert an RGB color
    function invertColor(r, g, b) {
        return { r: 255 - r, g: 255 - g, b: 255 - b };
    }

    // MAIN SCRIPT

    // 3. Get the HSL color from the username
    const { h, s, l } = stringToHSL(usernameText);

    // 4. Convert to RGB
    let { r, g, b } = hslToRgb(h, s, l);

    // 5. If it's too dark, invert
    if (getBrightness(r, g, b) < 128) {
        const inverted = invertColor(r, g, b);
        r = inverted.r;
        g = inverted.g;
        b = inverted.b;
    }

    // 6. Convert to final hex color
    const finalColor = rgbToHex(r, g, b);

    // 7. Apply to #topheader
    const topHeader = document.querySelector('#topheader');
    if (topHeader) {
        topHeader.style.backgroundColor = finalColor;
    }

    // 8. Apply to .navbar.bk-navtop
    const navbarTop = document.querySelector('.navbar.bk-navtop');
    if (navbarTop) {
        navbarTop.style.backgroundColor = finalColor;
    }
})();
