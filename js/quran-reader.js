/* =====================================================
   Quran Reader — Riwayat Warsh
   Lecteur Coran avec Hizb, signets multiples, cache IndexedDB
   ===================================================== */
var QuranReader = (function() {
    'use strict';

    var DB_NAME = 'hilal-quran';
    var DB_VERSION = 1;
    var STORE_NAME = 'suras';
    var BOOKMARKS_KEY = 'quran-bookmarks';
    var LAST_POS_KEY = 'quran-last-position';
    var API_BASE = 'https://api.alquran.cloud/v1/surah/';
    var EDITION = 'quran-uthmani';

    // 114 sourates : [numéro, nom arabe, nom latin, nombre ayahs, mecquoise(0)/médinoise(1)]
    var SURAS = [
        [1,'الفاتحة','Al-Fatiha',7,0],[2,'البقرة','Al-Baqara',286,1],
        [3,'آل عمران','Al-Imran',200,1],[4,'النساء','An-Nisa',176,1],
        [5,'المائدة','Al-Ma\'ida',120,1],[6,'الأنعام','Al-An\'am',165,0],
        [7,'الأعراف','Al-A\'raf',206,0],[8,'الأنفال','Al-Anfal',75,1],
        [9,'التوبة','At-Tawba',129,1],[10,'يونس','Yunus',109,0],
        [11,'هود','Hud',123,0],[12,'يوسف','Yusuf',111,0],
        [13,'الرعد','Ar-Ra\'d',43,1],[14,'إبراهيم','Ibrahim',52,0],
        [15,'الحجر','Al-Hijr',99,0],[16,'النحل','An-Nahl',128,0],
        [17,'الإسراء','Al-Isra',111,0],[18,'الكهف','Al-Kahf',110,0],
        [19,'مريم','Maryam',98,0],[20,'طه','Ta-Ha',135,0],
        [21,'الأنبياء','Al-Anbiya',112,0],[22,'الحج','Al-Hajj',78,1],
        [23,'المؤمنون','Al-Mu\'minun',118,0],[24,'النور','An-Nur',64,1],
        [25,'الفرقان','Al-Furqan',77,0],[26,'الشعراء','Ash-Shu\'ara',227,0],
        [27,'النمل','An-Naml',93,0],[28,'القصص','Al-Qasas',88,0],
        [29,'العنكبوت','Al-\'Ankabut',69,0],[30,'الروم','Ar-Rum',60,0],
        [31,'لقمان','Luqman',34,0],[32,'السجدة','As-Sajda',30,0],
        [33,'الأحزاب','Al-Ahzab',73,1],[34,'سبأ','Saba',54,0],
        [35,'فاطر','Fatir',45,0],[36,'يس','Ya-Sin',83,0],
        [37,'الصافات','As-Saffat',182,0],[38,'ص','Sad',88,0],
        [39,'الزمر','Az-Zumar',75,0],[40,'غافر','Ghafir',85,0],
        [41,'فصّلت','Fussilat',54,0],[42,'الشورى','Ash-Shura',53,0],
        [43,'الزخرف','Az-Zukhruf',89,0],[44,'الدخان','Ad-Dukhan',59,0],
        [45,'الجاثية','Al-Jathiya',37,0],[46,'الأحقاف','Al-Ahqaf',35,0],
        [47,'محمد','Muhammad',38,1],[48,'الفتح','Al-Fath',29,1],
        [49,'الحجرات','Al-Hujurat',18,1],[50,'ق','Qaf',45,0],
        [51,'الذاريات','Adh-Dhariyat',60,0],[52,'الطور','At-Tur',49,0],
        [53,'النجم','An-Najm',62,0],[54,'القمر','Al-Qamar',55,0],
        [55,'الرحمن','Ar-Rahman',78,1],[56,'الواقعة','Al-Waqi\'a',96,0],
        [57,'الحديد','Al-Hadid',29,1],[58,'المجادلة','Al-Mujadila',22,1],
        [59,'الحشر','Al-Hashr',24,1],[60,'الممتحنة','Al-Mumtahina',13,1],
        [61,'الصف','As-Saff',14,1],[62,'الجمعة','Al-Jumu\'a',11,1],
        [63,'المنافقون','Al-Munafiqun',11,1],[64,'التغابن','At-Taghabun',18,1],
        [65,'الطلاق','At-Talaq',12,1],[66,'التحريم','At-Tahrim',12,1],
        [67,'الملك','Al-Mulk',30,0],[68,'القلم','Al-Qalam',52,0],
        [69,'الحاقّة','Al-Haaqqa',52,0],[70,'المعارج','Al-Ma\'arij',44,0],
        [71,'نوح','Nuh',28,0],[72,'الجن','Al-Jinn',28,0],
        [73,'المزّمّل','Al-Muzzammil',20,0],[74,'المدّثّر','Al-Muddaththir',56,0],
        [75,'القيامة','Al-Qiyama',40,0],[76,'الإنسان','Al-Insan',31,1],
        [77,'المرسلات','Al-Mursalat',50,0],[78,'النبأ','An-Naba',40,0],
        [79,'النازعات','An-Nazi\'at',46,0],[80,'عبس','Abasa',42,0],
        [81,'التكوير','At-Takwir',29,0],[82,'الانفطار','Al-Infitar',19,0],
        [83,'المطفّفين','Al-Mutaffifin',36,0],[84,'الانشقاق','Al-Inshiqaq',25,0],
        [85,'البروج','Al-Buruj',22,0],[86,'الطارق','At-Tariq',17,0],
        [87,'الأعلى','Al-A\'la',19,0],[88,'الغاشية','Al-Ghashiya',26,0],
        [89,'الفجر','Al-Fajr',30,0],[90,'البلد','Al-Balad',20,0],
        [91,'الشمس','Ash-Shams',15,0],[92,'الليل','Al-Layl',21,0],
        [93,'الضحى','Ad-Duha',11,0],[94,'الشرح','Ash-Sharh',8,0],
        [95,'التين','At-Tin',8,0],[96,'العلق','Al-Alaq',19,0],
        [97,'القدر','Al-Qadr',5,0],[98,'البيّنة','Al-Bayyina',8,1],
        [99,'الزلزلة','Az-Zalzala',8,1],[100,'العاديات','Al-Adiyat',11,0],
        [101,'القارعة','Al-Qari\'a',11,0],[102,'التكاثر','At-Takathur',8,0],
        [103,'العصر','Al-Asr',3,0],[104,'الهمزة','Al-Humaza',9,0],
        [105,'الفيل','Al-Fil',5,0],[106,'قريش','Quraysh',4,0],
        [107,'الماعون','Al-Ma\'un',7,0],[108,'الكوثر','Al-Kawthar',3,0],
        [109,'الكافرون','Al-Kafirun',6,0],[110,'النصر','An-Nasr',3,1],
        [111,'المسد','Al-Masad',5,0],[112,'الإخلاص','Al-Ikhlas',4,0],
        [113,'الفلق','Al-Falaq',5,0],[114,'الناس','An-Nas',6,1]
    ];

    // ── Données Hizb ──
    // 240 marqueurs (60 Ahzab × 4 quarts) : tableau plat [sourate, ayah, sourate, ayah, ...]
    // Chaque groupe de 8 valeurs = 1 Hizb (حزب, ربع, نصف, ¾)
    // Ref: Mushaf standard (Complexe Roi Fahd / Mushaf Warsh Maghrébin)
    var HIZB_FLAT = [
        // H1                       H2
        1,1, 2,26, 2,44, 2,60,     2,75, 2,92, 2,106, 2,124,
        // H3                       H4
        2,142, 2,158, 2,177, 2,189, 2,203, 2,219, 2,233, 2,243,
        // H5                       H6
        2,253, 2,263, 2,272, 2,283, 3,1, 3,15, 3,33, 3,52,
        // H7                       H8
        3,75, 3,93, 3,113, 3,133,   3,153, 3,171, 3,186, 4,1,
        // H9                       H10
        4,12, 4,24, 4,36, 4,58,    4,74, 4,88, 4,100, 4,114,
        // H11                      H12
        4,135, 4,148, 4,163, 5,1,  5,12, 5,27, 5,41, 5,51,
        // H13                      H14
        5,67, 5,82, 5,97, 5,109,   6,1, 6,13, 6,36, 6,59,
        // H15                      H16
        6,74, 6,95, 6,111, 6,127,  6,141, 6,151, 6,159, 7,1,
        // H17                      H18
        7,31, 7,47, 7,65, 7,88,    7,117, 7,142, 7,156, 7,171,
        // H19                      H20
        7,189, 8,1, 8,22, 8,41,    8,61, 9,1, 9,19, 9,34,
        // H21                      H22
        9,46, 9,60, 9,75, 9,93,    9,111, 9,122, 10,1, 10,26,
        // H23                      H24
        10,53, 10,71, 10,90, 11,6, 11,24, 11,41, 11,61, 11,84,
        // H25                      H26
        11,108, 12,7, 12,30, 12,53, 12,77, 12,101, 13,5, 13,19,
        // H27                      H28
        13,35, 14,10, 14,28, 15,1, 15,50, 15,80, 16,1, 16,30,
        // H29                      H30
        16,51, 16,75, 16,90, 16,111, 17,1, 17,23, 17,50, 17,70,
        // H31                      H32
        17,99, 18,17, 18,32, 18,51, 18,75, 19,1, 19,22, 19,59,
        // H33                      H34
        19,96, 20,55, 20,83, 20,111, 21,1, 21,29, 21,51, 21,83,
        // H35                      H36
        22,1, 22,19, 22,38, 22,60, 23,1, 23,36, 23,75, 24,1,
        // H37                      H38
        24,21, 24,35, 24,53, 24,62, 25,21, 25,53, 26,1, 26,52,
        // H39                      H40
        26,111, 26,181, 27,1, 27,27, 27,56, 27,82, 28,12, 28,29,
        // H41                      H42
        28,51, 28,76, 29,1, 29,26, 29,46, 30,1, 30,31, 30,54,
        // H43                      H44
        31,22, 32,1, 32,21, 33,18, 33,31, 33,51, 33,60, 34,10,
        // H45                      H46
        34,24, 34,46, 35,15, 35,41, 36,28, 36,60, 37,22, 37,83,
        // H47                      H48
        37,145, 38,21, 38,52, 39,8, 39,32, 39,53, 40,1, 40,21,
        // H49                      H50
        40,41, 40,66, 41,9, 41,25, 41,47, 42,13, 42,27, 42,51,
        // H51                      H52
        43,24, 43,57, 44,17, 45,12, 46,1, 46,21, 47,10, 47,33,
        // H53                      H54
        48,18, 49,1, 49,14, 50,27, 51,31, 52,24, 53,26, 54,28,
        // H55                      H56
        55,33, 56,39, 56,75, 57,16, 58,1, 58,14, 59,11, 60,7,
        // H57                      H58
        61,1, 62,6, 63,4, 65,1,    66,1, 67,1, 68,1, 69,1,
        // H59                      H60
        70,19, 72,1, 73,20, 75,1,  77,1, 80,1, 84,1, 90,1
    ];

    // Labels des huitièmes de Hizb (8 subdivisions)
    var EIGHTH_LABELS = [
        { ar: '\u062d\u0632\u0628', fr: 'Hizb' },            // 0 = حزب
        { ar: '\u062b\u0645\u0646', fr: '1/8' },              // 1 = ثمن
        { ar: '\u0631\u0628\u0639', fr: '1/4' },              // 2 = ربع
        { ar: '\u062b\u0645\u0646', fr: '3/8' },              // 3 = ثمن
        { ar: '\u0646\u0635\u0641', fr: '1/2' },              // 4 = نصف
        { ar: '\u062b\u0645\u0646', fr: '5/8' },              // 5 = ثمن
        { ar: '\u00be', fr: '3/4' },                           // 6 = ¾
        { ar: '\u062b\u0645\u0646', fr: '7/8' }               // 7 = ثمن
    ];

    var BISMILLAH = '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650';

    var currentSura = null;
    var db = null;
    var hizbLookup = {};

    // ── Position linéaire (pour calcul des ثمن) ──
    function posToLinear(s, a) {
        var idx = 0;
        for (var i = 1; i < s; i++) idx += SURAS[i - 1][3];
        return idx + a;
    }

    function linearToPos(idx) {
        for (var i = 0; i < SURAS.length; i++) {
            if (idx <= SURAS[i][3]) return { sura: i + 1, ayah: idx };
            idx -= SURAS[i][3];
        }
        return { sura: 114, ayah: SURAS[113][3] };
    }

    // ── Construire le lookup Hizb avec ثمن ──
    function buildHizbLookup() {
        hizbLookup = {};
        var totalQ = HIZB_FLAT.length / 2; // 240 quarts

        // Ajouter les marqueurs de quart (indices pairs : 0,2,4,6)
        for (var m = 0; m < totalQ; m++) {
            var s = HIZB_FLAT[m * 2], a = HIZB_FLAT[m * 2 + 1];
            var hizb = Math.floor(m / 4) + 1;
            var quarter = m % 4;
            var juz = Math.ceil(hizb / 2);
            hizbLookup[s + ':' + a] = { hizb: hizb, eighth: quarter * 2, juz: juz };
        }

        // Calculer et ajouter les ثمن (indices impairs : 1,3,5,7)
        for (var m = 0; m < totalQ; m++) {
            var s1 = HIZB_FLAT[m * 2], a1 = HIZB_FLAT[m * 2 + 1];
            var s2, a2;
            if (m + 1 < totalQ) {
                s2 = HIZB_FLAT[(m + 1) * 2]; a2 = HIZB_FLAT[(m + 1) * 2 + 1];
            } else {
                s2 = 114; a2 = 6; // fin du Coran
            }
            var l1 = posToLinear(s1, a1);
            var l2 = posToLinear(s2, a2);
            var mid = linearToPos(Math.floor((l1 + l2) / 2));
            var hizb = Math.floor(m / 4) + 1;
            var quarter = m % 4;
            var juz = Math.ceil(hizb / 2);
            var key = mid.sura + ':' + mid.ayah;
            if (!hizbLookup[key]) {
                hizbLookup[key] = { hizb: hizb, eighth: quarter * 2 + 1, juz: juz };
            }
        }
    }

    function getHizbInfo(suraNum, ayahNum) {
        return hizbLookup[suraNum + ':' + ayahNum] || null;
    }

    // Trouver le Juz/Hizb courant pour une sourate donnée
    function getSuraHizbInfo(suraNum) {
        // Parcourir les marqueurs pour trouver le dernier avant cette sourate
        var lastHizb = 1, lastJuz = 1;
        for (var i = 0; i < HIZB_FLAT.length; i += 2) {
            var s = HIZB_FLAT[i];
            var a = HIZB_FLAT[i + 1];
            if (s > suraNum || (s === suraNum && a > 1)) break;
            var qIdx = i / 2;
            lastHizb = Math.floor(qIdx / 4) + 1;
            lastJuz = Math.ceil(lastHizb / 2);
        }
        return { hizb: lastHizb, juz: lastJuz };
    }

    // ── Chiffres arabes ──
    function toArabicNum(n) {
        var digits = '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669';
        return String(n).replace(/\d/g, function(d) { return digits[d]; });
    }

    // ── IndexedDB ──
    function openDB() {
        return new Promise(function(resolve, reject) {
            if (db) { resolve(db); return; }
            var req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = function(e) {
                e.target.result.createObjectStore(STORE_NAME, { keyPath: 'number' });
            };
            req.onsuccess = function(e) { db = e.target.result; resolve(db); };
            req.onerror = function() { reject(req.error); };
        });
    }

    function getCached(number) {
        return openDB().then(function(db) {
            return new Promise(function(resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readonly');
                var req = tx.objectStore(STORE_NAME).get(number);
                req.onsuccess = function() { resolve(req.result || null); };
                req.onerror = function() { reject(req.error); };
            });
        });
    }

    function cacheSura(number, ayahs) {
        return openDB().then(function(db) {
            return new Promise(function(resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put({ number: number, ayahs: ayahs });
                tx.oncomplete = function() { resolve(); };
                tx.onerror = function() { reject(tx.error); };
            });
        });
    }

    function countCached() {
        return openDB().then(function(db) {
            return new Promise(function(resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readonly');
                var req = tx.objectStore(STORE_NAME).count();
                req.onsuccess = function() { resolve(req.result); };
                req.onerror = function() { reject(req.error); };
            });
        });
    }

    // ── API ──
    function fetchSura(number) {
        return getCached(number).then(function(cached) {
            if (cached) return cached.ayahs;
            return fetch(API_BASE + number + '/' + EDITION)
                .then(function(r) { return r.json(); })
                .then(function(json) {
                    if (json.code !== 200) throw new Error('API error');
                    var ayahs = json.data.ayahs.map(function(a) {
                        return { number: a.numberInSurah, text: a.text };
                    });
                    cacheSura(number, ayahs);
                    return ayahs;
                });
        });
    }

    // ── Signets multiples ──
    function getBookmarks() {
        try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || []; }
        catch(e) { return []; }
    }

    function saveBookmarks(bms) {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bms));
    }

    function addBookmark(sura, ayah) {
        var bms = getBookmarks();
        // Éviter les doublons exacts
        var exists = bms.some(function(b) { return b.sura === sura && b.ayah === ayah; });
        if (exists) {
            showToast('Signet déjà enregistré');
            return;
        }
        var s = SURAS[sura - 1];
        var info = getHizbInfo(sura, ayah);
        var hizbText = info ? ' (Hizb ' + info.hizb + ')' : '';
        bms.unshift({
            id: Date.now(),
            sura: sura,
            ayah: ayah,
            suraName: s[1],
            suraLatin: s[2],
            hizbInfo: hizbText,
            date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        });
        // Max 50 signets
        if (bms.length > 50) bms = bms.slice(0, 50);
        saveBookmarks(bms);
        updateBookmarksList();
        showToast('Signet ajouté : ' + s[1] + ' — Ayah ' + toArabicNum(ayah));
    }

    function removeBookmark(id) {
        var bms = getBookmarks().filter(function(b) { return b.id !== id; });
        saveBookmarks(bms);
        updateBookmarksList();
        showToast('Signet supprimé');
    }

    function updateBookmarksList() {
        var container = document.getElementById('bookmarks-list');
        if (!container) return;

        var bms = getBookmarks();
        var btnResume = document.getElementById('btn-resume');
        var btnBookmarks = document.getElementById('btn-bookmarks');
        var badge = document.getElementById('bookmarks-count');

        if (btnResume) btnResume.style.display = bms.length > 0 ? 'inline-flex' : 'none';
        if (badge) badge.textContent = bms.length > 0 ? bms.length : '';

        if (bms.length === 0) {
            container.innerHTML = '<div class="bookmarks-empty">Aucun signet enregistré.<br>Cliquez sur une ayah pendant la lecture pour la marquer.</div>';
            return;
        }

        var html = '';
        for (var i = 0; i < bms.length; i++) {
            var b = bms[i];
            html += '<div class="bookmark-item" data-sura="' + b.sura + '" data-ayah="' + b.ayah + '">' +
                '<div class="bookmark-main">' +
                    '<div class="bookmark-sura">' + b.suraName + ' <span class="bookmark-latin">' + b.suraLatin + '</span></div>' +
                    '<div class="bookmark-detail">Ayah ' + toArabicNum(b.ayah) + (b.hizbInfo || '') + ' — ' + b.date + '</div>' +
                '</div>' +
                '<button class="bookmark-delete" data-id="' + b.id + '" title="Supprimer">&times;</button>' +
            '</div>';
        }
        container.innerHTML = html;
    }

    function toggleBookmarksPanel() {
        var panel = document.getElementById('bookmarks-panel');
        if (!panel) return;
        var isOpen = panel.classList.contains('open');
        panel.classList.toggle('open');
        if (!isOpen) updateBookmarksList();
    }

    // ── Rendu liste sourates ──
    function renderSuraList() {
        var container = document.getElementById('sura-list');
        if (!container) return;
        var html = '';
        for (var i = 0; i < SURAS.length; i++) {
            var s = SURAS[i];
            var type = s[4] === 0 ? 'Mecquoise' : 'Médinoise';
            var info = getSuraHizbInfo(s[0]);
            html += '<div class="sura-item" data-sura="' + s[0] + '">' +
                '<div class="sura-number">' + toArabicNum(s[0]) + '</div>' +
                '<div class="sura-info">' +
                    '<div class="sura-name-ar">' + s[1] + '</div>' +
                    '<div class="sura-name-lat">' + s[2] + '</div>' +
                '</div>' +
                '<div class="sura-meta">' +
                    '<span class="sura-ayahs">' + toArabicNum(s[3]) + ' ayahs</span>' +
                    '<span class="sura-juz">Juz ' + toArabicNum(info.juz) + '</span>' +
                    '<span class="sura-type sura-type-' + (s[4] === 0 ? 'mec' : 'med') + '">' + type + '</span>' +
                '</div>' +
            '</div>';
        }
        container.innerHTML = html;

        container.addEventListener('click', function(e) {
            var item = e.target.closest('.sura-item');
            if (item) goToSura(parseInt(item.dataset.sura));
        });
    }

    // ── Rendu Hizb marker HTML ──
    function hizbMarkerHTML(info) {
        var label = EIGHTH_LABELS[info.eighth];
        var juz = Math.ceil(info.hizb / 2);
        var cls = 'hizb-marker hizb-e-' + info.eighth;
        var arLabel = '';

        if (info.eighth === 0) {
            arLabel = '\u062d\u0632\u0628 ' + toArabicNum(info.hizb);
        } else {
            arLabel = label.ar + ' \u062d\u0632\u0628 ' + toArabicNum(info.hizb);
        }

        return '<div class="' + cls + '">' +
            '<span class="hizb-icon">\u06DE</span> ' +
            '<span class="hizb-label-ar">' + arLabel + '</span>' +
            '<span class="hizb-label-fr">' + label.fr + ' ' + info.hizb + ' \u2014 Juz ' + juz + '</span>' +
        '</div>';
    }

    // ── Rendu lecture sourate ──
    function renderReading(suraNum, ayahs) {
        var s = SURAS[suraNum - 1];
        var info = getSuraHizbInfo(suraNum);
        document.getElementById('reading-sura-name').textContent = s[1];
        document.getElementById('reading-sura-latin').textContent = s[2];
        document.getElementById('reading-sura-info').textContent =
            (s[4] === 0 ? 'Mecquoise' : 'Médinoise') + ' — ' +
            toArabicNum(s[3]) + ' ayahs — Juz ' + toArabicNum(info.juz) + ' — Hizb ' + toArabicNum(info.hizb);

        var contentEl = document.getElementById('reading-content');
        var html = '';

        // Bismillah (toutes sauf At-Tawba et Al-Fatiha qui l'a dans son texte)
        if (suraNum !== 1 && suraNum !== 9) {
            html += '<div class="bismillah">' + BISMILLAH + '</div>';
        }

        // Trouver les ayahs bookmarkées dans cette sourate
        var bms = getBookmarks();
        var bookmarkedAyahs = {};
        bms.forEach(function(b) {
            if (b.sura === suraNum) bookmarkedAyahs[b.ayah] = true;
        });

        for (var i = 0; i < ayahs.length; i++) {
            var a = ayahs[i];

            // Vérifier marqueur Hizb
            var hInfo = getHizbInfo(suraNum, a.number);
            if (hInfo) {
                html += hizbMarkerHTML(hInfo);
            }

            var bmClass = bookmarkedAyahs[a.number] ? ' bookmarked' : '';
            html += '<span class="ayah' + bmClass + '" id="ayah-' + a.number + '">' +
                a.text +
                ' <span class="ayah-num">\uFD3F' + toArabicNum(a.number) + '\uFD3E</span>' +
                '</span> ';
        }

        contentEl.innerHTML = html;

        // Clic sur une ayah pour sauvegarder un signet
        contentEl.addEventListener('click', function(e) {
            // Ignorer les clics sur les marqueurs Hizb
            if (e.target.closest('.hizb-marker')) return;

            var ayahEl = e.target.closest('.ayah');
            if (!ayahEl) return;
            var num = parseInt(ayahEl.id.replace('ayah-', ''));
            addBookmark(suraNum, num);
            ayahEl.classList.add('bookmarked');
        });

        // Navigation prev/next
        document.getElementById('btn-prev-sura').disabled = suraNum <= 1;
        document.getElementById('btn-next-sura').disabled = suraNum >= 114;

        // Sura selector
        var selector = document.getElementById('sura-selector');
        selector.value = suraNum;
    }

    function showToast(msg) {
        var toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 2000);
    }

    // ── Sauvegarde / Restauration de la position ──
    function saveLastPosition() {
        if (!currentSura) return;
        var scrollY = window.scrollY || window.pageYOffset || 0;
        var data = { sura: currentSura, scrollY: scrollY, time: Date.now() };
        try { localStorage.setItem(LAST_POS_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
    }

    function getLastPosition() {
        try { return JSON.parse(localStorage.getItem(LAST_POS_KEY)) || null; }
        catch (e) { return null; }
    }

    // ── Navigation ──
    function goToSura(number, targetAyah) {
        if (number < 1 || number > 114) return;
        saveLastPosition(); // sauvegarder la position avant de changer
        currentSura = number;

        // Fermer le panneau signets si ouvert
        var panel = document.getElementById('bookmarks-panel');
        if (panel) panel.classList.remove('open');

        // Afficher vue lecture
        document.getElementById('view-list').style.display = 'none';
        document.getElementById('view-reading').style.display = 'block';

        var contentEl = document.getElementById('reading-content');
        contentEl.innerHTML = '<div class="loading-quran"><div class="loading-spinner-q"></div><p>Chargement de la sourate...</p></div>';

        fetchSura(number).then(function(ayahs) {
            renderReading(number, ayahs);
            window.scrollTo(0, 0);

            // Scroller vers l'ayah cible si spécifiée
            if (targetAyah) {
                setTimeout(function() {
                    var ayahEl = document.getElementById('ayah-' + targetAyah);
                    if (ayahEl) {
                        ayahEl.classList.add('highlight-scroll');
                        ayahEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(function() { ayahEl.classList.remove('highlight-scroll'); }, 3000);
                    }
                }, 100);
            }
        }).catch(function(err) {
            contentEl.innerHTML = '<div class="quran-error">' +
                '<p>Impossible de charger la sourate.</p>' +
                '<p>Vérifiez votre connexion internet.</p>' +
                '<button class="btn-retry" onclick="QuranReader.goToSura(' + number + ')">Réessayer</button>' +
                '</div>';
        });
    }

    function goToList() {
        document.getElementById('view-list').style.display = 'block';
        document.getElementById('view-reading').style.display = 'none';
        var panel = document.getElementById('bookmarks-panel');
        if (panel) panel.classList.remove('open');
        window.scrollTo(0, 0);
    }

    function resumeReading() {
        var bms = getBookmarks();
        if (bms.length > 0) {
            goToSura(bms[0].sura, bms[0].ayah);
        }
    }

    // ── Téléchargement hors-ligne ──
    function downloadAll() {
        var btn = document.getElementById('btn-download-all');
        var progress = document.getElementById('download-progress');
        if (!btn || !progress) return;

        btn.disabled = true;
        btn.textContent = 'Téléchargement...';
        progress.style.display = 'block';

        var done = 0;
        var total = 114;

        function downloadNext(i) {
            if (i > total) {
                btn.textContent = 'Hors-ligne (114/114)';
                progress.querySelector('.progress-fill').style.width = '100%';
                progress.querySelector('.progress-text').textContent = '114/114 sourates';
                showToast('Coran téléchargé pour lecture hors-ligne');
                return;
            }
            fetchSura(i).then(function() {
                done++;
                var pct = Math.round(done / total * 100);
                progress.querySelector('.progress-fill').style.width = pct + '%';
                progress.querySelector('.progress-text').textContent = done + '/' + total + ' sourates';
                downloadNext(i + 1);
            }).catch(function() {
                setTimeout(function() { downloadNext(i); }, 1000);
            });
        }

        downloadNext(1);
    }

    // ── Recherche sourate ──
    function filterSuras(query) {
        var items = document.querySelectorAll('.sura-item');
        var q = query.toLowerCase().trim();
        items.forEach(function(item) {
            var num = item.dataset.sura;
            var s = SURAS[num - 1];
            var match = !q ||
                String(num).indexOf(q) !== -1 ||
                s[1].indexOf(q) !== -1 ||
                s[2].toLowerCase().indexOf(q) !== -1;
            item.style.display = match ? '' : 'none';
        });
    }

    // ── Sura selector ──
    function buildSuraSelector() {
        var selector = document.getElementById('sura-selector');
        if (!selector) return;
        for (var i = 0; i < SURAS.length; i++) {
            var s = SURAS[i];
            var opt = document.createElement('option');
            opt.value = s[0];
            opt.textContent = s[0] + '. ' + s[1] + ' — ' + s[2];
            selector.appendChild(opt);
        }
        selector.addEventListener('change', function() {
            goToSura(parseInt(this.value));
        });
    }

    // ── Init ──
    function init() {
        buildHizbLookup();
        renderSuraList();
        buildSuraSelector();
        updateBookmarksList();

        // Bouton retour
        document.getElementById('btn-back-list').addEventListener('click', goToList);

        // Navigation prev/next
        document.getElementById('btn-prev-sura').addEventListener('click', function() {
            if (currentSura > 1) goToSura(currentSura - 1);
        });
        document.getElementById('btn-next-sura').addEventListener('click', function() {
            if (currentSura < 114) goToSura(currentSura + 1);
        });

        // Reprendre (dernier signet)
        document.getElementById('btn-resume').addEventListener('click', resumeReading);

        // Signets panel
        document.getElementById('btn-bookmarks').addEventListener('click', toggleBookmarksPanel);

        // Déléguer clics sur la liste des signets
        document.getElementById('bookmarks-list').addEventListener('click', function(e) {
            var delBtn = e.target.closest('.bookmark-delete');
            if (delBtn) {
                e.stopPropagation();
                removeBookmark(parseInt(delBtn.dataset.id));
                return;
            }
            var item = e.target.closest('.bookmark-item');
            if (item) {
                goToSura(parseInt(item.dataset.sura), parseInt(item.dataset.ayah));
            }
        });

        // Télécharger tout
        document.getElementById('btn-download-all').addEventListener('click', downloadAll);

        // Recherche
        document.getElementById('search-sura').addEventListener('input', function() {
            filterSuras(this.value);
        });

        // Vérifier combien sont en cache
        countCached().then(function(n) {
            if (n >= 114) {
                var btn = document.getElementById('btn-download-all');
                btn.textContent = 'Hors-ligne (114/114)';
                btn.disabled = true;
            }
        });

        // ── Auto-reprise : sauvegarder la position en quittant ──
        window.addEventListener('beforeunload', saveLastPosition);
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) saveLastPosition();
        });

        // ── Auto-reprise : restaurer la dernière position au lancement ──
        var lastPos = getLastPosition();
        if (lastPos && lastPos.sura) {
            goToSura(lastPos.sura);
            // Restaurer le scroll après le chargement de la sourate
            var savedScrollY = lastPos.scrollY || 0;
            if (savedScrollY > 0) {
                var checkInterval = setInterval(function() {
                    var content = document.getElementById('reading-content');
                    if (content && !content.querySelector('.loading-quran')) {
                        clearInterval(checkInterval);
                        setTimeout(function() {
                            window.scrollTo(0, savedScrollY);
                        }, 50);
                    }
                }, 100);
                // Timeout de sécurité
                setTimeout(function() { clearInterval(checkInterval); }, 5000);
            }
        }
    }

    return {
        init: init,
        goToSura: goToSura,
        goToList: goToList,
        resumeReading: resumeReading
    };
})();

document.addEventListener('DOMContentLoaded', QuranReader.init);
