// ============================================================
// weather.js - Météo via Open-Meteo (ECMWF, sans clé API)
// https://open-meteo.com — données European Centre for
// Medium-Range Weather Forecasts
// ============================================================

var Weather = (function () {

    var API_BASE = 'https://api.open-meteo.com/v1/forecast';

    // Codes WMO → description française + icône
    var WMO_CODES = {
        0:  { fr: 'Ciel dégagé',          icon: '☀️' },
        1:  { fr: 'Principalement dégagé', icon: '🌤️' },
        2:  { fr: 'Partiellement nuageux', icon: '⛅' },
        3:  { fr: 'Couvert',              icon: '☁️' },
        45: { fr: 'Brouillard',           icon: '🌫️' },
        48: { fr: 'Brouillard givrant',    icon: '🌫️' },
        51: { fr: 'Bruine légère',         icon: '🌦️' },
        53: { fr: 'Bruine modérée',        icon: '🌦️' },
        55: { fr: 'Bruine dense',          icon: '🌧️' },
        56: { fr: 'Bruine verglaçante',    icon: '🌧️' },
        57: { fr: 'Bruine verglaçante',    icon: '🌧️' },
        61: { fr: 'Pluie légère',          icon: '🌦️' },
        63: { fr: 'Pluie modérée',         icon: '🌧️' },
        65: { fr: 'Pluie forte',           icon: '🌧️' },
        66: { fr: 'Pluie verglaçante',     icon: '🌧️' },
        67: { fr: 'Pluie verglaçante',     icon: '🌧️' },
        71: { fr: 'Neige légère',          icon: '🌨️' },
        73: { fr: 'Neige modérée',         icon: '🌨️' },
        75: { fr: 'Neige forte',           icon: '❄️' },
        77: { fr: 'Grains de neige',       icon: '❄️' },
        80: { fr: 'Averses légères',       icon: '🌦️' },
        81: { fr: 'Averses modérées',      icon: '🌧️' },
        82: { fr: 'Averses violentes',     icon: '🌧️' },
        85: { fr: 'Averses de neige',      icon: '🌨️' },
        86: { fr: 'Averses de neige',      icon: '🌨️' },
        95: { fr: 'Orage',                icon: '⛈️' },
        96: { fr: 'Orage avec grêle',      icon: '⛈️' },
        99: { fr: 'Orage violent',         icon: '⛈️' }
    };

    var DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    var DAYS_FR_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    function getWMO(code) {
        return WMO_CODES[code] || { fr: 'Inconnu', icon: '❓' };
    }

    // Récupérer météo actuelle + prévisions 7 jours
    function fetch(lat, lon, callback) {
        var url = API_BASE +
            '?latitude=' + lat +
            '&longitude=' + lon +
            '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m' +
            '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max' +
            '&timezone=auto' +
            '&forecast_days=7';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 8000;
        xhr.onload = function () {
            try {
                var data = JSON.parse(xhr.responseText);
                callback(null, data);
            } catch (e) {
                callback(e, null);
            }
        };
        xhr.onerror = function () { callback(new Error('Réseau indisponible'), null); };
        xhr.ontimeout = function () { callback(new Error('Délai dépassé'), null); };
        xhr.send();
    }

    // Direction du vent en texte
    function windDirection(deg) {
        var dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
        var idx = Math.round(deg / 45) % 8;
        return dirs[idx];
    }

    // Nom du jour depuis une date ISO (YYYY-MM-DD)
    function dayName(dateStr, full) {
        var parts = dateStr.split('-');
        var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return full ? DAYS_FR_FULL[d.getDay()] : DAYS_FR[d.getDay()];
    }

    // Formater la date courte (ex: "19 Fév")
    function shortDate(dateStr) {
        var months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        var parts = dateStr.split('-');
        return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1];
    }

    return {
        fetch: fetch,
        getWMO: getWMO,
        windDirection: windDirection,
        dayName: dayName,
        shortDate: shortDate
    };

})();
