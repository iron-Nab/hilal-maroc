// ============================================================
// moon.js - Position de la lune avec perturbations et parallaxe
// Algorithme simplifié avec 12 termes longitude, 5 latitude
// Correction de parallaxe topocentric (critique pour le Hilal)
// ============================================================

var Moon = (function () {

    // Moon orbital elements for day number d
    function orbitalElements(d) {
        return {
            N: Astro.normalize360(125.1228 - 0.0529538083 * d), // longitude of ascending node
            i: 5.1454,                                           // inclination
            w: Astro.normalize360(318.0634 + 0.1643573223 * d), // argument of perigee
            a: 60.2666,                                          // semi-major axis (Earth radii)
            e: 0.054900,                                         // eccentricity
            M: Astro.normalize360(115.3654 + 13.0649929509 * d) // mean anomaly
        };
    }

    // Compute geocentric moon position
    function position(d) {
        var ml = orbitalElements(d);
        var sunEl = {
            w: 282.9404 + 4.70935e-5 * d,
            M: Astro.normalize360(356.0470 + 0.9856002585 * d)
        };

        // Solve Kepler's equation iteratively
        var E = ml.M + Astro.RAD2DEG * ml.e * Astro.sind(ml.M) * (1 + ml.e * Astro.cosd(ml.M));
        for (var iter = 0; iter < 10; iter++) {
            var dE = (E - Astro.RAD2DEG * ml.e * Astro.sind(E) - ml.M) /
                     (1 - ml.e * Astro.cosd(E));
            E -= dE;
            if (Math.abs(dE) < 0.0001) break;
        }

        // Rectangular coordinates in orbital plane
        var xv = ml.a * (Astro.cosd(E) - ml.e);
        var yv = ml.a * Math.sqrt(1 - ml.e * ml.e) * Astro.sind(E);

        // True anomaly and distance
        var v = Astro.atan2d(yv, xv);
        var r = Math.sqrt(xv * xv + yv * yv);

        // Ecliptic coordinates (geocentric)
        var vw = v + ml.w;
        var xh = r * (Astro.cosd(ml.N) * Astro.cosd(vw) - Astro.sind(ml.N) * Astro.sind(vw) * Astro.cosd(ml.i));
        var yh = r * (Astro.sind(ml.N) * Astro.cosd(vw) + Astro.cosd(ml.N) * Astro.sind(vw) * Astro.cosd(ml.i));
        var zh = r * Astro.sind(vw) * Astro.sind(ml.i);

        var lonEcl = Astro.normalize360(Astro.atan2d(yh, xh));
        var latEcl = Astro.asind(zh / Math.sqrt(xh * xh + yh * yh + zh * zh));

        // Perturbation corrections
        var Ls = Astro.normalize360(sunEl.M + sunEl.w);        // Sun's mean longitude
        var Lm = Astro.normalize360(ml.M + ml.w + ml.N);       // Moon's mean longitude
        var D = Astro.normalize360(Lm - Ls);                    // Mean elongation
        var F = Astro.normalize360(Lm - ml.N);                  // Argument of latitude

        var Ms = sunEl.M;
        var Mm = ml.M;

        // Longitude perturbations (degrees)
        lonEcl += -1.274 * Astro.sind(Mm - 2 * D)         // Evection
                  + 0.658 * Astro.sind(2 * D)              // Variation
                  - 0.186 * Astro.sind(Ms)                 // Yearly equation
                  - 0.059 * Astro.sind(2 * Mm - 2 * D)
                  - 0.057 * Astro.sind(Mm - 2 * D + Ms)
                  + 0.053 * Astro.sind(Mm + 2 * D)
                  + 0.046 * Astro.sind(2 * D - Ms)
                  + 0.041 * Astro.sind(Mm - Ms)
                  - 0.035 * Astro.sind(D)                  // Parallactic equation
                  - 0.031 * Astro.sind(Mm + Ms)
                  - 0.015 * Astro.sind(2 * F - 2 * D)
                  + 0.011 * Astro.sind(Mm - 4 * D);

        // Latitude perturbations (degrees)
        latEcl += -0.173 * Astro.sind(F - 2 * D)
                  - 0.055 * Astro.sind(Mm - F - 2 * D)
                  - 0.046 * Astro.sind(Mm + F - 2 * D)
                  + 0.033 * Astro.sind(F + 2 * D)
                  + 0.017 * Astro.sind(2 * Mm + F);

        // Distance perturbations (Earth radii)
        r += -0.58 * Astro.cosd(Mm - 2 * D)
             - 0.46 * Astro.cosd(2 * D);

        lonEcl = Astro.normalize360(lonEcl);

        // Horizontal parallax
        var parallax = Astro.asind(1 / r);

        // Semi-diameter
        var semiDiameter = 0.2725 * parallax;

        // Convert to equatorial
        var ecl = Astro.obliquity(d);
        var eq = Astro.eclipticToEquatorial(lonEcl, latEcl, ecl);

        return {
            ra: eq.ra,
            dec: eq.dec,
            lonEcl: lonEcl,
            latEcl: latEcl,
            distance: r,        // Earth radii
            parallax: parallax, // degrees
            semiDiameter: semiDiameter // degrees
        };
    }

    // Compute topocentric position (with parallax correction)
    function topocentricPosition(year, month, day, ut, lat, lon) {
        var d = Astro.dayNumber(year, month, day, ut);
        var pos = position(d);
        var lst = Astro.localSiderealTime(d, ut, lon);

        // Geocentric horizontal coordinates
        var geoHoriz = Astro.equatorialToHorizontal(pos.ra, pos.dec, lat, lst);

        // Topocentric parallax correction
        var mpar = pos.parallax; // horizontal parallax in degrees
        var gclat = lat - 0.1924 * Astro.sind(2 * lat); // geocentric latitude
        var rho = 0.99833 + 0.00167 * Astro.cosd(2 * lat); // distance from Earth center

        var ha = Astro.normalize360(lst - pos.ra);
        if (ha > 180) ha -= 360;

        // Topocentric RA and Dec corrections
        var dRA = -mpar * rho * Astro.cosd(gclat) * Astro.sind(ha) / Astro.cosd(pos.dec);
        var topRA = pos.ra + dRA;

        var g = Astro.atan2d(Astro.tand(gclat), Astro.cosd(ha));
        var topDec = pos.dec - mpar * rho * Astro.sind(gclat) * Astro.sind(g - pos.dec) / Astro.sind(g);

        // Recompute horizontal from topocentric equatorial
        var topHoriz = Astro.equatorialToHorizontal(topRA, topDec, lat, lst);

        return {
            altitude: topHoriz.altitude,
            azimuth: topHoriz.azimuth,
            ra: topRA,
            dec: topDec,
            geoAltitude: geoHoriz.altitude,
            geoAzimuth: geoHoriz.azimuth,
            geoRA: pos.ra,
            geoDec: pos.dec,
            distance: pos.distance,
            parallax: pos.parallax,
            semiDiameter: pos.semiDiameter,
            lonEcl: pos.lonEcl,
            latEcl: pos.latEcl
        };
    }

    // Compute moonset time (UT hours) using iterative method
    function computeMoonset(year, month, day, lat, lon) {
        // The moon moves ~13 deg/day, so we need iteration
        var h0 = 0.125; // degrees (refraction + semi-diameter approximation)

        // Initial estimate: around sunset time or later
        var ut = 20 - lon / 15;
        if (ut < 0) ut += 24;
        if (ut > 24) ut -= 24;

        for (var i = 0; i < 10; i++) {
            var d = Astro.dayNumber(year, month, day, ut);
            var pos = position(d);
            var lst = Astro.localSiderealTime(d, ut, lon);

            var cosH = (Astro.sind(h0) - Astro.sind(lat) * Astro.sind(pos.dec)) /
                       (Astro.cosd(lat) * Astro.cosd(pos.dec));

            if (cosH > 1) return null;  // moon doesn't set
            if (cosH < -1) return 24;   // moon is always above horizon

            var H = Astro.acosd(cosH); // setting hour angle

            var ha = Astro.normalize360(lst - pos.ra);
            if (ha > 180) ha -= 360;

            var correction = (H - ha) / 360 * 24 / 1.0027379;

            // Account for moon's own motion (~0.55 deg/hour in RA)
            correction *= 1.0 / (1.0 + 0.55 / 15);

            ut += correction;

            if (Math.abs(correction) < 0.005) break; // converged (~18 seconds)

            // Keep within reasonable range (allow moonset next day)
            if (ut < 0) ut += 24;
            if (ut > 48) ut -= 24;
        }

        return ut;
    }

    return {
        position: position,
        topocentricPosition: topocentricPosition,
        computeMoonset: computeMoonset
    };
})();
