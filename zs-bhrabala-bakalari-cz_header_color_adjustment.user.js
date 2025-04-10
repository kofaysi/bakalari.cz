// ==UserScript==
// @name         Unique Header Color
// @namespace    https://github.com/kofaysi/bakalari.cz/blob/main/zs-bhrabala-bakalari-cz_header_color_adjustment.user.js
// @version      0.1
// @description  Sets a unique color on #topheader based on the .lusername text
// @match        https://zs-bhrabala.bakalari.cz/dashboard
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
            // Shift bits and mask for 8-bit hex
            const value = (hash >> (i * 8)) & 0xFF;
            // Format the final two hex digits
            color += ('00' + value.toString(16)).slice(-2);
        }
        return color;
    }

    // Convert the username to a unique color
    const uniqueColor = stringToColor(usernameText);

    // Find #topheader and apply our newly generated color
    const topHeader = document.querySelector('#topheader');
    if (topHeader) {
        topHeader.style.backgroundColor = uniqueColor;
    }
})();
