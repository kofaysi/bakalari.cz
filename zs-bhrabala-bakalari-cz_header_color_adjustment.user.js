// ==UserScript==
// @name         Unique Header Color at zs-bhrabala.bakalari.cz
// @namespace    https://github.com/kofaysi/bakalari.cz/blob/main/zs-bhrabala-bakalari-cz_header_color_adjustment.user.js
// @version      0.6
// @description  Sets a unique color on #topheader based on the .lusername text, flips if too dark
// @match        https://zs-bhrabala.bakalari.cz/*
// @author       https://github.com/kofaysi
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1) Locate the element with class "lusername"
    const usernameElement = document.querySelector('.lusername');
    if (!usernameElement) return;

    // Grab its text content
    const usernameText = usernameElement.textContent.trim();

    // 2) Convert the string to a numerical hash
    //    (Simple 32-bit string hash)
    function stringToHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Force it into unsigned 32-bit
        return hash >>> 0;
    }

    // 3) We'll get the hex representation of the hash,
    //    then take the last 6 characters of that hex string.
    //    If it's shorter than 6, we left-pad with zeros.
    function getLast6HexChars(num) {
        let hex = num.toString(16);
        // Ensure at least 6 characters
        hex = hex.padStart(6, '0');
        // Take the last 6
        return hex.slice(-6);
    }

    // 4) Convert each hex digit to decimal, mod 4 => [0..3],
    //    then back to a hex digit => the "dark color" portion.
    function getDarkColorHex(modBaseHex) {
        let darkColor = '';
        for (let i = 0; i < modBaseHex.length; i++) {
            const digit = parseInt(modBaseHex[i], 16);  // 0..15
            const modVal = digit % 4;                  // 0..3
            darkColor += modVal.toString(16);          // '0'..'3'
        }
        return darkColor; // e.g. '102301' which is in [0..3] for each nibble
    }

    // 5) Subtract from #FFFFFF => invert to get the "light color"
    function invertDarkColor(darkHex) {
        // Convert our 6-digit hex to decimal
        const darkVal = parseInt(darkHex, 16);  // 0..0x333333
        // Invert: 0xFFFFFF - darkVal
        const lightVal = 0xFFFFFF - darkVal;
        // Convert back to 6-char hex
        let lightHex = lightVal.toString(16).padStart(6, '0');
        return '#' + lightHex;
    }

    // ---- Main Flow ----

    // a) Hash the username
    const hash = stringToHash(usernameText);

    // b) Get the last 6 hex digits (padded if needed)
    const last6Hex = getLast6HexChars(hash);

    // c) Map each digit -> mod 4 -> (0..3) => dark color
    const darkColorHex = getDarkColorHex(last6Hex); // e.g. '00132a' => '001122' (mod 4)

    // d) Invert the dark color => light color
    const finalColor = invertDarkColor(darkColorHex); // #FFFFFF - #00xxxx

    // e) Apply to #topheader
    const topHeader = document.querySelector('#topheader');
    if (topHeader) {
        topHeader.style.backgroundColor = finalColor;
    }

    // f) Apply to .navbar.bk-navtop
    const navTop = document.querySelector('.navbar.bk-navtop');
    if (navTop) {
        navTop.style.backgroundColor = finalColor;
    }
})();
