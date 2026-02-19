/* =====================================================
   Quran Reader — Riwayat Warsh
   Lecteur Coran avec cache IndexedDB + sauvegarde avancement
   ===================================================== */
var QuranReader = (function() {
    'use strict';

    var DB_NAME = 'hilal-quran';
    var DB_VERSION = 1;
    var STORE_NAME = 'suras';
    var BOOKMARK_KEY = 'quran-bookmark';
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

    var BISMILLAH = '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650';

    var currentSura = null;
    var db = null;

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

    // ── Bookmark ──
    function saveBookmark(sura, ayah, scrollPos) {
        var bm = { sura: sura, ayah: ayah, scroll: scrollPos || 0, date: Date.now() };
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bm));
        updateBookmarkUI();
    }

    function getBookmark() {
        try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY)); }
        catch(e) { return null; }
    }

    function updateBookmarkUI() {
        var bm = getBookmark();
        var el = document.getElementById('bookmark-info');
        if (!el) return;
        if (bm) {
            var s = SURAS[bm.sura - 1];
            el.innerHTML = 'Signet : Sourate ' + s[1] + ' (' + s[2] + '), Ayah ' + toArabicNum(bm.ayah);
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    }

    // ── Rendu liste sourates ──
    function renderSuraList() {
        var container = document.getElementById('sura-list');
        if (!container) return;
        var html = '';
        for (var i = 0; i < SURAS.length; i++) {
            var s = SURAS[i];
            var type = s[4] === 0 ? 'Mecquoise' : 'Médinoise';
            html += '<div class="sura-item" data-sura="' + s[0] + '">' +
                '<div class="sura-number">' + toArabicNum(s[0]) + '</div>' +
                '<div class="sura-info">' +
                    '<div class="sura-name-ar">' + s[1] + '</div>' +
                    '<div class="sura-name-lat">' + s[2] + '</div>' +
                '</div>' +
                '<div class="sura-meta">' +
                    '<span class="sura-ayahs">' + toArabicNum(s[3]) + ' ayahs</span>' +
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

    // ── Rendu lecture sourate ──
    function renderReading(suraNum, ayahs) {
        var s = SURAS[suraNum - 1];
        document.getElementById('reading-sura-name').textContent = s[1];
        document.getElementById('reading-sura-latin').textContent = s[2];
        document.getElementById('reading-sura-info').textContent =
            (s[4] === 0 ? 'Mecquoise' : 'Médinoise') + ' — ' + toArabicNum(s[3]) + ' ayahs';

        var contentEl = document.getElementById('reading-content');
        var html = '';

        // Bismillah (toutes sauf At-Tawba et Al-Fatiha qui l'a dans son texte)
        if (suraNum !== 1 && suraNum !== 9) {
            html += '<div class="bismillah">' + BISMILLAH + '</div>';
        }

        for (var i = 0; i < ayahs.length; i++) {
            var a = ayahs[i];
            html += '<span class="ayah" id="ayah-' + a.number + '">' +
                a.text +
                ' <span class="ayah-num">\uFD3F' + toArabicNum(a.number) + '\uFD3E</span>' +
                '</span> ';
        }

        contentEl.innerHTML = html;

        // Clic sur une ayah pour la marquer
        contentEl.addEventListener('click', function(e) {
            var ayahEl = e.target.closest('.ayah');
            if (!ayahEl) return;
            var num = parseInt(ayahEl.id.replace('ayah-', ''));
            saveBookmark(suraNum, num, window.scrollY);
            // Feedback visuel
            document.querySelectorAll('.ayah.bookmarked').forEach(function(el) {
                el.classList.remove('bookmarked');
            });
            ayahEl.classList.add('bookmarked');
            showToast('Signet enregistré : Ayah ' + toArabicNum(num));
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

    // ── Navigation ──
    function goToSura(number) {
        if (number < 1 || number > 114) return;
        currentSura = number;

        // Afficher vue lecture
        document.getElementById('view-list').style.display = 'none';
        document.getElementById('view-reading').style.display = 'block';

        var contentEl = document.getElementById('reading-content');
        contentEl.innerHTML = '<div class="loading-quran"><div class="loading-spinner-q"></div><p>Chargement de la sourate...</p></div>';

        fetchSura(number).then(function(ayahs) {
            renderReading(number, ayahs);
            window.scrollTo(0, 0);

            // Si c'est la sourate du signet, scroller vers l'ayah
            var bm = getBookmark();
            if (bm && bm.sura === number && bm.ayah) {
                setTimeout(function() {
                    var ayahEl = document.getElementById('ayah-' + bm.ayah);
                    if (ayahEl) {
                        ayahEl.classList.add('bookmarked');
                        ayahEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        window.scrollTo(0, 0);
    }

    function resumeReading() {
        var bm = getBookmark();
        if (bm) goToSura(bm.sura);
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
                btn.textContent = 'Téléchargé (114/114)';
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
                // Retry after brief pause
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

    // ── Sura selector (dropdown in reading view) ──
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
        renderSuraList();
        buildSuraSelector();
        updateBookmarkUI();

        // Bouton retour
        document.getElementById('btn-back-list').addEventListener('click', goToList);

        // Navigation prev/next
        document.getElementById('btn-prev-sura').addEventListener('click', function() {
            if (currentSura > 1) goToSura(currentSura - 1);
        });
        document.getElementById('btn-next-sura').addEventListener('click', function() {
            if (currentSura < 114) goToSura(currentSura + 1);
        });

        // Reprendre lecture
        document.getElementById('btn-resume').addEventListener('click', resumeReading);

        // Télécharger tout
        document.getElementById('btn-download-all').addEventListener('click', downloadAll);

        // Recherche
        document.getElementById('search-sura').addEventListener('input', function() {
            filterSuras(this.value);
        });

        // Afficher/masquer bouton reprendre
        var bm = getBookmark();
        document.getElementById('btn-resume').style.display = bm ? 'inline-flex' : 'none';

        // Vérifier combien sont en cache
        countCached().then(function(n) {
            if (n >= 114) {
                var btn = document.getElementById('btn-download-all');
                btn.textContent = 'Hors-ligne (114/114)';
                btn.disabled = true;
            }
        });
    }

    return {
        init: init,
        goToSura: goToSura,
        goToList: goToList,
        resumeReading: resumeReading
    };
})();

document.addEventListener('DOMContentLoaded', QuranReader.init);
