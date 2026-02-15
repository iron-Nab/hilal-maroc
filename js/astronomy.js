// ============================================================
// astronomy.js - Fondations astronomiques
// Dates juliennes, coordonnées, temps sidéral, trigonométrie
// Basé sur Jean Meeus "Astronomical Algorithms"
// ============================================================

var Astro = (function () {
    var DEG2RAD = Math.PI / 180;
    var RAD2DEG = 180 / Math.PI;

    // --- Trigonometric helpers (degrees) ---
    function sind(d) { return Math.sin(d * DEG2RAD); }
    function cosd(d) { return Math.cos(d * DEG2RAD); }
    function tand(d) { return Math.tan(d * DEG2RAD); }
    function asind(x) { return Math.asin(x) * RAD2DEG; }
    function acosd(x) { return Math.acos(Math.max(-1, Math.min(1, x))) * RAD2DEG; }
    function atan2d(y, x) { return Math.atan2(y, x) * RAD2DEG; }

    // --- Angle normalization ---
    function normalize360(angle) {
        angle = angle % 360;
        return angle < 0 ? angle + 360 : angle;
    }

    function normalize180(angle) {
        angle = normalize360(angle);
        return angle > 180 ? angle - 360 : angle;
    }

    // --- Julian Date (Meeus Ch.7) ---
    // year, month, day can include fractional day
    function dateToJD(year, month, day) {
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        var A = Math.floor(year / 100);
        var B = 2 - A + Math.floor(A / 4);
        return Math.floor(365.25 * (year + 4716)) +
               Math.floor(30.6001 * (month + 1)) +
               day + B - 1524.5;
    }

    // Convert Date object to JD
    function dateObjToJD(date) {
        var day = date.getUTCDate() +
                  date.getUTCHours() / 24 +
                  date.getUTCMinutes() / 1440 +
                  date.getUTCSeconds() / 86400;
        return dateToJD(date.getUTCFullYear(), date.getUTCMonth() + 1, day);
    }

    // Convert JD back to calendar date
    function jdToDate(jd) {
        jd += 0.5;
        var Z = Math.floor(jd);
        var F = jd - Z;
        var A;
        if (Z < 2299161) {
            A = Z;
        } else {
            var alpha = Math.floor((Z - 1867216.25) / 36524.25);
            A = Z + 1 + alpha - Math.floor(alpha / 4);
        }
        var B = A + 1524;
        var C = Math.floor((B - 122.1) / 365.25);
        var D = Math.floor(365.25 * C);
        var E = Math.floor((B - D) / 30.6001);

        var day = B - D - Math.floor(30.6001 * E) + F;
        var month = E < 14 ? E - 1 : E - 13;
        var year = month > 2 ? C - 4716 : C - 4715;

        var wholeDay = Math.floor(day);
        var frac = day - wholeDay;
        var hours = Math.floor(frac * 24);
        var minutes = Math.floor((frac * 24 - hours) * 60);
        var seconds = Math.round(((frac * 24 - hours) * 60 - minutes) * 60);

        if (seconds >= 60) { minutes++; seconds -= 60; }
        if (minutes >= 60) { hours++; minutes -= 60; }

        return {
            year: year,
            month: month,
            day: wholeDay,
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
    }

    // JD to JavaScript Date object (UTC)
    function jdToDateObj(jd) {
        var d = jdToDate(jd);
        return new Date(Date.UTC(d.year, d.month - 1, d.day, d.hours, d.minutes, d.seconds));
    }

    // Day number from epoch 1999 Dec 31.0 UT (stjarnhimlen.se convention)
    function dayNumber(year, month, day, ut) {
        ut = ut || 0;
        return dateToJD(year, month, day + ut / 24) - 2451543.5;
    }

    function dayNumberFromJD(jd) {
        return jd - 2451543.5;
    }

    // --- Julian Centuries from J2000.0 ---
    function julianCenturies(jd) {
        return (jd - 2451545.0) / 36525.0;
    }

    // --- Obliquity of the Ecliptic ---
    function obliquity(d) {
        return 23.4393 - 3.563e-7 * d;
    }

    // More precise obliquity (Meeus Ch.22)
    function obliquityMeeus(T) {
        return 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;
    }

    // --- Sidereal Time ---
    // Greenwich Mean Sidereal Time at 0h UT (degrees)
    function gmst0(d) {
        // Ls = sun's mean longitude
        var Ls = normalize360(282.9404 + 4.70935e-5 * d + 356.0470 + 0.9856002585 * d);
        return normalize360(Ls + 180);
    }

    // Local Sidereal Time (degrees)
    function localSiderealTime(d, ut, longitude) {
        return normalize360(gmst0(d) + 360.98564736629 * ut / 24 + longitude);
    }

    // --- Coordinate Transforms ---
    // Ecliptic to Equatorial
    function eclipticToEquatorial(lonEcl, latEcl, obliq) {
        var ra = atan2d(
            sind(lonEcl) * cosd(obliq) - tand(latEcl) * sind(obliq),
            cosd(lonEcl)
        );
        var dec = asind(
            sind(latEcl) * cosd(obliq) + cosd(latEcl) * sind(obliq) * sind(lonEcl)
        );
        return { ra: normalize360(ra), dec: dec };
    }

    // Equatorial to Horizontal
    function equatorialToHorizontal(ra, dec, lat, lst) {
        var ha = normalize360(lst - ra);
        var alt = asind(sind(lat) * sind(dec) + cosd(lat) * cosd(dec) * cosd(ha));
        var az = atan2d(
            sind(ha),
            cosd(ha) * sind(lat) - tand(dec) * cosd(lat)
        );
        az = normalize360(az + 180); // Measure from North
        return { altitude: alt, azimuth: az };
    }

    // --- Atmospheric Refraction ---
    function atmosphericRefraction(altDeg) {
        if (altDeg < -1) return 0;
        if (altDeg < -0.575) {
            return -20.774 / tand(altDeg) / 60;
        }
        return (1.02 / tand(altDeg + 10.3 / (altDeg + 5.11))) / 60;
    }

    // --- DeltaT approximation (TT - UT in seconds) ---
    function deltaT(year) {
        // Polynomial approximation for 2005-2050
        var t = year - 2000;
        if (year >= 2005 && year <= 2050) {
            return 62.92 + 0.32217 * t + 0.005589 * t * t;
        }
        // Rough approximation for other years
        return 69 + 0.3 * (year - 2020);
    }

    // --- Public API ---
    return {
        DEG2RAD: DEG2RAD,
        RAD2DEG: RAD2DEG,
        sind: sind,
        cosd: cosd,
        tand: tand,
        asind: asind,
        acosd: acosd,
        atan2d: atan2d,
        normalize360: normalize360,
        normalize180: normalize180,
        dateToJD: dateToJD,
        dateObjToJD: dateObjToJD,
        jdToDate: jdToDate,
        jdToDateObj: jdToDateObj,
        dayNumber: dayNumber,
        dayNumberFromJD: dayNumberFromJD,
        julianCenturies: julianCenturies,
        obliquity: obliquity,
        obliquityMeeus: obliquityMeeus,
        gmst0: gmst0,
        localSiderealTime: localSiderealTime,
        eclipticToEquatorial: eclipticToEquatorial,
        equatorialToHorizontal: equatorialToHorizontal,
        atmosphericRefraction: atmosphericRefraction,
        deltaT: deltaT
    };
})();
