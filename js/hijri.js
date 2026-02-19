// ============================================================
// hijri.js - Conversion Grégorien → Hijri
// Algorithme tabulaire (Kuwaiti)
// ============================================================

var Hijri = (function () {

    var monthNames = [
        { en: 'Muharram',        ar: 'محرّم' },
        { en: 'Safar',           ar: 'صفر' },
        { en: "Rabi' al-Awwal",  ar: 'ربيع الأول' },
        { en: "Rabi' al-Thani",  ar: 'ربيع الثاني' },
        { en: 'Jumada al-Ula',   ar: 'جمادى الأولى' },
        { en: 'Jumada al-Thani', ar: 'جمادى الثانية' },
        { en: 'Rajab',           ar: 'رجب' },
        { en: "Sha'ban",         ar: 'شعبان' },
        { en: 'Ramadan',         ar: 'رمضان' },
        { en: 'Shawwal',         ar: 'شوّال' },
        { en: "Dhul Qi'dah",     ar: 'ذو القعدة' },
        { en: 'Dhul Hijjah',     ar: 'ذو الحجة' }
    ];

    // Gregorian to Hijri conversion (Kuwaiti algorithm)
    function gregorianToHijri(year, month, day) {
        // Step 1: Gregorian to Julian Day Number
        var y = year;
        var m = month;
        if (m <= 2) { y--; m += 12; }
        var A = Math.floor(y / 100);
        var B = 2 - A + Math.floor(A / 4);
        var JD = Math.floor(365.25 * (y + 4716)) +
                 Math.floor(30.6001 * (m + 1)) +
                 day + B - 1524;

        // Step 2: Julian Day to Hijri
        // Offset 10631 (ajusté pour le calendrier marocain observé)
        var L = JD - 1948440 + 10631;
        var N = Math.floor((L - 1) / 10631);
        L = L - 10631 * N + 354;

        var J = Math.floor((10985 - L) / 5316) * Math.floor((50 * L) / 17719) +
                Math.floor(L / 5670) * Math.floor((43 * L) / 15238);

        L = L - Math.floor((30 - J) / 15) * Math.floor((17719 * J) / 50) -
            Math.floor(J / 16) * Math.floor((15238 * J) / 43) + 29;

        var hijriMonth = Math.floor((24 * L) / 709);
        var hijriDay = L - Math.floor((709 * hijriMonth) / 24);
        var hijriYear = 30 * N + J - 30;

        return {
            year: hijriYear,
            month: hijriMonth,
            day: hijriDay
        };
    }

    // Format Hijri date
    function format(hijri, lang) {
        lang = lang || 'en';
        var mIdx = hijri.month - 1;
        if (mIdx < 0 || mIdx > 11) mIdx = 0;

        var monthName = lang === 'ar' ? monthNames[mIdx].ar : monthNames[mIdx].en;
        return hijri.day + ' ' + monthName + ' ' + hijri.year + ' AH';
    }

    // Get month name
    function getMonthName(month, lang) {
        lang = lang || 'en';
        var idx = month - 1;
        if (idx < 0 || idx > 11) idx = 0;
        return lang === 'ar' ? monthNames[idx].ar : monthNames[idx].en;
    }

    // Get the approximate Hijri month for a new moon date
    // This helps label each prediction card with the right Hijri month
    function hijriMonthForNewMoon(newMoonDate) {
        // The new moon starts a new Hijri month
        // Add 2 days to get into the month (after Hilal sighting)
        var d = new Date(newMoonDate.getTime());
        d.setUTCDate(d.getUTCDate() + 2);
        return gregorianToHijri(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    }

    return {
        monthNames: monthNames,
        gregorianToHijri: gregorianToHijri,
        format: format,
        getMonthName: getMonthName,
        hijriMonthForNewMoon: hijriMonthForNewMoon
    };
})();
