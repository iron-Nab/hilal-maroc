// ============================================================
// sun.js - Position du soleil et calcul du coucher de soleil
// Algorithme simplifié (stjarnhimlen.se) + raffinement itératif
// ============================================================

var Sun = (function () {

    // Sun orbital elements for day number d
    function orbitalElements(d) {
        return {
            w: 282.9404 + 4.70935e-5 * d,          // argument of perihelion
            e: 0.016709 - 1.151e-9 * d,              // eccentricity
            M: Astro.normalize360(356.0470 + 0.9856002585 * d) // mean anomaly
        };
    }

    // Compute sun position (ecliptic longitude, RA, Dec, distance)
    function position(d) {
        var el = orbitalElements(d);
        var M = el.M;
        var e = el.e;
        var w = el.w;

        // Eccentric anomaly (first approximation)
        var E = M + Astro.RAD2DEG * e * Astro.sind(M) * (1 + e * Astro.cosd(M));

        // Rectangular coordinates in orbital plane
        var xv = Astro.cosd(E) - e;
        var yv = Math.sqrt(1 - e * e) * Astro.sind(E);

        // True anomaly and distance
        var v = Astro.atan2d(yv, xv);
        var r = Math.sqrt(xv * xv + yv * yv);

        // Sun's ecliptic longitude
        var lon = Astro.normalize360(v + w);

        // Obliquity
        var ecl = Astro.obliquity(d);

        // Equatorial coordinates
        var xs = r * Astro.cosd(lon);
        var ys = r * Astro.sind(lon);

        var xe = xs;
        var ye = ys * Astro.cosd(ecl);
        var ze = ys * Astro.sind(ecl);

        var ra = Astro.normalize360(Astro.atan2d(ye, xe));
        var dec = Astro.asind(ze / Math.sqrt(xe * xe + ye * ye + ze * ze));

        return {
            ra: ra,
            dec: dec,
            lon: lon,
            distance: r,
            meanLon: Astro.normalize360(M + w)
        };
    }

    // Sun altitude and azimuth at given time for observer
    function altAz(year, month, day, ut, lat, lon) {
        var d = Astro.dayNumber(year, month, day, ut);
        var pos = position(d);
        var lst = Astro.localSiderealTime(d, ut, lon);
        var horiz = Astro.equatorialToHorizontal(pos.ra, pos.dec, lat, lst);
        return {
            altitude: horiz.altitude,
            azimuth: horiz.azimuth,
            ra: pos.ra,
            dec: pos.dec
        };
    }

    // Compute sunset time (UT hours) for a given date and location
    // Sunset = sun center at -0.833 deg (refraction + semi-diameter)
    function computeSunset(year, month, day, lat, lon) {
        var h0 = -0.833; // degrees below horizon

        // Initial estimate at 18h UT
        var ut = 18 - lon / 15; // rough estimate
        if (ut < 0) ut += 24;
        if (ut > 24) ut -= 24;

        // Iterate 5 times for convergence
        for (var i = 0; i < 5; i++) {
            var d = Astro.dayNumber(year, month, day, ut);
            var pos = position(d);
            var lst = Astro.localSiderealTime(d, ut, lon);

            // Hour angle at sunset
            var cosH = (Astro.sind(h0) - Astro.sind(lat) * Astro.sind(pos.dec)) /
                       (Astro.cosd(lat) * Astro.cosd(pos.dec));

            if (cosH > 1) return null;  // sun never sets (polar)
            if (cosH < -1) return null; // sun never rises (polar)

            var H = Astro.acosd(cosH); // hour angle in degrees (positive = west)

            // Time of sunset
            var ha = Astro.normalize360(lst - pos.ra);
            if (ha > 180) ha -= 360;

            // Correction: how far are we from H degrees
            var correction = (H - ha) / 360 * 24 / 1.0027379;
            ut += correction;

            if (ut < 0) ut += 24;
            if (ut > 48) ut -= 24;
        }

        return ut;
    }

    // Compute sunrise time (UT hours)
    function computeSunrise(year, month, day, lat, lon) {
        var h0 = -0.833;
        var ut = 6 - lon / 15;
        if (ut < 0) ut += 24;
        if (ut > 24) ut -= 24;

        for (var i = 0; i < 5; i++) {
            var d = Astro.dayNumber(year, month, day, ut);
            var pos = position(d);
            var lst = Astro.localSiderealTime(d, ut, lon);

            var cosH = (Astro.sind(h0) - Astro.sind(lat) * Astro.sind(pos.dec)) /
                       (Astro.cosd(lat) * Astro.cosd(pos.dec));

            if (cosH > 1 || cosH < -1) return null;

            var H = -Astro.acosd(cosH); // negative for sunrise (east)

            var ha = Astro.normalize360(lst - pos.ra);
            if (ha > 180) ha -= 360;

            var correction = (H - ha) / 360 * 24 / 1.0027379;
            ut += correction;

            if (ut < 0) ut += 24;
            if (ut > 48) ut -= 24;
        }

        return ut;
    }

    return {
        position: position,
        altAz: altAz,
        computeSunset: computeSunset,
        computeSunrise: computeSunrise
    };
})();
