// ==UserScript==
// @name         Timetable Time Adjustment at zs-bhrabala.bakalari.cz
// @namespace    https://github.com/kofaysi/bakalari.cz
// @version      1.0
// @description  Shift timetable times earlier by 15m (before 10:00) or 10m (10:00+)
// @match        https://zs-bhrabala.bakalari.cz/next/rozvrh.aspx
// @author       https://github.com/kofaysi
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /** Parses a "HH:MM" string into total minutes from midnight */
    function parseTime(timeStr) {
        const [hh, mm] = timeStr.split(':').map(Number);
        return hh * 60 + mm;
    }

    /** Formats total minutes back into a "HH:MM" string */
    function formatTime(totalMins) {
        // Keep times from going negative; adjust logic if needed
        if (totalMins < 0) totalMins = 0;

        const hh = Math.floor(totalMins / 60);
        const mm = totalMins % 60;
        // Return in HH:MM format with zero padding if needed
        return `${hh}:${mm < 10 ? '0' + mm : mm}`;
    }

    // 1) Check whether the user belongs to a class 1.x, 2.x, 3.x, or 4.x
    const userSpan = document.querySelector('.bk-menu-user .lusername');
    if (!userSpan) return;

    const userText = userSpan.textContent.trim();
    // Simple regex: starts with 1. / 2. / 3. / 4. (then any letter or digit)
    // e.g.: "1.A", "2.C," "4.D," etc.
    // Adjust if your classes have different patterns.
    const classRegex = /^[1-4]\.\s*[A-Za-z0-9]/;
    if (!classRegex.test(userText)) {
        // Not a class we want to modify -> do nothing
        return;
    }

    // 2) Collect all “from” and “to” times in the timetable
    document.querySelectorAll('#hours .item .hour').forEach(hourDiv => {
        const fromSpan = hourDiv.querySelector('.from');
        const toSpan   = hourDiv.querySelector('.to');
        if (!fromSpan || !toSpan) return;

        const fromMinutes = parseTime(fromSpan.textContent);
        const toMinutes   = parseTime(toSpan.textContent);

        // 3) Subtract 15 minutes if before 10:00, else 10 minutes
        // 10:00 is 600 minutes after midnight
        const fromShift = fromMinutes < 600 ? 15 : 10;
        const toShift   = toMinutes   < 600 ? 15 : 10;

        const newFrom = fromMinutes - fromShift;
        const newTo   = toMinutes   - toShift;

        // 4) Rewrite the displayed times
        fromSpan.textContent = formatTime(newFrom);
        toSpan.textContent   = formatTime(newTo);
    });

})();
