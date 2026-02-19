// ============================================================
// mawaid.js - Collection de conseils religieux (مواعظ)
// Rotation quotidienne basée sur le jour de l'année
// ============================================================

var Mawaid = (function () {

    var collection = [
        {
            titre: 'La patience face aux épreuves',
            titreAr: 'الصبر عند البلاء',
            contenu: 'La patience est la clé de la délivrance. Allah dit : « Certes, avec la difficulté vient la facilité » (94:6). Chaque épreuve est une occasion d\'élévation spirituelle et de rapprochement avec Allah. Le croyant patient voit ses péchés effacés et son rang élevé.',
            verset: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
            reference: 'Sourate Al-Sharh, 94:6'
        },
        {
            titre: 'La valeur du dhikr',
            titreAr: 'فضل الذكر',
            contenu: 'Le rappel d\'Allah est la nourriture de l\'âme. Il apaise le cœur, éloigne les soucis et attire la miséricorde divine. Que ta langue soit toujours humide du dhikr d\'Allah, en tout lieu et en tout temps.',
            verset: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
            reference: 'Sourate Ar-Ra\'d, 13:28'
        },
        {
            titre: 'L\'importance de la prière',
            titreAr: 'أهمية الصلاة',
            contenu: 'La prière est le pilier de la religion et le lien entre le serviteur et son Seigneur. Elle est la première chose sur laquelle le serviteur sera interrogé le Jour du Jugement. Préserve tes prières à l\'heure, car elles sont lumière et salut.',
            verset: 'إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ',
            reference: 'Sourate Al-Ankabut, 29:45'
        },
        {
            titre: 'La bienfaisance envers les parents',
            titreAr: 'بر الوالدين',
            contenu: 'Allah a placé la bienfaisance envers les parents juste après Son adoration. Sois doux avec eux, prie pour eux et honore-les tant qu\'ils sont vivants. C\'est un des plus grands actes d\'adoration.',
            verset: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا',
            reference: 'Sourate Al-Isra, 17:23'
        },
        {
            titre: 'Le repentir sincère',
            titreAr: 'التوبة النصوح',
            contenu: 'La porte du repentir est toujours ouverte. Allah aime celui qui se repent et se purifie. Ne désespère jamais de la miséricorde d\'Allah, car Il pardonne tous les péchés. Repens-toi avant qu\'il ne soit trop tard.',
            verset: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
            reference: 'Sourate Az-Zumar, 39:53'
        },
        {
            titre: 'La fraternité en Islam',
            titreAr: 'الأخوة في الإسلام',
            contenu: 'Les croyants sont des frères. Ils se soutiennent, se conseillent et s\'entraident dans le bien. L\'amour pour ton frère ce que tu aimes pour toi-même est un signe de foi complète.',
            verset: 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ',
            reference: 'Sourate Al-Hujurat, 49:10'
        },
        {
            titre: 'La confiance en Allah (Tawakkul)',
            titreAr: 'التوكل على الله',
            contenu: 'Place ta confiance en Allah après avoir pris tes précautions. Le tawakkul n\'est pas l\'abandon des causes, mais la certitude que le résultat est entre les mains d\'Allah. Celui qui se confie à Lui, Il lui suffit.',
            verset: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
            reference: 'Sourate At-Talaq, 65:3'
        },
        {
            titre: 'La gratitude (Shukr)',
            titreAr: 'الشكر لله',
            contenu: 'La gratitude multiplie les bienfaits. Remercie Allah pour tout ce qu\'Il t\'a donné : la santé, la foi, la famille. Le serviteur reconnaissant est celui qui voit les bienfaits d\'Allah même dans les épreuves.',
            verset: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
            reference: 'Sourate Ibrahim, 14:7'
        },
        {
            titre: 'La sincérité (Ikhlas)',
            titreAr: 'الإخلاص في العمل',
            contenu: 'La sincérité est l\'âme des actes d\'adoration. Accomplis chaque acte uniquement pour plaire à Allah, sans rechercher les éloges des gens. Un petit acte sincère vaut mieux qu\'un grand acte fait par ostentation.',
            verset: 'وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ',
            reference: 'Sourate Al-Bayyina, 98:5'
        },
        {
            titre: 'Le bon comportement',
            titreAr: 'حسن الخلق',
            contenu: 'Le Prophète ﷺ a dit que le plus lourd dans la balance le Jour du Jugement sera le bon comportement. Sois doux, patient, généreux et pardonne. Le bon caractère est le meilleur ornement du croyant.',
            verset: 'وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ',
            reference: 'Sourate Al-Qalam, 68:4'
        },
        {
            titre: 'La valeur du temps',
            titreAr: 'قيمة الوقت',
            contenu: 'Le temps est le capital le plus précieux du croyant. Allah jure par le temps dans le Coran pour montrer son importance. Ne gaspille pas tes jours dans ce qui ne profite ni en ce monde ni dans l\'au-delà.',
            verset: 'وَالْعَصْرِ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ',
            reference: 'Sourate Al-Asr, 103:1-2'
        },
        {
            titre: 'L\'aumône et la générosité',
            titreAr: 'الصدقة والكرم',
            contenu: 'L\'aumône purifie les biens et le cœur. Elle n\'a jamais diminué une richesse. Donne, même peu, car chaque aumône éteint un péché comme l\'eau éteint le feu. Et n\'oublie pas que le sourire est aussi une aumône.',
            verset: 'مَّن ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ أَضْعَافًا كَثِيرَةً',
            reference: 'Sourate Al-Baqara, 2:245'
        },
        {
            titre: 'La recherche du savoir',
            titreAr: 'طلب العلم',
            contenu: 'La quête du savoir est une obligation pour tout musulman. Le savoir élève les rangs, éclaire les chemins et rapproche d\'Allah. Apprends ta religion, enseigne aux autres et mets en pratique ce que tu sais.',
            verset: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
            reference: 'Sourate Al-Mujadila, 58:11'
        },
        {
            titre: 'L\'invocation (Du\'a)',
            titreAr: 'فضل الدعاء',
            contenu: 'L\'invocation est l\'arme du croyant. Allah aime être invoqué et Il promet de répondre. Ne sous-estime jamais la puissance du du\'a, surtout au dernier tiers de la nuit, entre l\'adhan et l\'iqama, et en prostration.',
            verset: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',
            reference: 'Sourate Ghafir, 40:60'
        },
        {
            titre: 'La pudeur et la modestie',
            titreAr: 'الحياء والتواضع',
            contenu: 'La pudeur est une branche de la foi. Elle embellit tout ce qu\'elle touche et ne se trouve dans une chose sans l\'embellir. Sois modeste envers Allah et envers les gens, car l\'humilité élève le serviteur.',
            verset: 'وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا',
            reference: 'Sourate Al-Furqan, 25:63'
        },
        {
            titre: 'Le jeûne et ses vertus',
            titreAr: 'فضل الصيام',
            contenu: 'Le jeûne est un bouclier. Il protège du feu, purifie l\'âme et enseigne la maîtrise de soi. Jeûne le Ramadan avec foi, et multiplie les jeûnes surérogatoires comme les lundis et jeudis.',
            verset: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
            reference: 'Sourate Al-Baqara, 2:183'
        },
        {
            titre: 'La lecture du Coran',
            titreAr: 'تلاوة القرآن',
            contenu: 'Le Coran est la parole d\'Allah, guide et lumière pour les croyants. Lis-le chaque jour, médite ses versets et mets-les en pratique. Chaque lettre lue te vaut dix bonnes actions au minimum.',
            verset: 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
            reference: 'Sourate Al-Isra, 17:9'
        },
        {
            titre: 'L\'au-delà et la préparation',
            titreAr: 'الآخرة والاستعداد لها',
            contenu: 'Cette vie est un passage éphémère vers la demeure éternelle. Prépare tes provisions pour le voyage : les bonnes actions, la prière, le dhikr et la bienfaisance. Car le sage est celui qui se prépare pour ce qui vient après la mort.',
            verset: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ',
            reference: 'Sourate Al-Hashr, 59:18'
        },
        {
            titre: 'Le pardon et la clémence',
            titreAr: 'العفو والصفح',
            contenu: 'Pardonne à ceux qui t\'ont offensé, car le pardon élève et ne diminue pas. Allah pardonne à celui qui pardonne aux autres. La clémence est une force, non une faiblesse.',
            verset: 'وَلْيَعْفُوا وَلْيَصْفَحُوا أَلَا تُحِبُّونَ أَن يَغْفِرَ اللَّهُ لَكُمْ',
            reference: 'Sourate An-Nur, 24:22'
        },
        {
            titre: 'La crainte d\'Allah (Taqwa)',
            titreAr: 'تقوى الله',
            contenu: 'La taqwa est de placer entre toi et le châtiment d\'Allah une protection par l\'obéissance. C\'est la meilleure provision pour l\'au-delà et la clé de tout bien en ce monde. Crains Allah en public comme en privé.',
            verset: 'وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَىٰ',
            reference: 'Sourate Al-Baqara, 2:197'
        }
    ];

    // Sélection de la maw3ida du jour (décalée de la moitié par rapport au hadith)
    function getDayOfYear() {
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var diff = now - start;
        var oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    function getToday() {
        var dayOfYear = getDayOfYear();
        // Décalage pour ne pas avoir la même rotation que le hadith
        var index = (dayOfYear + Math.floor(collection.length / 2)) % collection.length;
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
