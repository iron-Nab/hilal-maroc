// ============================================================
// radio-data.js — Stations de radio du Coran
// Source : mp3quran.net / Qurango API
// ============================================================

var RadioData = {

    national: {
        label: 'إذاعات وطنية',
        icon: '🕌',
        stations: [
            { id: 'n1', name: 'إذاعة القرآن الكريم - السعودية', nameEn: 'Saudi Arabia', url: 'https://stream.radiojar.com/0tpy1h0kxtzuv', flag: '🇸🇦' },
            { id: 'n2', name: 'إذاعة القرآن الكريم - القاهرة', nameEn: 'Egypt (Cairo)', url: 'https://stream.radiojar.com/8s5u5tpdtwzuv', flag: '🇪🇬' },
            { id: 'n3', name: 'إذاعة الحرم المكي', nameEn: 'Masjid Al-Haram', url: 'https://backup.qurango.net/radio/mix', flag: '🕋' },
            { id: 'n4', name: 'إذاعة القرآن - الجزائر', nameEn: 'Algeria', url: 'https://webradio.tda.dz/Coran_64K.mp3', flag: '🇩🇿' },
            { id: 'n5', name: 'نداء الإسلام - السعودية', nameEn: 'Nidaa Al-Islam', url: 'https://backup.qurango.net/radio/salma', flag: '🇸🇦' }
        ]
    },

    popular: {
        label: 'قراء مشهورون',
        icon: '⭐',
        stations: [
            { id: 'p1', name: 'عبدالباسط عبدالصمد', nameEn: 'Abdulbasit Abdulsamad', url: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad', flag: '🇪🇬' },
            { id: 'p2', name: 'عبدالباسط عبدالصمد - مجوّد', nameEn: 'Abdulbasit - Mojawwad', url: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad', flag: '🇪🇬' },
            { id: 'p3', name: 'محمود خليل الحصري', nameEn: 'Mahmoud Khalil Al-Hussary', url: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary', flag: '🇪🇬' },
            { id: 'p4', name: 'محمد صديق المنشاوي', nameEn: 'Al-Minshawi', url: 'https://backup.qurango.net/radio/mohammed_siddiq_alminshawi', flag: '🇪🇬' },
            { id: 'p5', name: 'مشاري العفاسي', nameEn: 'Mishary Al-Afasi', url: 'https://backup.qurango.net/radio/mishary_alafasi', flag: '🇰🇼' },
            { id: 'p6', name: 'سعد الغامدي', nameEn: 'Saad Al-Ghamdi', url: 'https://backup.qurango.net/radio/saad_alghamdi', flag: '🇸🇦' },
            { id: 'p7', name: 'عبدالرحمن السديس', nameEn: 'Abdulrahman Al-Sudais', url: 'https://backup.qurango.net/radio/abdulrahman_alsudaes', flag: '🇸🇦' },
            { id: 'p8', name: 'سعود الشريم', nameEn: 'Saud Al-Shuraim', url: 'https://backup.qurango.net/radio/saud_alshuraim', flag: '🇸🇦' },
            { id: 'p9', name: 'ماهر المعيقلي', nameEn: 'Maher Al-Muaiqly', url: 'https://backup.qurango.net/radio/maher', flag: '🇸🇦' },
            { id: 'p10', name: 'محمد جبريل', nameEn: 'Muhammad Jibreel', url: 'https://backup.qurango.net/radio/mohammed_jibreel', flag: '🇪🇬' },
            { id: 'p11', name: 'ناصر القطامي', nameEn: 'Nasser Al-Qatami', url: 'https://backup.qurango.net/radio/nasser_alqatami', flag: '🇸🇦' },
            { id: 'p12', name: 'ياسر الدوسري', nameEn: 'Yasser Al-Dosari', url: 'https://backup.qurango.net/radio/yasser_aldosari', flag: '🇸🇦' },
            { id: 'p13', name: 'أحمد العجمي', nameEn: 'Ahmad Al-Ajmy', url: 'https://backup.qurango.net/radio/ahmad_alajmy', flag: '🇰🇼' },
            { id: 'p14', name: 'فارس عباد', nameEn: 'Fares Abbad', url: 'https://backup.qurango.net/radio/fares_abbad', flag: '🇸🇦' },
            { id: 'p15', name: 'هاني الرفاعي', nameEn: 'Hani Ar-Rifai', url: 'https://backup.qurango.net/radio/hani_arrifai', flag: '🇸🇦' },
            { id: 'p16', name: 'خالد الجليل', nameEn: 'Khalid Al-Jaleel', url: 'https://backup.qurango.net/radio/khalid_aljileel', flag: '🇸🇦' },
            { id: 'p17', name: 'محمود علي البنا', nameEn: 'Mahmoud Ali Al-Banna', url: 'https://backup.qurango.net/radio/mahmoud_ali__albanna', flag: '🇪🇬' },
            { id: 'p18', name: 'محمد أيوب', nameEn: 'Muhammad Ayyub', url: 'https://backup.qurango.net/radio/mohammed_ayyub', flag: '🇸🇦' },
            { id: 'p19', name: 'علي جابر', nameEn: 'Ali Jaber', url: 'https://backup.qurango.net/radio/ali_jaber', flag: '🇸🇦' },
            { id: 'p20', name: 'أبو بكر الشاطري', nameEn: 'Abu Bakr Al-Shatri', url: 'https://backup.qurango.net/radio/shaik_abu_bakr_al_shatri', flag: '🇸🇦' },
            { id: 'p21', name: 'صلاح بو خاطر', nameEn: 'Salah Bukhatir', url: 'https://backup.qurango.net/radio/slaah_bukhatir', flag: '🇦🇪' },
            { id: 'p22', name: 'بندر بليلة', nameEn: 'Bandar Balilah', url: 'https://backup.qurango.net/radio/bandar_balilah', flag: '🇸🇦' },
            { id: 'p23', name: 'مصطفى إسماعيل', nameEn: 'Mustafa Ismail', url: 'https://backup.qurango.net/radio/mustafa_ismail', flag: '🇪🇬' },
            { id: 'p24', name: 'محمد الطبلاوي', nameEn: 'Al-Tablawi', url: 'https://backup.qurango.net/radio/mohammad_altablaway', flag: '🇪🇬' }
        ]
    },

    warsh: {
        label: 'رواية ورش عن نافع',
        icon: '📖',
        stations: [
            { id: 'w1', name: 'عبدالباسط عبدالصمد - ورش', nameEn: 'Abdulbasit - Warsh', url: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad_warsh', flag: '🇪🇬' },
            { id: 'w2', name: 'محمود خليل الحصري - ورش', nameEn: 'Al-Hussary - Warsh', url: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary_warsh', flag: '🇪🇬' },
            { id: 'w3', name: 'عمر القزابري - ورش', nameEn: 'Omar Al-Qazabri - Warsh', url: 'https://backup.qurango.net/radio/omar_alqazabri', flag: '🇲🇦' },
            { id: 'w4', name: 'العيون الكوشي - ورش', nameEn: 'Al-Oyoon Al-Koshi - Warsh', url: 'https://backup.qurango.net/radio/aloyoon_alkoshi', flag: '🇲🇦' },
            { id: 'w5', name: 'القارئ ياسين - ورش', nameEn: 'Al-Qaria Yassin - Warsh', url: 'https://backup.qurango.net/radio/alqaria_yassen', flag: '🇲🇦' },
            { id: 'w6', name: 'إبراهيم الدوسري - ورش', nameEn: 'Ibrahim Al-Dosari - Warsh', url: 'https://backup.qurango.net/radio/ibrahim_aldosari', flag: '🇸🇦' },
            { id: 'w7', name: 'محمد عبدالكريم - ورش', nameEn: 'M. Abdulkarem - Warsh', url: 'https://backup.qurango.net/radio/mohammad_abdullkarem_alasbahani', flag: '🇱🇾' }
        ]
    },

    special: {
        label: 'برامج متنوعة',
        icon: '🌟',
        stations: [
            { id: 's1', name: 'الإذاعة العامة - مختلف القراء', nameEn: 'Mixed Reciters', url: 'https://backup.qurango.net/radio/mix', flag: '📻' },
            { id: 's2', name: 'تلاوات خاشعة', nameEn: 'Beautiful Recitations', url: 'https://backup.qurango.net/radio/salma', flag: '🤲' },
            { id: 's3', name: 'آيات السكينة', nameEn: 'Calm Recitations', url: 'https://backup.qurango.net/radio/sakeenah', flag: '🕊' },
            { id: 's4', name: 'تفسير القرآن الكريم', nameEn: 'Quran Tafseer', url: 'https://backup.qurango.net/radio/tafseer', flag: '📚' },
            { id: 's5', name: 'سورة البقرة', nameEn: 'Surah Al-Baqarah', url: 'https://backup.qurango.net/radio/albaqarah', flag: '📜' },
            { id: 's6', name: 'الرقية الشرعية', nameEn: 'Roqyah', url: 'https://backup.qurango.net/radio/roqiah', flag: '🛡' },
            { id: 's7', name: 'أذكار الصباح', nameEn: 'Morning Adhkar', url: 'https://backup.qurango.net/radio/athkar_sabah', flag: '☀️' },
            { id: 's8', name: 'أذكار المساء', nameEn: 'Evening Adhkar', url: 'https://backup.qurango.net/radio/athkar_masa', flag: '🌙' },
            { id: 's9', name: 'تراتيل قصيرة متميزة', nameEn: 'Short Recitations', url: 'https://backup.qurango.net/radio/tarateel', flag: '🎧' },
            { id: 's10', name: 'قصص الأنبياء', nameEn: 'Stories of the Prophets', url: 'https://backup.qurango.net/radio/alanbiya', flag: '📖' }
        ]
    },

    translation: {
        label: 'ترجمات',
        icon: '🌍',
        stations: [
            { id: 't1', name: 'ترجمة فرنسية', nameEn: 'French Translation', url: 'https://backup.qurango.net/radio/translation_quran_french', flag: '🇫🇷' },
            { id: 't2', name: 'ترجمة إنجليزية', nameEn: 'English Translation', url: 'https://backup.qurango.net/radio/translation_quran_english_basit', flag: '🇬🇧' },
            { id: 't3', name: 'ترجمة تركية', nameEn: 'Turkish Translation', url: 'https://backup.qurango.net/radio/translation_quran_turkish', flag: '🇹🇷' },
            { id: 't4', name: 'ترجمة أمازيغية', nameEn: 'Tamazight Translation', url: 'https://backup.qurango.net/radio/translation_quran_tamazight', flag: '🏔' },
            { id: 't5', name: 'ترجمة أوردية', nameEn: 'Urdu Translation', url: 'https://backup.qurango.net/radio/translation_quran_urdu_basit', flag: '🇵🇰' },
            { id: 't6', name: 'ترجمة فارسية', nameEn: 'Persian Translation', url: 'https://backup.qurango.net/radio/translation_quran_farsi', flag: '🇮🇷' },
            { id: 't7', name: 'ترجمة إسبانية', nameEn: 'Spanish Translation', url: 'https://backup.qurango.net/radio/translation_quran_spanish_afs', flag: '🇪🇸' },
            { id: 't8', name: 'ترجمة ألمانية', nameEn: 'German Translation', url: 'https://backup.qurango.net/radio/translation_quran_german', flag: '🇩🇪' }
        ]
    }
};
