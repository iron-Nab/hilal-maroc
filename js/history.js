// ============================================================
// history.js - Historique des observations du Hilal
// Sauvegarde en localStorage les prédictions de l'année en cours
// ============================================================

var History = (function () {

    var STORAGE_KEY = 'hilal_history';

    // Charger l'historique depuis localStorage
    function load() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            if (!data) return { year: new Date().getFullYear(), observations: [] };
            var parsed = JSON.parse(data);
            // Réinitialiser si l'année a changé
            if (parsed.year !== new Date().getFullYear()) {
                return { year: new Date().getFullYear(), observations: [] };
            }
            return parsed;
        } catch (e) {
            return { year: new Date().getFullYear(), observations: [] };
        }
    }

    // Sauvegarder l'historique
    function save(history) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (e) {
            console.error('Erreur sauvegarde historique:', e);
        }
    }

    // Ajouter ou mettre à jour une observation
    function addObservation(prediction) {
        var history = load();
        var nm = prediction.newMoon;
        var ev = prediction.bestEvening;
        if (!nm || !ev) return;

        var nmDate = nm.date;
        var key = nmDate.getUTCFullYear() + '-' +
                  pad2(nmDate.getUTCMonth() + 1) + '-' +
                  pad2(nmDate.getUTCDate());

        // Infos Hijri
        var hijriInfo = Hijri.hijriMonthForNewMoon(nm.date);
        var hijriMonthFr = Hijri.getMonthName(hijriInfo.month, 'en');
        var hijriMonthAr = Hijri.getMonthName(hijriInfo.month, 'ar');

        var entry = {
            key: key,
            newMoonDate: key,
            newMoonTime: pad2(nmDate.getUTCHours()) + ':' + pad2(nmDate.getUTCMinutes()) + ' UTC',
            hijriMonth: hijriMonthFr,
            hijriMonthAr: hijriMonthAr,
            hijriYear: hijriInfo.year,
            monthDuration: prediction.monthDuration,
            observationDate: null,
            status: 'non-visible',
            statusFr: 'Non visible',
            details: {}
        };

        if (ev.maroc) {
            entry.status = ev.status ? ev.status.status : 'non-visible';
            entry.statusFr = ev.maroc.labelFr || 'Non visible';
        }

        if (ev.date) {
            entry.observationDate = ev.date.year + '-' + pad2(ev.date.month) + '-' + pad2(ev.date.day);
        }

        entry.details = {
            moonAge: ev.moonAge ? formatMoonAge(ev.moonAge) : null,
            lagMinutes: ev.lagMinutes ? Math.round(ev.lagMinutes) : null,
            elongation: ev.ARCL ? ev.ARCL.toFixed(1) : null,
            moonAlt: ev.moonAlt ? ev.moonAlt.toFixed(1) : null
        };

        // Vérifier si cette entrée existe déjà (même clé)
        var found = false;
        for (var i = 0; i < history.observations.length; i++) {
            if (history.observations[i].key === key) {
                history.observations[i] = entry;
                found = true;
                break;
            }
        }

        if (!found) {
            history.observations.push(entry);
        }

        // Trier par date
        history.observations.sort(function (a, b) {
            return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
        });

        save(history);
    }

    // Sauvegarder toutes les prédictions d'un coup
    function saveAllPredictions(predictions) {
        var currentYear = new Date().getFullYear();
        for (var i = 0; i < predictions.length; i++) {
            var nm = predictions[i].newMoon;
            if (!nm || !nm.date) continue;
            // Ne garder que l'année en cours
            var nmYear = nm.date.getUTCFullYear();
            if (nmYear === currentYear || nmYear === currentYear - 1) {
                addObservation(predictions[i]);
            }
        }
    }

    // Obtenir toutes les observations de l'année
    function getObservations() {
        var history = load();
        return history.observations;
    }

    // Obtenir le résumé de l'année
    function getSummary() {
        var obs = getObservations();
        var total = obs.length;
        var visible = 0;
        var marginal = 0;
        var nonVisible = 0;

        for (var i = 0; i < obs.length; i++) {
            if (obs[i].status === 'visible') visible++;
            else if (obs[i].status === 'marginal') marginal++;
            else nonVisible++;
        }

        return {
            total: total,
            visible: visible,
            marginal: marginal,
            nonVisible: nonVisible
        };
    }

    function pad2(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    function formatMoonAge(hours) {
        if (hours < 0) return 'Avant conjonction';
        var h = Math.floor(hours);
        var m = Math.round((hours - h) * 60);
        return h + 'h ' + m + 'min';
    }

    return {
        load: load,
        addObservation: addObservation,
        saveAllPredictions: saveAllPredictions,
        getObservations: getObservations,
        getSummary: getSummary
    };
})();
