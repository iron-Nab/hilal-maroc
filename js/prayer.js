// ============================================================
// prayer.js - Horaires de prière islamique
// Convention marocaine (Ministère des Habous et Affaires Islamiques)
// Fajr: -19°, Isha: -17°, Asr: Shafi'i
// ============================================================

var Prayer = (function () {

    // --- Convention Maroc ---
    var FAJR_ANGLE    = -19;       // degrés sous l'horizon
    var ISHA_ANGLE    = -17;       // degrés sous l'horizon
    var ASR_FACTOR    = 1;         // 1 = Shafi'i, 2 = Hanafi
    var DHUHR_MARGIN  = 2 / 60;    // heures (2 minutes)
    var MAGHRIB_MARGIN = 3 / 60;   // heures (3 minutes)

    // --- Helper : heure où le soleil atteint l'altitude h0 ---
    // direction: 'rise' (avant transit) ou 'set' (après transit)
    function computeSunTime(year, month, day, lat, lon, h0, direction) {
        var ut = (direction === 'rise' ? 6 : 18) - lon / 15;
        if (ut < 0) ut += 24;
        if (ut > 24) ut -= 24;

        for (var i = 0; i < 5; i++) {
            var d = Astro.dayNumber(year, month, day, ut);
            var pos = Sun.position(d);
            var lst = Astro.localSiderealTime(d, ut, lon);

            var cosH = (Astro.sind(h0) - Astro.sind(lat) * Astro.sind(pos.dec)) /
                       (Astro.cosd(lat) * Astro.cosd(pos.dec));

            if (cosH > 1 || cosH < -1) return null; // pas d'événement (polaire)

            var H = Astro.acosd(cosH);
            if (direction === 'rise') H = -H;

            var ha = Astro.normalize360(lst - pos.ra);
            if (ha > 180) ha -= 360;

            var correction = (H - ha) / 360 * 24 / 1.0027379;
            ut += correction;

            if (ut < 0) ut += 24;
            if (ut > 48) ut -= 24;
        }

        return ut;
    }

    // --- Transit solaire (midi solaire) ---
    function computeSolarNoon(year, month, day, lon) {
        var ut = 12 - lon / 15;

        for (var i = 0; i < 3; i++) {
            var d = Astro.dayNumber(year, month, day, ut);
            var pos = Sun.position(d);
            var lst = Astro.localSiderealTime(d, ut, lon);

            var ha = lst - pos.ra;
            if (ha > 180) ha -= 360;
            if (ha < -180) ha += 360;

            var correction = -ha / 360 * 24 / 1.0027379;
            ut += correction;
        }

        return ut;
    }

    // --- Asr (Shafi'i) ---
    function computeAsr(year, month, day, lat, lon) {
        // Altitude du soleil à midi solaire
        var noonUT = computeSolarNoon(year, month, day, lon);
        var d = Astro.dayNumber(year, month, day, noonUT);
        var pos = Sun.position(d);

        var noonAlt = Astro.asind(
            Astro.sind(lat) * Astro.sind(pos.dec) +
            Astro.cosd(lat) * Astro.cosd(pos.dec)
        );

        // Ratio d'ombre pour Asr : factor + tan(zenith) = factor + cot(altitude)
        var shadowNoon = 1 / Astro.tand(noonAlt);
        var shadowAsr = ASR_FACTOR + shadowNoon;
        var targetAlt = Astro.atan2d(1, shadowAsr); // atan(1/shadowAsr) en degrés

        // Trouver l'heure l'après-midi où le soleil atteint targetAlt
        return computeSunTime(year, month, day, lat, lon, targetAlt, 'set');
    }

    // --- API publique ---
    function computeAllTimes(year, month, day, lat, lon) {
        return {
            fajr:    computeSunTime(year, month, day, lat, lon, FAJR_ANGLE, 'rise'),
            shurouq: Sun.computeSunrise(year, month, day, lat, lon),
            dhuhr:   computeSolarNoon(year, month, day, lon) + DHUHR_MARGIN,
            asr:     computeAsr(year, month, day, lat, lon),
            maghrib: (function () {
                var s = Sun.computeSunset(year, month, day, lat, lon);
                return s !== null ? s + MAGHRIB_MARGIN : null;
            })(),
            isha:    computeSunTime(year, month, day, lat, lon, ISHA_ANGLE, 'set')
        };
    }

    return {
        computeAllTimes: computeAllTimes,
        FAJR_ANGLE: FAJR_ANGLE,
        ISHA_ANGLE: ISHA_ANGLE
    };
})();
