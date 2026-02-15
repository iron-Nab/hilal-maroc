// ============================================================
// hilal.js - Critères de visibilité du Hilal
// Critère marocain (Ministère des Habous) + Yallop + Odeh
// ============================================================

var Hilal = (function () {

    // --- Critère marocain (Ministère des Habous et des Affaires Islamiques) ---
    // Basé sur les seuils utilisés par les comités d'observation au Maroc :
    //   - Âge de la lune > 20 heures après conjonction
    //   - Durée d'apparition après coucher du soleil (lag) > 29 minutes
    //   - Élongation (ARCL) > 6 degrés
    //   - Lune au-dessus de l'horizon au coucher du soleil
    function criterMarocain(moonAge, lagMinutes, ARCL, moonAlt) {
        var checks = {
            age: moonAge >= 20,
            lag: lagMinutes >= 29,
            elongation: ARCL >= 6,
            aboveHorizon: moonAlt > 0
        };

        var allPassed = checks.age && checks.lag && checks.elongation && checks.aboveHorizon;

        var label, labelFr, color;
        if (allPassed) {
            label = 'Visible to naked eye (Moroccan criteria)';
            labelFr = 'Visible à l\'oeil nu (critère marocain)';
            color = 'green';
        } else {
            // Determine which criterion failed
            var reasons = [];
            if (!checks.age) reasons.push('âge < 20h');
            if (!checks.lag) reasons.push('lag < 29min');
            if (!checks.elongation) reasons.push('élongation < 6°');
            if (!checks.aboveHorizon) reasons.push('lune sous l\'horizon');
            label = 'Not visible (' + reasons.join(', ') + ')';
            labelFr = 'Non visible (' + reasons.join(', ') + ')';
            color = 'red';
        }

        return {
            visible: allPassed,
            checks: checks,
            label: label,
            labelFr: labelFr,
            color: color,
            moonAge: moonAge,
            lagMinutes: lagMinutes,
            ARCL: ARCL,
            moonAlt: moonAlt
        };
    }

    // --- Yallop's q-test (1997) ---
    function yallopQTest(ARCV, W) {
        var q = ARCV - (11.8371 - 6.3226 * W + 0.7319 * W * W - 0.1018 * W * W * W);
        var zone, label, labelFr, color;

        if (q > 0.216) {
            zone = 'A'; label = 'Easily visible to naked eye';
            labelFr = 'Facilement visible'; color = 'green';
        } else if (q > -0.014) {
            zone = 'B'; label = 'Visible under perfect conditions';
            labelFr = 'Visible (conditions parfaites)'; color = 'green';
        } else if (q > -0.160) {
            zone = 'C'; label = 'May need optical aid';
            labelFr = 'Aide optique possible'; color = 'amber';
        } else if (q > -0.232) {
            zone = 'D'; label = 'Only with telescope';
            labelFr = 'Télescope nécessaire'; color = 'red';
        } else if (q > -0.293) {
            zone = 'E'; label = 'Not visible with telescope';
            labelFr = 'Non visible (télescope)'; color = 'red';
        } else {
            zone = 'F'; label = 'Below Danjon limit';
            labelFr = 'Sous la limite de Danjon'; color = 'red';
        }

        return { q: q, zone: zone, label: label, labelFr: labelFr, color: color };
    }

    // --- Odeh's V-test (2006) ---
    function odehVTest(ARCV, W, ARCL) {
        if (ARCL < 6.4) {
            return {
                v: -999, zone: 'D',
                label: 'Below Danjon limit',
                labelFr: 'Sous la limite de Danjon',
                color: 'red'
            };
        }

        var V = ARCV - (-0.1018 * W * W * W + 0.7319 * W * W - 6.3226 * W + 11.8371);
        var zone, label, labelFr, color;

        if (V >= 5.65) {
            zone = 'A'; label = 'Visible by naked eye';
            labelFr = 'Visible à l\'oeil nu'; color = 'green';
        } else if (V >= 2.00) {
            zone = 'B'; label = 'May need optical aid';
            labelFr = 'Aide optique possible'; color = 'amber';
        } else if (V >= -0.96) {
            zone = 'C'; label = 'Only by optical aid';
            labelFr = 'Uniquement aide optique'; color = 'red';
        } else {
            zone = 'D'; label = 'Not visible';
            labelFr = 'Non visible'; color = 'red';
        }

        return { v: V, zone: zone, label: label, labelFr: labelFr, color: color };
    }

    // Compute visibility status — Morocco criterion is primary
    function visibilityStatus(maroc, yallop) {
        if (maroc.visible) {
            return { status: 'visible', label: 'VISIBLE', labelFr: 'VISIBLE', cssClass: 'hilal-visible' };
        }
        // If Morocco says no but Yallop says marginal (zone C), show marginal
        if (yallop.zone === 'C') {
            return { status: 'marginal', label: 'MARGINAL', labelFr: 'MARGINAL', cssClass: 'hilal-marginal' };
        }
        return { status: 'not-visible', label: 'NOT VISIBLE', labelFr: 'NON VISIBLE', cssClass: 'hilal-not-visible' };
    }

    // Evaluate one evening for Hilal visibility
    function evaluateEvening(year, month, day, lat, lon, newMoonJD) {
        // Compute sunset
        var sunsetUT = Sun.computeSunset(year, month, day, lat, lon);
        if (sunsetUT === null) return null;

        // Sun position at sunset
        var sunPos = Sun.altAz(year, month, day, sunsetUT, lat, lon);

        // Moon topocentric position at sunset
        var moonPos = Moon.topocentricPosition(year, month, day, sunsetUT, lat, lon);

        // Moon must be above horizon
        if (moonPos.altitude < -1) {
            return {
                visible: false,
                reason: 'Moon below horizon at sunset',
                reasonFr: 'Lune sous l\'horizon au coucher du soleil',
                date: { year: year, month: month, day: day },
                sunset: sunsetUT,
                moonAlt: moonPos.altitude
            };
        }

        // Compute moonset
        var moonsetUT = Moon.computeMoonset(year, month, day, lat, lon);
        if (moonsetUT !== null && moonsetUT <= sunsetUT) {
            return {
                visible: false,
                reason: 'Moon sets before sunset',
                reasonFr: 'Lune couchée avant le soleil',
                date: { year: year, month: month, day: day },
                sunset: sunsetUT,
                moonset: moonsetUT,
                moonAlt: moonPos.altitude
            };
        }

        // Lag time in minutes (moonset - sunset)
        var lagMinutes = moonsetUT !== null ? (moonsetUT - sunsetUT) * 60 : 40;

        // Best time (Yallop): sunset + 4/9 * lag
        var bestTimeUT = sunsetUT + (4 / 9) * lagMinutes / 60;

        // Moon position at best time
        var moonBest = Moon.topocentricPosition(year, month, day, bestTimeUT, lat, lon);

        // Sun position at best time (for ARCV and ARCL per Yallop)
        var sunBest = Sun.altAz(year, month, day, bestTimeUT, lat, lon);

        // Geocentric elongation (ARCL) at best time
        var ARCL = Astro.acosd(
            Astro.sind(sunBest.dec) * Astro.sind(moonBest.geoDec) +
            Astro.cosd(sunBest.dec) * Astro.cosd(moonBest.geoDec) *
            Astro.cosd(moonBest.geoRA - sunBest.ra)
        );

        // Relative azimuth (DAZ) at best time
        var DAZ = moonBest.azimuth - sunBest.azimuth;

        // Arc of vision (ARCV) - geocentric altitude difference at best time per Yallop
        var ARCV = moonBest.geoAltitude - sunBest.altitude;

        // Crescent width W (arc-minutes)
        var SD = moonBest.semiDiameter;
        var W = SD * (1 - Astro.cosd(ARCL));
        W = W * 60;

        // Moon age in hours since conjunction
        var currentJD = Astro.dateToJD(year, month, day + sunsetUT / 24);
        var moonAge = (currentJD - newMoonJD) * 24;

        // Apply all three criteria
        var maroc = criterMarocain(moonAge, lagMinutes, ARCL, moonPos.altitude);
        var yallop = yallopQTest(ARCV, W);
        var odeh = odehVTest(ARCV, W, ARCL);
        var status = visibilityStatus(maroc, yallop);

        return {
            visible: maroc.visible,
            date: { year: year, month: month, day: day },
            sunset: sunsetUT,
            moonset: moonsetUT,
            bestTime: bestTimeUT,
            lagMinutes: lagMinutes,
            moonAlt: moonPos.altitude,
            moonAz: moonPos.azimuth,
            moonAltBest: moonBest.altitude,
            sunAlt: sunPos.altitude,
            sunAz: sunPos.azimuth,
            ARCL: ARCL,
            ARCV: ARCV,
            DAZ: DAZ,
            W: W,
            moonAge: moonAge,
            maroc: maroc,
            yallop: yallop,
            odeh: odeh,
            status: status
        };
    }

    // Evaluate Hilal for a given new moon
    function evaluateHilal(newMoon, lat, lon) {
        var nmDate = Astro.jdToDate(newMoon.jd);

        // Evening 1: the day of conjunction
        var ev1 = evaluateEvening(nmDate.year, nmDate.month, nmDate.day, lat, lon, newMoon.jd);

        // Evening 2: the day after conjunction
        var nextJD = newMoon.jd + 1;
        var nextDate = Astro.jdToDate(nextJD);
        var ev2 = evaluateEvening(nextDate.year, nextDate.month, nextDate.day, lat, lon, newMoon.jd);

        // Choose the relevant evening for Hilal (Morocco logic):
        // If visible on evening 1, that's the Hilal evening.
        // Otherwise, check evening 2.
        var bestEvening = null;
        if (ev1 && ev1.visible) {
            bestEvening = ev1;
        } else if (ev2 && ev2.maroc) {
            bestEvening = ev2;
        } else if (ev1 && ev1.maroc) {
            bestEvening = ev1;
        }

        // Determine month duration based on visibility
        // If visible on evening 1 → current Hijri month = 29 days
        // If visible only on evening 2 → current Hijri month = 29 days (from evening 2 perspective)
        // If not visible on either → current month completes 30 days
        var monthDuration = 30;
        if ((ev1 && ev1.visible) || (ev2 && ev2.visible)) {
            monthDuration = 29;
        }

        return {
            newMoon: newMoon,
            evening1: ev1,
            evening2: ev2,
            bestEvening: bestEvening,
            monthDuration: monthDuration
        };
    }

    return {
        criterMarocain: criterMarocain,
        yallopQTest: yallopQTest,
        odehVTest: odehVTest,
        visibilityStatus: visibilityStatus,
        evaluateEvening: evaluateEvening,
        evaluateHilal: evaluateHilal
    };
})();
