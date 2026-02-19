// ============================================================
// app.js - Contrôleur principal de l'application
// Sélecteur de villes marocaines, critère marocain, rendu DOM
// ============================================================

var App = (function () {

    var state = {
        lat: null,
        lon: null,
        cityName: null,
        predictions: [],
        loading: false
    };

    // --- DOM Elements ---
    function el(id) { return document.getElementById(id); }

    // --- Initialization ---
    function init() {
        el('btn-geolocate').addEventListener('click', geolocate);
        el('btn-calculate').addEventListener('click', onCalculate);
        el('select-city').addEventListener('change', onCityChange);

        // Allow Enter key in coordinate inputs
        el('input-lat').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') onCalculate();
        });
        el('input-lon').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') onCalculate();
        });

        // Show current Hijri date
        updateHijriDate();

        // Hadith et Maw3ida du jour
        renderHadith();
        renderMawida();

        // Auto-géolocalisation au lancement, fallback sur Rabat
        autoGeolocate();
    }

    // --- City Selector ---
    function onCityChange() {
        var select = el('select-city');
        var val = select.value;

        if (val === 'custom') {
            el('coord-inputs').style.display = 'flex';
            state.cityName = null;
            return;
        }

        el('coord-inputs').style.display = 'none';

        if (val && val.indexOf(',') > -1) {
            var parts = val.split(',');
            var lat = parseFloat(parts[0]);
            var lon = parseFloat(parts[1]);
            var cityName = select.options[select.selectedIndex].text;
            state.cityName = cityName;
            setStatus('Ville : ' + cityName + ' (' + formatCoord(lat, 'N', 'S') + ', ' + formatCoord(lon, 'E', 'W') + ')', false);
            computeAndRender(lat, lon);
        }
    }

    // --- Geolocation ---

    // Trouver la ville la plus proche dans le sélecteur (rayon ~50km)
    function findNearestCity(lat, lon) {
        var select = el('select-city');
        var bestDist = Infinity;
        var bestValue = null;
        var bestName = null;
        for (var i = 0; i < select.options.length; i++) {
            var opt = select.options[i];
            var val = opt.value;
            if (!val || val === 'custom' || val.indexOf(',') === -1) continue;
            var parts = val.split(',');
            var cLat = parseFloat(parts[0]);
            var cLon = parseFloat(parts[1]);
            var dLat = (lat - cLat) * 111;
            var dLon = (lon - cLon) * 111 * Math.cos(lat * Math.PI / 180);
            var dist = Math.sqrt(dLat * dLat + dLon * dLon);
            if (dist < bestDist) {
                bestDist = dist;
                bestValue = val;
                bestName = opt.text;
            }
        }
        if (bestDist <= 50) return { value: bestValue, name: bestName, dist: bestDist };
        return null;
    }

    // Reverse geocoding via OpenStreetMap Nominatim
    function reverseGeocode(lat, lon, callback) {
        var url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon + '&zoom=10&accept-language=fr';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 5000;
        xhr.onload = function () {
            try {
                var data = JSON.parse(xhr.responseText);
                var city = data.address.city || data.address.town || data.address.village || data.address.municipality || '';
                var country = data.address.country || '';
                callback(city, country);
            } catch (e) {
                callback('', '');
            }
        };
        xhr.onerror = function () { callback('', ''); };
        xhr.ontimeout = function () { callback('', ''); };
        xhr.send();
    }

    // Appliquer la position détectée (utilisé par geolocate et autoGeolocate)
    function applyPosition(lat, lon) {
        var nearest = findNearestCity(lat, lon);
        if (nearest) {
            // Ville connue dans le sélecteur
            el('select-city').value = nearest.value;
            el('coord-inputs').style.display = 'none';
            state.cityName = nearest.name;
            setStatus('Ville détectée : ' + nearest.name + ' (' + formatCoord(lat, 'N', 'S') + ', ' + formatCoord(lon, 'E', 'W') + ')', false);
            computeAndRender(lat, lon);
        } else {
            // Ville inconnue — reverse geocoding
            el('select-city').value = 'custom';
            el('coord-inputs').style.display = 'flex';
            el('input-lat').value = lat;
            el('input-lon').value = lon;
            setStatus('Position détectée. Recherche de la ville...', false);
            reverseGeocode(lat, lon, function (city, country) {
                var label = city && country ? city + ', ' + country : city || country || 'Ma position';
                state.cityName = label;
                setStatus(label + ' (' + formatCoord(lat, 'N', 'S') + ', ' + formatCoord(lon, 'E', 'W') + ')', false);
                el('prayer-location').textContent = label;
            });
            computeAndRender(lat, lon);
        }
    }

    // Géolocalisation manuelle (bouton)
    function geolocate() {
        if (!navigator.geolocation) {
            setStatus('Géolocalisation non disponible. Sélectionnez une ville.', true);
            return;
        }

        setStatus('Détection de votre position...', false);

        navigator.geolocation.getCurrentPosition(
            function (pos) {
                var lat = Math.round(pos.coords.latitude * 10000) / 10000;
                var lon = Math.round(pos.coords.longitude * 10000) / 10000;
                applyPosition(lat, lon);
            },
            function (err) {
                var msg = 'Géolocalisation refusée. ';
                if (err.code === 1) msg = 'Permission refusée. ';
                else if (err.code === 2) msg = 'Position indisponible. ';
                else if (err.code === 3) msg = 'Délai expiré. ';
                setStatus(msg + 'Sélectionnez une ville marocaine.', true);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
    }

    // Auto-géolocalisation au lancement (charge Rabat d'abord, puis met à jour si position trouvée)
    function autoGeolocate() {
        // Charger immédiatement avec la ville par défaut (Rabat)
        onCityChange();

        if (!navigator.geolocation) return;

        // Tenter la géolocalisation en arrière-plan
        navigator.geolocation.getCurrentPosition(
            function (pos) {
                var lat = Math.round(pos.coords.latitude * 10000) / 10000;
                var lon = Math.round(pos.coords.longitude * 10000) / 10000;
                applyPosition(lat, lon);
            },
            function () {
                // Silencieux : on garde la ville par défaut déjà chargée
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
    }

    function onCalculate() {
        var select = el('select-city');
        if (select.value === 'custom') {
            var lat = parseFloat(el('input-lat').value);
            var lon = parseFloat(el('input-lon').value);

            if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                setStatus('Coordonnées invalides. Latitude : -90 à 90, Longitude : -180 à 180.', true);
                return;
            }

            state.cityName = 'Position personnalisée';
            setStatus('Position : ' + formatCoord(lat, 'N', 'S') + ', ' + formatCoord(lon, 'E', 'W'), false);
            computeAndRender(lat, lon);
        } else {
            onCityChange();
        }
    }

    function formatCoord(val, posLabel, negLabel) {
        var label = val >= 0 ? posLabel : negLabel;
        return Math.abs(val).toFixed(4) + '° ' + label;
    }

    function setStatus(msg, isError) {
        var statusEl = el('location-status');
        statusEl.textContent = msg;
        statusEl.className = 'location-status' + (isError ? ' error' : '');
    }

    // --- Prayer Times ---
    function renderPrayerTimes(lat, lon) {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();

        var times = Prayer.computeAllTimes(year, month, day, lat, lon);
        var tzOffset = -(now.getTimezoneOffset());

        var prayers = [
            { name: 'Fajr',    nameAr: '\u0627\u0644\u0641\u062c\u0631',   ut: times.fajr,    isPrayer: true },
            { name: 'Shurouq', nameAr: '\u0627\u0644\u0634\u0631\u0648\u0642',  ut: times.shurouq, isPrayer: false },
            { name: 'Dhuhr',   nameAr: '\u0627\u0644\u0638\u0647\u0631',   ut: times.dhuhr,   isPrayer: true },
            { name: 'Asr',     nameAr: '\u0627\u0644\u0639\u0635\u0631',   ut: times.asr,     isPrayer: true },
            { name: 'Maghrib', nameAr: '\u0627\u0644\u0645\u063a\u0631\u0628',  ut: times.maghrib, isPrayer: true },
            { name: 'Isha',    nameAr: '\u0627\u0644\u0639\u0634\u0627\u0621',  ut: times.isha,    isPrayer: true }
        ];

        // Déterminer la prochaine prière
        var nowMinutes = now.getHours() * 60 + now.getMinutes();
        var nextIdx = -1;
        for (var i = 0; i < prayers.length; i++) {
            if (prayers[i].ut === null) continue;
            var localMin = Math.round(prayers[i].ut * 60) + tzOffset;
            if (localMin < 0) localMin += 1440;
            if (localMin >= 1440) localMin -= 1440;
            if (localMin > nowMinutes && nextIdx === -1) {
                nextIdx = i;
            }
        }

        var html = '';
        for (var j = 0; j < prayers.length; j++) {
            var p = prayers[j];
            var timeStr = p.ut !== null ?
                formatTimeLocal(year, month, day, p.ut, tzOffset) : '--:--';
            var isNext = (j === nextIdx);
            var classes = 'prayer-time-item';
            if (!p.isPrayer) classes += ' prayer-sunrise';
            if (isNext) classes += ' prayer-next';

            html += '<div class="' + classes + '">';
            html += '<div class="prayer-name">' + p.name + '</div>';
            html += '<div class="prayer-name-ar">' + p.nameAr + '</div>';
            html += '<div class="prayer-time-value">' + timeStr + '</div>';
            if (isNext) html += '<div class="prayer-next-label">Suivante</div>';
            html += '</div>';
        }

        el('prayer-grid').innerHTML = html;
        el('prayer-date').textContent = formatLocalDateFull(year, month, day);
        el('prayer-location').textContent = state.cityName || '';

        // Envoyer les horaires à l'app native (notifications)
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.prayerTimes) {
            var nativeData = [];
            for (var k = 0; k < prayers.length; k++) {
                var pr = prayers[k];
                if (pr.ut === null) continue;
                var totalMin = Math.round(pr.ut * 60) + tzOffset;
                if (totalMin < 0) totalMin += 1440;
                if (totalMin >= 1440) totalMin -= 1440;
                nativeData.push({
                    name: pr.name,
                    nameAr: pr.nameAr,
                    hour: Math.floor(totalMin / 60),
                    minute: totalMin % 60,
                    isPrayer: pr.isPrayer
                });
            }
            window.webkit.messageHandlers.prayerTimes.postMessage({ prayers: nativeData });
        }
    }

    // --- Main computation ---
    function computeAndRender(lat, lon) {
        state.lat = lat;
        state.lon = lon;

        renderPrayerTimes(lat, lon);
        showLoading();

        setTimeout(function () {
            try {
                var now = new Date();
                var newMoons = Phases.findUpcomingNewMoons(now, 13);

                var predictions = [];
                for (var i = 0; i < newMoons.length; i++) {
                    var result = Hilal.evaluateHilal(newMoons[i], lat, lon);
                    predictions.push(result);
                }

                state.predictions = predictions;
                History.saveAllPredictions(predictions);
                renderHistory();
                renderResults(predictions);
            } catch (e) {
                console.error('Computation error:', e);
                el('results').innerHTML =
                    '<div class="empty-state"><p>Erreur de calcul. Veuillez vérifier vos coordonnées.</p></div>';
            }
        }, 50);
    }

    // --- Rendering ---
    function showLoading() {
        var city = state.cityName || 'votre position';
        el('results').innerHTML =
            '<div class="loading">' +
            '<div class="loading-spinner"></div>' +
            '<p>Calcul des prédictions du Hilal pour ' + escapeHtml(city) + '...</p>' +
            '</div>';
    }

    function renderResults(predictions) {
        var html = '<div class="results-grid">';

        for (var i = 0; i < predictions.length; i++) {
            html += renderCard(predictions[i]);
        }

        html += '</div>';
        el('results').innerHTML = html;
    }

    function renderCard(prediction) {
        var nm = prediction.newMoon;
        var ev = prediction.bestEvening;

        // Hijri month info
        var hijriInfo = Hijri.hijriMonthForNewMoon(nm.date);
        var hijriMonthEn = Hijri.getMonthName(hijriInfo.month, 'en');
        var hijriMonthAr = Hijri.getMonthName(hijriInfo.month, 'ar');

        // Gregorian month
        var gregMonths = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

        // Determine CSS class and badge
        var cssClass = 'hilal-not-visible';
        var badgeClass = 'badge-not-visible';
        var badgeText = 'NON VISIBLE';

        if (ev && ev.status) {
            cssClass = ev.status.cssClass;
            badgeText = ev.status.labelFr;
            if (ev.status.status === 'visible') badgeClass = 'badge-visible';
            else if (ev.status.status === 'marginal') badgeClass = 'badge-marginal';
        }

        var html = '<div class="hilal-card ' + cssClass + '">';

        // Card header
        html += '<div class="card-header">';
        html += '<div class="month-info">';
        html += '<div class="hijri-month">' + hijriMonthEn + ' ' + hijriInfo.year + '</div>';
        html += '<div class="hijri-month-ar">' + hijriMonthAr + '</div>';

        var nmDate = nm.date;
        html += '<div class="gregorian-month">' + gregMonths[nmDate.getUTCMonth()] + ' ' + nmDate.getUTCFullYear();
        // Month duration indicator
        html += ' <span class="month-duration">(' + prediction.monthDuration + ' jours)</span>';
        html += '</div>';
        html += '</div>';
        html += '<span class="visibility-badge ' + badgeClass + '"><span class="badge-dot"></span>' + badgeText + '</span>';
        html += '</div>';

        // Card body
        html += '<div class="card-body">';

        if (ev && ev.maroc) {
            var tzOffset = -(new Date().getTimezoneOffset());
            var tzName = getTimezoneAbbr();

            // Highlighted visibility date & time section
            var sunsetLocal = formatTimeLocal(ev.date.year, ev.date.month, ev.date.day, ev.sunset, tzOffset);
            var bestLocal = ev.bestTime ? formatTimeLocal(ev.date.year, ev.date.month, ev.date.day, ev.bestTime, tzOffset) : null;
            var moonsetLocal = ev.moonset ? formatTimeLocal(ev.date.year, ev.date.month, ev.date.day, ev.moonset, tzOffset) : null;
            var obsDate = formatLocalDateFull(ev.date.year, ev.date.month, ev.date.day);

            html += '<div class="visibility-datetime">';
            html += '<div class="vis-date-icon">&#9789;</div>';
            html += '<div class="vis-date-info">';
            html += '<div class="vis-date-label">Date et heure d\'observation</div>';
            html += '<div class="vis-date-value">' + obsDate + '</div>';
            html += '<div class="vis-time-window">';
            html += '<span class="vis-time-item"><span class="vis-time-label">Coucher soleil</span> ' + sunsetLocal + '</span>';
            if (bestLocal) {
                html += '<span class="vis-time-sep">&#9654;</span>';
                html += '<span class="vis-time-item vis-time-best"><span class="vis-time-label">Optimal</span> ' + bestLocal + '</span>';
            }
            if (moonsetLocal) {
                html += '<span class="vis-time-sep">&#9654;</span>';
                html += '<span class="vis-time-item"><span class="vis-time-label">Coucher lune</span> ' + moonsetLocal + '</span>';
            }
            html += '</div>';
            html += '<div class="vis-tz">' + tzName + '</div>';
            html += '</div>';
            html += '</div>';

            // Morocco criteria checks
            html += '<div class="maroc-checks">';
            html += '<div class="maroc-checks-title">Critères marocains</div>';
            html += checkItem('Âge lune', formatMoonAge(ev.moonAge), '&ge; 20h', ev.maroc.checks.age);
            html += checkItem('Durée apparition', Math.round(ev.lagMinutes) + ' min', '&ge; 29 min', ev.maroc.checks.lag);
            html += checkItem('Élongation', ev.ARCL.toFixed(1) + '°', '&ge; 6°', ev.maroc.checks.elongation);
            html += checkItem('Altitude lune', ev.moonAlt.toFixed(1) + '°', '> 0°', ev.maroc.checks.aboveHorizon);
            html += '</div>';

            // Additional astronomical details
            html += '<div class="param-grid">';
            html += paramHtml('Nouvelle Lune', formatDateTimeUTC(nm.date));
            html += paramHtml('Largeur Croissant', ev.W.toFixed(2) + "'");
            html += paramHtml('Arc de Vision', ev.ARCV.toFixed(1) + '°');

            var yallopHtml = ev.yallop.q.toFixed(3) + ' <span class="zone-label">(Zone ' + ev.yallop.zone + ')</span>';
            html += paramHtml('Yallop q', yallopHtml, true);

            if (ev.odeh) {
                var odehVal = ev.odeh.v === -999 ? '< Danjon' : ev.odeh.v.toFixed(3);
                var odehHtml = odehVal + ' <span class="zone-label">(Zone ' + ev.odeh.zone + ')</span>';
                html += paramHtml('Odeh V', odehHtml, true);
            }

            html += '</div>';

            // Note
            html += '<div class="card-note">';
            html += ev.maroc.labelFr;

            // Show evening 1 info if bestEvening is evening 2
            var ev1 = prediction.evening1;
            if (ev1 && ev1.maroc && ev !== ev1) {
                html += '<br>Soir précédent (' + formatLocalDate(ev1.date.year, ev1.date.month, ev1.date.day) + ') : ';
                html += ev1.maroc.labelFr;
            }
            html += '</div>';

        } else if (ev && ev.reasonFr) {
            html += '<p style="color: var(--text-light); padding: 0.5rem 0;">' + ev.reasonFr + '</p>';
        } else {
            html += '<p style="color: var(--text-light); padding: 0.5rem 0;">Données insuffisantes pour cette période.</p>';
        }

        html += '</div>'; // card-body
        html += '</div>'; // hilal-card

        return html;
    }

    function checkItem(label, value, threshold, passed) {
        var icon = passed ? '<span class="check-pass">&#10003;</span>' : '<span class="check-fail">&#10007;</span>';
        return '<div class="check-row">' + icon +
               '<span class="check-label">' + label + '</span>' +
               '<span class="check-value">' + value + '</span>' +
               '<span class="check-threshold">(' + threshold + ')</span>' +
               '</div>';
    }

    function paramHtml(label, value, isHtml) {
        return '<div class="param"><label>' + label + '</label><span>' +
               (isHtml ? value : escapeHtml(String(value))) + '</span></div>';
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // --- Time formatting ---
    function formatDateTimeUTC(date) {
        var months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
                      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        return date.getUTCDate() + ' ' + months[date.getUTCMonth()] + ' ' + date.getUTCFullYear() +
               ' à ' + pad2(date.getUTCHours()) + ':' + pad2(date.getUTCMinutes()) + ' UTC';
    }

    function formatTimeLocal(year, month, day, utHours, tzOffsetMin) {
        var totalMinutes = Math.round(utHours * 60) + tzOffsetMin;
        var h = Math.floor(totalMinutes / 60);
        var m = totalMinutes % 60;
        if (m < 0) { m += 60; h--; }
        if (h < 0) h += 24;
        if (h >= 24) h -= 24;
        return pad2(h) + ':' + pad2(m);
    }

    function formatLocalDate(year, month, day) {
        var months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
                      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        return day + ' ' + months[month - 1] + ' ' + year;
    }

    function formatLocalDateFull(year, month, day) {
        var days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        var months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        var d = new Date(year, month - 1, day);
        return days[d.getDay()] + ' ' + day + ' ' + months[month - 1] + ' ' + year;
    }

    function formatMoonAge(hours) {
        if (hours < 0) return 'Avant conjonction';
        var h = Math.floor(hours);
        var m = Math.round((hours - h) * 60);
        return h + 'h ' + m + 'min';
    }

    function pad2(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    function getTimezoneAbbr() {
        try {
            var parts = new Date().toLocaleTimeString('fr-FR', { timeZoneName: 'short' }).split(' ');
            return parts[parts.length - 1] || 'local';
        } catch (e) {
            var offset = -(new Date().getTimezoneOffset());
            var sign = offset >= 0 ? '+' : '-';
            var absOff = Math.abs(offset);
            return 'UTC' + sign + pad2(Math.floor(absOff / 60)) + ':' + pad2(absOff % 60);
        }
    }

    // --- Hadith du jour ---
    function renderHadith() {
        var hadith = Hadith.getToday();
        el('hadith-ar').textContent = hadith.ar;
        el('hadith-fr').textContent = hadith.fr;
        el('hadith-narrateur').textContent = hadith.narrateur;
        el('hadith-source').textContent = hadith.source;
    }

    // --- Maw3ida du jour ---
    function renderMawida() {
        var mawida = Mawaid.getToday();
        el('mawida-titre').textContent = mawida.titre;
        el('mawida-titre-ar').textContent = mawida.titreAr;
        el('mawida-contenu').textContent = mawida.contenu;
        el('mawida-verset').textContent = mawida.verset;
        el('mawida-reference').textContent = mawida.reference;
    }

    // --- Historique des observations ---
    function renderHistory() {
        var observations = History.getObservations();
        var summary = History.getSummary();
        var currentYear = new Date().getFullYear();

        el('history-year').textContent = currentYear;

        // Résumé
        var summaryHtml = '<div class="history-stats">';
        summaryHtml += '<div class="history-stat"><span class="stat-number">' + summary.total + '</span><span class="stat-label">Total</span></div>';
        summaryHtml += '<div class="history-stat stat-visible"><span class="stat-number">' + summary.visible + '</span><span class="stat-label">Visible</span></div>';
        summaryHtml += '<div class="history-stat stat-marginal"><span class="stat-number">' + summary.marginal + '</span><span class="stat-label">Marginal</span></div>';
        summaryHtml += '<div class="history-stat stat-not-visible"><span class="stat-number">' + summary.nonVisible + '</span><span class="stat-label">Non visible</span></div>';
        summaryHtml += '</div>';
        el('history-summary').innerHTML = summaryHtml;

        // Tableau
        var tbody = el('history-tbody');
        if (observations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="history-empty">Aucune observation enregistrée pour cette année.</td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < observations.length; i++) {
            var obs = observations[i];
            var statusBadge = obs.status === 'visible' ? 'badge-visible' :
                              obs.status === 'marginal' ? 'badge-marginal' : 'badge-not-visible';

            html += '<tr>';
            html += '<td><strong>' + escapeHtml(obs.hijriMonth) + '</strong><br><span class="history-ar">' + escapeHtml(obs.hijriMonthAr) + '</span> ' + obs.hijriYear + '</td>';
            html += '<td>' + formatHistoryDate(obs.newMoonDate) + '<br><span class="history-time">' + escapeHtml(obs.newMoonTime) + '</span></td>';
            html += '<td>' + (obs.observationDate ? formatHistoryDate(obs.observationDate) : '—') + '</td>';
            html += '<td><span class="visibility-badge ' + statusBadge + ' history-badge"><span class="badge-dot"></span>' + getStatusLabel(obs.status) + '</span></td>';
            html += '<td class="history-details">';
            if (obs.details.moonAge) html += 'Age: ' + escapeHtml(obs.details.moonAge) + '<br>';
            if (obs.details.lagMinutes) html += 'Lag: ' + obs.details.lagMinutes + ' min<br>';
            if (obs.details.elongation) html += 'Elong: ' + obs.details.elongation + '°';
            html += '</td>';
            html += '</tr>';
        }
        tbody.innerHTML = html;
    }

    function formatHistoryDate(dateStr) {
        if (!dateStr) return '—';
        var parts = dateStr.split('-');
        if (parts.length !== 3) return escapeHtml(dateStr);
        var months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
                      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        var m = parseInt(parts[1], 10);
        return parseInt(parts[2], 10) + ' ' + months[m - 1] + ' ' + parts[0];
    }

    function getStatusLabel(status) {
        if (status === 'visible') return 'VISIBLE';
        if (status === 'marginal') return 'MARGINAL';
        return 'NON VISIBLE';
    }

    // --- Hijri date display ---
    function updateHijriDate() {
        var now = new Date();
        var hijri = Hijri.gregorianToHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
        var formatted = Hijri.format(hijri, 'en');
        var formattedAr = Hijri.format(hijri, 'ar');

        el('hijri-date').textContent = formatted;
        el('hijri-date-ar').textContent = formattedAr;
    }

    // --- Public API ---
    return {
        init: init,
        applyPosition: applyPosition
    };
})();

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
