// ============================================================
// phases.js - Calcul des dates de nouvelle lune
// Meeus Ch.49 avec 25 termes de correction + 14 termes planétaires
// ============================================================

var Phases = (function () {

    // Compute the JDE of a new moon for lunation number k
    // k must be an integer for new moon
    function computeNewMoon(k) {
        var T = k / 1236.85;
        var T2 = T * T;
        var T3 = T2 * T;
        var T4 = T3 * T;

        // Approximate JDE
        var JDE = 2451550.09766
                + 29.530588861 * k
                + 0.00015437 * T2
                - 0.000000150 * T3
                + 0.00000000073 * T4;

        // Eccentricity correction factor
        var E = 1 - 0.002516 * T - 0.0000074 * T2;
        var E2 = E * E;

        // Fundamental arguments (degrees)
        var M = Astro.normalize360(
            2.5534 + 29.10535670 * k - 0.0000014 * T2 - 0.00000011 * T3
        ); // Sun's mean anomaly

        var Mp = Astro.normalize360(
            201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4
        ); // Moon's mean anomaly

        var F = Astro.normalize360(
            160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4
        ); // Moon's argument of latitude

        var Om = Astro.normalize360(
            124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3
        ); // Longitude of ascending node

        // 25 correction terms for new moon
        var corr =
            -0.40720 * Astro.sind(Mp)
            + 0.17241 * E * Astro.sind(M)
            + 0.01608 * Astro.sind(2 * Mp)
            + 0.01039 * Astro.sind(2 * F)
            + 0.00739 * E * Astro.sind(Mp - M)
            - 0.00514 * E * Astro.sind(Mp + M)
            + 0.00208 * E2 * Astro.sind(2 * M)
            - 0.00111 * Astro.sind(Mp - 2 * F)
            - 0.00057 * Astro.sind(Mp + 2 * F)
            + 0.00056 * E * Astro.sind(2 * Mp + M)
            - 0.00042 * Astro.sind(3 * Mp)
            + 0.00042 * E * Astro.sind(M + 2 * F)
            + 0.00038 * E * Astro.sind(M - 2 * F)
            - 0.00024 * E * Astro.sind(2 * Mp - M)
            - 0.00017 * Astro.sind(Om)
            - 0.00007 * Astro.sind(Mp + 2 * M)
            + 0.00004 * Astro.sind(2 * Mp - 2 * F)
            + 0.00004 * Astro.sind(3 * M)
            + 0.00003 * Astro.sind(Mp + M - 2 * F)
            + 0.00003 * Astro.sind(2 * Mp + 2 * F)
            - 0.00003 * Astro.sind(Mp + M + 2 * F)
            + 0.00003 * Astro.sind(Mp - M + 2 * F)
            - 0.00002 * Astro.sind(Mp - M - 2 * F)
            - 0.00002 * Astro.sind(3 * Mp + M)
            + 0.00002 * Astro.sind(4 * Mp);

        JDE += corr;

        // 14 additional planetary corrections (A1..A14)
        var A1  = Astro.normalize360(299.77 + 0.107408 * k - 0.009173 * T2);
        var A2  = Astro.normalize360(251.88 + 0.016321 * k);
        var A3  = Astro.normalize360(251.83 + 26.651886 * k);
        var A4  = Astro.normalize360(349.42 + 36.412478 * k);
        var A5  = Astro.normalize360(84.66 + 18.206239 * k);
        var A6  = Astro.normalize360(141.74 + 53.303771 * k);
        var A7  = Astro.normalize360(207.14 + 2.453732 * k);
        var A8  = Astro.normalize360(154.84 + 7.306860 * k);
        var A9  = Astro.normalize360(34.52 + 27.261239 * k);
        var A10 = Astro.normalize360(207.19 + 0.121824 * k);
        var A11 = Astro.normalize360(291.34 + 1.844379 * k);
        var A12 = Astro.normalize360(161.72 + 24.198154 * k);
        var A13 = Astro.normalize360(239.56 + 25.513099 * k);
        var A14 = Astro.normalize360(331.55 + 3.592518 * k);

        var addCorr =
            0.000325 * Astro.sind(A1)
            + 0.000165 * Astro.sind(A2)
            + 0.000164 * Astro.sind(A3)
            + 0.000126 * Astro.sind(A4)
            + 0.000110 * Astro.sind(A5)
            + 0.000062 * Astro.sind(A6)
            + 0.000060 * Astro.sind(A7)
            + 0.000056 * Astro.sind(A8)
            + 0.000047 * Astro.sind(A9)
            + 0.000042 * Astro.sind(A10)
            + 0.000040 * Astro.sind(A11)
            + 0.000037 * Astro.sind(A12)
            + 0.000035 * Astro.sind(A13)
            + 0.000023 * Astro.sind(A14);

        JDE += addCorr;

        return JDE;
    }

    // Convert JDE (Terrestrial Time) to JD (UT)
    function jdeToJD(jde) {
        var date = Astro.jdToDate(jde);
        var year = date.year + (date.month - 1) / 12;
        var dt = Astro.deltaT(year);
        return jde - dt / 86400.0;
    }

    // Find upcoming new moons from a given date
    function findUpcomingNewMoons(fromDate, count) {
        count = count || 13;

        var year = fromDate.getUTCFullYear() +
                   (fromDate.getUTCMonth()) / 12 +
                   fromDate.getUTCDate() / 365.25;

        // Approximate lunation number
        var k0 = Math.floor((year - 2000) * 12.3685);

        var results = [];
        var fromJD = Astro.dateObjToJD(fromDate);

        // Search from a bit before to make sure we don't miss the current one
        for (var k = k0 - 1; results.length < count; k++) {
            var jde = computeNewMoon(k);
            var jd = jdeToJD(jde);

            if (jd >= fromJD - 1) { // Include new moons from 1 day before
                results.push({
                    k: k,
                    jde: jde,        // Terrestrial Time
                    jd: jd,          // Universal Time
                    date: Astro.jdToDateObj(jd)
                });
            }
        }

        return results;
    }

    return {
        computeNewMoon: computeNewMoon,
        jdeToJD: jdeToJD,
        findUpcomingNewMoons: findUpcomingNewMoons
    };
})();
