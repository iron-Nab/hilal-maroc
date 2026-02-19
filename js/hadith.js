// ============================================================
// hadith.js - Collection de hadiths authentiques
// Rotation quotidienne basée sur le jour de l'année
// ============================================================

var Hadith = (function () {

    var collection = [
        {
            ar: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
            fr: 'Les actes ne valent que par les intentions, et chacun n\'obtient que ce qu\'il a eu l\'intention de faire.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Omar ibn Al-Khattab'
        },
        {
            ar: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
            fr: 'Aucun d\'entre vous ne sera véritablement croyant tant qu\'il n\'aimera pas pour son frère ce qu\'il aime pour lui-même.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Anas ibn Malik'
        },
        {
            ar: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
            fr: 'Que celui qui croit en Allah et au Jour dernier dise du bien ou qu\'il se taise.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Abu Hurayra'
        },
        {
            ar: 'لَا تَغْضَبْ',
            fr: 'Ne te mets pas en colère.',
            source: 'Al-Bukhari',
            narrateur: 'Abu Hurayra'
        },
        {
            ar: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
            fr: 'Le musulman est celui dont les musulmans sont à l\'abri de sa langue et de sa main.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Abdullah ibn Amr'
        },
        {
            ar: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
            fr: 'Quiconque emprunte un chemin à la recherche du savoir, Allah lui facilite un chemin vers le Paradis.',
            source: 'Muslim',
            narrateur: 'Abu Hurayra'
        },
        {
            ar: 'الطُّهُورُ شَطْرُ الْإِيمَانِ',
            fr: 'La purification est la moitié de la foi.',
            source: 'Muslim',
            narrateur: 'Abu Malik Al-Ash\'ari'
        },
        {
            ar: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
            fr: 'Ton sourire à ton frère est une aumône.',
            source: 'At-Tirmidhi',
            narrateur: 'Abu Dharr'
        },
        {
            ar: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
            fr: 'Le meilleur d\'entre vous est celui qui apprend le Coran et l\'enseigne.',
            source: 'Al-Bukhari',
            narrateur: 'Othman ibn Affan'
        },
        {
            ar: 'الدُّعَاءُ هُوَ الْعِبَادَةُ',
            fr: 'L\'invocation est l\'essence même de l\'adoration.',
            source: 'At-Tirmidhi',
            narrateur: 'An-Nu\'man ibn Bashir'
        },
        {
            ar: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
            fr: 'Jamais l\'aumône ne diminue la richesse.',
            source: 'Muslim',
            narrateur: 'Abu Hurayra'
        },
        {
            ar: 'إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الْأَمْرِ كُلِّهِ',
            fr: 'Allah est doux et Il aime la douceur en toute chose.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Aisha'
        },
        {
            ar: 'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ',
            fr: 'Le meilleur des hommes est celui qui est le plus utile aux gens.',
            source: 'Ad-Daraqutni',
            narrateur: 'Jabir ibn Abdullah'
        },
        {
            ar: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
            fr: 'Crains Allah où que tu sois, fais suivre la mauvaise action par une bonne qui l\'effacera, et comporte-toi bien envers les gens.',
            source: 'At-Tirmidhi',
            narrateur: 'Mu\'adh ibn Jabal'
        },
        {
            ar: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ',
            fr: 'Le croyant fort est meilleur et plus aimé d\'Allah que le croyant faible.',
            source: 'Muslim',
            narrateur: 'Abu Hurayra'
        },
        {
            ar: 'مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ',
            fr: 'Celui qui prie les deux prières fraîches (Fajr et Asr) entrera au Paradis.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Abu Musa Al-Ash\'ari'
        },
        {
            ar: 'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
            fr: 'Allah ne regarde ni vos apparences ni vos biens, mais Il regarde vos cœurs et vos actes.',
            source: 'Muslim',
            narrateur: 'Abu Hurayra'
        },
        {
            ar: 'الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ',
            fr: 'Ce bas monde est la prison du croyant et le paradis du mécréant.',
            source: 'Muslim',
            narrateur: 'Abu Hurayra'
        },
        {
            ar: 'كُلُّ مَعْرُوفٍ صَدَقَةٌ',
            fr: 'Toute bonne action est une aumône.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Jabir ibn Abdullah'
        },
        {
            ar: 'مَنْ كَانَ فِي حَاجَةِ أَخِيهِ كَانَ اللَّهُ فِي حَاجَتِهِ',
            fr: 'Quiconque aide son frère dans le besoin, Allah l\'aidera dans le sien.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Abdullah ibn Omar'
        },
        {
            ar: 'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ',
            fr: 'J\'ai été envoyé pour parfaire les nobles caractères.',
            source: 'Al-Bayhaqi',
            narrateur: 'Abu Hurayra'
        },
        {
            ar: 'الْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ',
            fr: 'Le Paradis se trouve sous les pieds des mères.',
            source: 'An-Nasa\'i',
            narrateur: 'Mu\'awiya ibn Jahima'
        },
        {
            ar: 'مَنْ لَا يَرْحَمِ النَّاسَ لَا يَرْحَمْهُ اللَّهُ',
            fr: 'Celui qui n\'a pas de miséricorde envers les gens, Allah n\'aura pas de miséricorde envers lui.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Jarir ibn Abdullah'
        },
        {
            ar: 'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
            fr: 'Les actes les plus aimés d\'Allah sont les plus réguliers, même s\'ils sont peu nombreux.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Aisha'
        },
        {
            ar: 'الصَّلَاةُ نُورٌ وَالصَّدَقَةُ بُرْهَانٌ وَالصَّبْرُ ضِيَاءٌ',
            fr: 'La prière est lumière, l\'aumône est preuve, et la patience est clarté.',
            source: 'Muslim',
            narrateur: 'Abu Malik Al-Ash\'ari'
        },
        {
            ar: 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ',
            fr: 'La bonne parole est une aumône.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Abu Hurayra'
        },
        {
            ar: 'إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ: صَدَقَةٍ جَارِيَةٍ أَوْ عِلْمٍ يُنْتَفَعُ بِهِ أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ',
            fr: 'Quand l\'homme meurt, ses œuvres s\'arrêtent sauf trois : une aumône continue, un savoir utile, ou un enfant pieux qui invoque pour lui.',
            source: 'Muslim',
            narrateur: 'Abu Hurayra'
        },
        {
            ar: 'مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
            fr: 'Quiconque prie durant le Ramadan avec foi et espoir de récompense, ses péchés passés lui seront pardonnés.',
            source: 'Al-Bukhari et Muslim',
            narrateur: 'Abu Hurayra'
        },
        {
            ar: 'أَفْضَلُ الذِّكْرِ لَا إِلَهَ إِلَّا اللَّهُ وَأَفْضَلُ الدُّعَاءِ الْحَمْدُ لِلَّهِ',
            fr: 'La meilleure invocation est "La ilaha illa Allah" et la meilleure louange est "Al-hamdulillah".',
            source: 'At-Tirmidhi',
            narrateur: 'Jabir ibn Abdullah'
        },
        {
            ar: 'لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلْقٍ',
            fr: 'Ne méprise aucune bonne action, ne serait-ce que de rencontrer ton frère avec un visage souriant.',
            source: 'Muslim',
            narrateur: 'Abu Dharr'
        }
    ];

    // Sélection du hadith du jour basée sur le jour de l'année
    function getDayOfYear() {
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var diff = now - start;
        var oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    function getToday() {
        var dayOfYear = getDayOfYear();
        var index = dayOfYear % collection.length;
        return collection[index];
    }

    function getAll() {
        return collection;
    }

    return {
        getToday: getToday,
        getAll: getAll,
        count: collection.length
    };
})();
