import { eq } from "drizzle-orm";
import type { Database } from "../database.module";
import { authors, duaCategories, duas, sources } from "../schema";

/**
 * Invocations (dua) et rappels (dhikr), compiles a partir de Hisn al-Muslim
 * ("La citadelle du musulman") de Sa'id ibn Ali ibn Wahf Al-Qahtani,
 * compilation de référence mondialement diffusee, elle-même fondée sur des
 * hadiths authentiques (principalement Sahih al-Bukhari et Sahih Muslim).
 * Contenu volontairement limite aux invocations les plus établies et les
 * mieux documentees plutôt qu'exhaustif - voir CONTRIBUTING.md (aucun
 * contenu religieux invente ou approximatif).
 */

const HISN_AL_MUSLIM = {
  title: "Hisn al-Muslim (La citadelle du musulman)",
  authorName: "Sa'id ibn Ali ibn Wahf Al-Qahtani",
  authorEra: "1373-1439 AH / 1953-2018",
};

interface DuaSeed {
  title: string;
  arabicText: string | null;
  transliteration: string | null;
  translation: string;
  repeatCount: number | null;
  virtue?: string;
  referenceUrl?: string;
}

interface DuaCategorySeed {
  name: string;
  slug: string;
  description: string;
  items: DuaSeed[];
}

const AYAT_AL_KURSI: Pick<DuaSeed, "arabicText" | "transliteration" | "translation" | "referenceUrl"> = {
  arabicText:
    "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
  transliteration:
    "Allahu la ilaha illa huwa, al-hayyul-qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard, man dhal-ladhi yashfa'u 'indahu illa bi-idhnih, ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bi shay'im-min 'ilmihi illa bima sha', wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifzuhuma, wa huwal-'aliyyul-'azim.",
  translation:
    "Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par Lui-même. Ni somnolence ni sommeil ne Le saisissent. À Lui appartient tout ce qui est dans les cieux et sur la terre. Qui peut intercéder auprès de Lui sans Sa permission ? Il connaît leur passé et leur futur, et de Sa science, ils n'embrassent que ce qu'Il veut. Son Trône (Kursi) déborde les cieux et la terre, dont la garde ne Lui coûte aucune peine. Et Il est le Très Haut, le Très Grand. (Coran 2:255)",
  referenceUrl: "/quran/2/255",
};

const SAYYID_AL_ISTIGHFAR: Pick<DuaSeed, "arabicText" | "transliteration" | "translation"> = {
  arabicText:
    "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
  transliteration:
    "Allahumma anta Rabbi la ilaha illa ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika 'alayy, wa abu'u bidhanbi faghfir li fa'innahu la yaghfirudh-dhunuba illa ant.",
  translation:
    "Ô Allah, Tu es mon Seigneur, il n'y a de divinité que Toi. Tu m'as créé et je suis Ton serviteur. Je m'en tiens autant que possible à mon engagement et à Ta promesse envers Toi. Je cherche refuge auprès de Toi contre le mal que j'ai commis. Je reconnais envers Toi le bienfait que Tu m'as accordé, et je reconnais mon péché : pardonne-moi, car nul ne pardonne les péchés hormis Toi.",
};

const TROIS_QULS: Pick<DuaSeed, "arabicText" | "transliteration" | "referenceUrl"> = {
  arabicText: null,
  transliteration: null,
  referenceUrl: "/quran/112",
};

const SALAWAT_IBRAHIMIYYA: Pick<DuaSeed, "arabicText" | "transliteration" | "translation"> = {
  arabicText:
    "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
  transliteration:
    "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidum-Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidum-Majid.",
  translation:
    "Ô Allah, prie sur Muhammad et sur la famille de Muhammad comme Tu as prié sur Ibrahim et sur la famille d'Ibrahim ; Tu es Digne de louange, Glorieux. Ô Allah, bénis Muhammad et la famille de Muhammad comme Tu as béni Ibrahim et la famille d'Ibrahim ; Tu es Digne de louange, Glorieux.",
};

const CATEGORIES: DuaCategorySeed[] = [
  {
    name: "Adhkar du matin",
    slug: "matin",
    description: "Invocations recommandées après la prière de l'aube (Fajr), jusqu'au lever du soleil.",
    items: [
      {
        title: "Ayat al-Kursi",
        ...AYAT_AL_KURSI,
        repeatCount: 1,
        virtue: "Quiconque la récite le matin est protégé jusqu'au soir, selon un hadith rapporté par At-Tabarani.",
      },
      {
        title: "Les trois derniers versets protecteurs (Al-Ikhlas, Al-Falaq, An-Nas)",
        ...TROIS_QULS,
        translation: "Réciter les sourates Al-Ikhlas (112), Al-Falaq (113) et An-Nas (114), chacune trois fois.",
        repeatCount: 3,
        virtue: "Cela suffit contre toute chose, selon un hadith rapporté par Abu Dawud et At-Tirmidhi.",
      },
      {
        title: "Sayyid al-Istighfar (le maître des formules de pardon)",
        ...SAYYID_AL_ISTIGHFAR,
        repeatCount: 1,
        virtue:
          "Quiconque la dit avec conviction le matin et meurt ce jour-là entre au Paradis - rapporté par Al-Bukhari.",
      },
      {
        title: "Nous voici au matin",
        arabicText:
          "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ",
        transliteration:
          "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir. Rabbi as'aluka khayra ma fi hadhal-yawmi wa khayra ma ba'dah, wa a'udhu bika min sharri ma fi hadhal-yawmi wa sharri ma ba'dah.",
        translation:
          "Nous voici au matin, et avec nous la royauté d'Allah ; louange à Allah. Point de divinité à part Allah, Seul, sans associé. À Lui la royauté, à Lui la louange, et Il est capable de toute chose. Seigneur, je Te demande le bien de ce jour et le bien de ce qui le suit, et je cherche refuge auprès de Toi contre le mal de ce jour et le mal de ce qui le suit.",
        repeatCount: 1,
      },
      {
        title: "Hasbiyallah (Allah me suffit)",
        arabicText: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        transliteration: "Hasbiyallahu la ilaha illa huw, 'alayhi tawakkaltu wa huwa Rabbul-'Arshil-'Azim.",
        translation:
          "Allah me suffit ; point de divinité à part Lui. En Lui je place ma confiance, et Il est le Seigneur du Trône immense.",
        repeatCount: 7,
        virtue: "Allah lui suffira, quel que soit ce qui le préoccupe - rapporté par Abu Dawud.",
      },
      {
        title: "Subhanallahi wa bihamdihi",
        arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        transliteration: "Subhanallahi wa bihamdih.",
        translation: "Gloire et pureté à Allah, et à Lui la louange.",
        repeatCount: 100,
        virtue: "Ses péchés sont effacés même s'ils sont aussi abondants que l'écume de la mer - rapporté par Muslim.",
      },
      {
        title: "Prise à témoin (Allahumma inni asbahtu ushhiduka)",
        arabicText:
          "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
        transliteration:
          "Allahumma inni asbahtu ushhiduka wa ushhidu hamalata 'arshik, wa mala'ikatak, wa jami'a khalqik, annaka antallahu la ilaha illa ant, wahdaka la sharika lak, wa anna Muhammadan 'abduka wa rasuluk.",
        translation:
          "Ô Allah, je Te prends à témoin, ainsi que les porteurs de Ton Trône, Tes anges et toute Ta création, que Tu es Allah, qu'il n'y a de divinité que Toi, Seul, sans associé, et que Muhammad est Ton serviteur et Ton messager.",
        repeatCount: 4,
        virtue: "Allah libère un quart de celui qui la dit du Feu - rapporté par Abu Dawud.",
      },
      {
        title: "Radhitu billahi Rabban (agrément)",
        arabicText: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
        transliteration: "Radhitu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin (ﷺ) nabiyyan.",
        translation: "J'agrée Allah comme Seigneur, l'Islam comme religion, et Muhammad ﷺ comme prophète.",
        repeatCount: 3,
        virtue: "Allah se satisfera de lui au Jour de la Résurrection - rapporté par Abu Dawud et At-Tirmidhi.",
      },
    ],
  },
  {
    name: "Adhkar du soir",
    slug: "soir",
    description: "Invocations recommandées après la prière de l'après-midi (Asr), jusqu'au coucher du soleil.",
    items: [
      {
        title: "Ayat al-Kursi",
        ...AYAT_AL_KURSI,
        repeatCount: 1,
        virtue: "Quiconque la récite le soir est protégé jusqu'au matin, selon un hadith rapporté par At-Tabarani.",
      },
      {
        title: "Les trois derniers versets protecteurs (Al-Ikhlas, Al-Falaq, An-Nas)",
        ...TROIS_QULS,
        translation: "Réciter les sourates Al-Ikhlas (112), Al-Falaq (113) et An-Nas (114), chacune trois fois.",
        repeatCount: 3,
        virtue: "Cela suffit contre toute chose, selon un hadith rapporté par Abu Dawud et At-Tirmidhi.",
      },
      {
        title: "Sayyid al-Istighfar (le maître des formules de pardon)",
        ...SAYYID_AL_ISTIGHFAR,
        repeatCount: 1,
        virtue:
          "Quiconque la dit avec conviction le soir et meurt cette nuit-là entre au Paradis - rapporté par Al-Bukhari.",
      },
      {
        title: "Nous voici au soir",
        arabicText:
          "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا",
        transliteration:
          "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir. Rabbi as'aluka khayra ma fi hadhihil-laylati wa khayra ma ba'daha, wa a'udhu bika min sharri ma fi hadhihil-laylati wa sharri ma ba'daha.",
        translation:
          "Nous voici au soir, et avec nous la royauté d'Allah ; louange à Allah. Point de divinité à part Allah, Seul, sans associé. À Lui la royauté, à Lui la louange, et Il est capable de toute chose. Seigneur, je Te demande le bien de cette nuit et le bien de ce qui la suit, et je cherche refuge auprès de Toi contre le mal de cette nuit et le mal de ce qui la suit.",
        repeatCount: 1,
      },
      {
        title: "Hasbiyallah (Allah me suffit)",
        arabicText: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        transliteration: "Hasbiyallahu la ilaha illa huw, 'alayhi tawakkaltu wa huwa Rabbul-'Arshil-'Azim.",
        translation:
          "Allah me suffit ; point de divinité à part Lui. En Lui je place ma confiance, et Il est le Seigneur du Trône immense.",
        repeatCount: 7,
        virtue: "Allah lui suffira, quel que soit ce qui le préoccupe - rapporté par Abu Dawud.",
      },
      {
        title: "Subhanallahi wa bihamdihi",
        arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        transliteration: "Subhanallahi wa bihamdih.",
        translation: "Gloire et pureté à Allah, et à Lui la louange.",
        repeatCount: 100,
        virtue: "Ses péchés sont effacés même s'ils sont aussi abondants que l'écume de la mer - rapporté par Muslim.",
      },
      {
        title: "Prise à témoin (Allahumma inni amsaytu ushhiduka)",
        arabicText:
          "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
        transliteration:
          "Allahumma inni amsaytu ushhiduka wa ushhidu hamalata 'arshik, wa mala'ikatak, wa jami'a khalqik, annaka antallahu la ilaha illa ant, wahdaka la sharika lak, wa anna Muhammadan 'abduka wa rasuluk.",
        translation:
          "Ô Allah, je Te prends à témoin, ainsi que les porteurs de Ton Trône, Tes anges et toute Ta création, que Tu es Allah, qu'il n'y a de divinité que Toi, Seul, sans associé, et que Muhammad est Ton serviteur et Ton messager.",
        repeatCount: 4,
        virtue: "Allah libère un quart de celui qui la dit du Feu - rapporté par Abu Dawud.",
      },
      {
        title: "Radhitu billahi Rabban (agrément)",
        arabicText: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
        transliteration: "Radhitu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin (ﷺ) nabiyyan.",
        translation: "J'agrée Allah comme Seigneur, l'Islam comme religion, et Muhammad ﷺ comme prophète.",
        repeatCount: 3,
        virtue: "Allah se satisfera de lui au Jour de la Résurrection - rapporté par Abu Dawud et At-Tirmidhi.",
      },
    ],
  },
  {
    name: "Après la prière",
    slug: "apres-la-priere",
    description: "Invocations et rappels à réciter juste après chacune des cinq prières obligatoires.",
    items: [
      {
        title: "Demande de pardon (Astaghfirullah)",
        arabicText: "أَسْتَغْفِرُ اللَّهَ",
        transliteration: "Astaghfirullah.",
        translation: "Je demande pardon à Allah.",
        repeatCount: 3,
      },
      {
        title: "Allahumma antas-Salam",
        arabicText: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        transliteration: "Allahumma antas-Salamu wa minkas-salam, tabarakta ya dhal-jalali wal-ikram.",
        translation:
          "Ô Allah, Tu es la Paix et de Toi vient la paix. Béni sois-Tu, ô Détenteur de la majesté et de la générosité.",
        repeatCount: 1,
      },
      {
        title: "Ayat al-Kursi après la prière",
        ...AYAT_AL_KURSI,
        repeatCount: 1,
        virtue: "Rien n'empêchera son lecteur d'entrer au Paradis, sinon la mort - rapporté par An-Nasa'i.",
      },
      {
        title: "Tasbih, Tahmid, Takbir (33 fois chacun)",
        arabicText: "سُبْحَانَ اللَّهِ، الْحَمْدُ لِلَّهِ، اللَّهُ أَكْبَرُ",
        transliteration: "Subhanallah, Alhamdulillah, Allahu Akbar.",
        translation: "Gloire à Allah, louange à Allah, Allah est le plus grand - chacune de ces formules 33 fois.",
        repeatCount: 33,
      },
      {
        title: "Formule de complément (la 100e)",
        arabicText: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir.",
        translation:
          "Point de divinité à part Allah, Seul, sans associé. À Lui la royauté, à Lui la louange, et Il est capable de toute chose.",
        repeatCount: 1,
        virtue:
          "Complète les 99 tasbih/tahmid/takbir pour atteindre 100 : ses péchés sont pardonnés, fussent-ils aussi abondants que l'écume de la mer - rapporté par Muslim.",
      },
    ],
  },
  {
    name: "Avant de dormir",
    slug: "avant-de-dormir",
    description: "Invocations à réciter avant de s'endormir.",
    items: [
      {
        title: "En Ton nom, je meurs et je vis",
        arabicText: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amutu wa ahya.",
        translation: "En Ton nom, ô Allah, je meurs et je vis.",
        repeatCount: 1,
      },
      {
        title: "Tasbih avant de dormir (Tasbih de Fatima)",
        arabicText: "سُبْحَانَ اللَّهِ (٣٣)، الْحَمْدُ لِلَّهِ (٣٣)، اللَّهُ أَكْبَرُ (٣٤)",
        transliteration: "Subhanallah (x33), Alhamdulillah (x33), Allahu Akbar (x34).",
        translation: "Gloire à Allah (33 fois), louange à Allah (33 fois), Allah est le plus grand (34 fois).",
        repeatCount: 34,
        virtue:
          "Le Prophète ﷺ l'a enseigné à sa fille Fatima, le décrivant comme meilleur qu'un serviteur pour l'aider dans les tâches du foyer - rapporté par Al-Bukhari et Muslim.",
      },
      {
        title: "Les trois derniers versets protecteurs (Al-Ikhlas, Al-Falaq, An-Nas)",
        ...TROIS_QULS,
        translation:
          "Réciter Al-Ikhlas, Al-Falaq et An-Nas, souffler dans les mains jointes puis passer les mains sur tout le corps accessible ; répéter trois fois.",
        repeatCount: 3,
      },
      {
        title: "Ayat al-Kursi avant de dormir",
        ...AYAT_AL_KURSI,
        repeatCount: 1,
        virtue:
          "Un gardien envoyé par Allah reste auprès de lui et Satan ne l'approche pas jusqu'au matin - rapporté par Al-Bukhari.",
      },
    ],
  },
  {
    name: "Au réveil",
    slug: "au-reveil",
    description: "Invocation à réciter au réveil, avant de se lever.",
    items: [
      {
        title: "Louange à Allah qui nous a redonné la vie",
        arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur.",
        translation:
          "Louange à Allah qui nous a redonné la vie après nous l'avoir ôtée (par le sommeil), et c'est vers Lui que se fera la résurrection.",
        repeatCount: 1,
      },
    ],
  },
  {
    name: "Repas",
    slug: "repas",
    description: "Invocations avant et après le repas.",
    items: [
      {
        title: "Avant de manger",
        arabicText: "بِسْمِ اللَّهِ",
        transliteration: "Bismillah.",
        translation: "Au nom d'Allah.",
        repeatCount: 1,
        virtue:
          "Si on a oublié de le dire au début, on ajoute en cours de repas : \"Bismillahi awwalahu wa akhirahu\" (Au nom d'Allah, au début comme à la fin) - rapporté par Abu Dawud et At-Tirmidhi.",
      },
      {
        title: "Après le repas",
        arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        transliteration: "Alhamdu lillahil-ladhi at'amani hadha, wa razaqanihi min ghayri hawlin minni wa la quwwah.",
        translation: "Louange à Allah qui m'a nourri de ceci et me l'a accordé sans nul effort ni force de ma part.",
        repeatCount: 1,
        virtue: "Ses péchés passés lui sont pardonnés - rapporté par Abu Dawud et At-Tirmidhi.",
      },
      {
        title: "En mangeant chez quelqu'un",
        arabicText: "اللَّهُمَّ بَارِكْ لَهُمْ فِيمَا رَزَقْتَهُمْ وَاغْفِرْ لَهُمْ وَارْحَمْهُمْ",
        transliteration: "Allahumma barik lahum fima razaqtahum waghfir lahum warhamhum.",
        translation: "Ô Allah, bénis ce que Tu leur as accordé, pardonne-leur et fais-leur miséricorde.",
        repeatCount: 1,
        virtue: "Invocation pour l'hôte chez qui l'on a mangé - rapportée par Muslim.",
      },
    ],
  },
  {
    name: "Toilettes",
    slug: "toilettes",
    description: "Invocations en entrant et en sortant des toilettes.",
    items: [
      {
        title: "En entrant",
        arabicText: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
        transliteration: "Allahumma inni a'udhu bika minal-khubthi wal-khaba'ith.",
        translation: "Ô Allah, je cherche refuge auprès de Toi contre le mal et l'impureté.",
        repeatCount: 1,
      },
      {
        title: "En sortant",
        arabicText: "غُفْرَانَكَ",
        transliteration: "Ghufranak.",
        translation: "[Je Te demande] Ton pardon.",
        repeatCount: 1,
      },
    ],
  },
  {
    name: "Maison",
    slug: "maison",
    description: "Invocations en sortant et en entrant à la maison.",
    items: [
      {
        title: "En sortant de la maison",
        arabicText: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "Bismillah, tawakkaltu 'alallah, wa la hawla wa la quwwata illa billah.",
        translation: "Au nom d'Allah, je place ma confiance en Allah ; il n'y a de force ni de puissance qu'en Allah.",
        repeatCount: 1,
        virtue:
          "Il lui est alors dit : \"Tu es guidé, épargné et protégé\", et le diable s'écarte de lui - rapporté par Abu Dawud et At-Tirmidhi.",
      },
      {
        title: "En entrant dans la maison",
        arabicText: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
        transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna.",
        translation: "Au nom d'Allah nous entrons, au nom d'Allah nous sortons, et en Allah notre Seigneur nous plaçons notre confiance.",
        repeatCount: 1,
      },
    ],
  },
  {
    name: "Voyage",
    slug: "voyage",
    description: "Invocations à réciter en entamant un voyage.",
    items: [
      {
        title: "En montant sur sa monture ou son véhicule",
        arabicText:
          "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ",
        transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun.",
        translation:
          "Gloire à Celui qui a mis ceci à notre service, alors que nous n'aurions pu l'accomplir par nous-mêmes. Et c'est vers notre Seigneur que nous retournerons. (Coran 43:13-14)",
        repeatCount: 1,
        referenceUrl: "/quran/43/13",
      },
      {
        title: "Dua complet du voyage",
        arabicText:
          "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَٰذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ وَالْخَلِيفَةُ فِي الْأَهْلِ",
        transliteration:
          "Allahumma inna nas'aluka fi safarina hadhal-birra wat-taqwa, wa minal-'amali ma tarda. Allahumma hawwin 'alayna safarana hadha watwi 'anna bu'dah. Allahumma antas-sahibu fis-safari wal-khalifatu fil-ahl.",
        translation:
          "Ô Allah, nous Te demandons, dans ce voyage, la piété et la crainte de Toi, ainsi qu'une action qui Te satisfasse. Ô Allah, allège-nous ce voyage et raccourcis-en la distance. Ô Allah, Tu es le Compagnon du voyage et le Gardien de la famille restée derrière.",
        repeatCount: 1,
        virtue: "Récité par le Prophète ﷺ dès qu'il enfourchait sa monture pour un voyage - rapporté par Muslim.",
      },
    ],
  },
  {
    name: "Détresse et anxiété",
    slug: "detresse-et-anxiete",
    description: "Invocations pour les moments de détresse, d'angoisse ou de tristesse.",
    items: [
      {
        title: "Invocation de la détresse",
        arabicText:
          "لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
        transliteration:
          "La ilaha illallahul-'Azimul-Halim, la ilaha illallahu Rabbul-'Arshil-'Azim, la ilaha illallahu Rabbus-samawati wa Rabbul-ardi wa Rabbul-'Arshil-Karim.",
        translation:
          "Point de divinité à part Allah, l'Immense, le Longanime. Point de divinité à part Allah, Seigneur du Trône immense. Point de divinité à part Allah, Seigneur des cieux, Seigneur de la terre et Seigneur du noble Trône.",
        repeatCount: 1,
        virtue: "Le Prophète ﷺ la disait dans les moments de détresse - rapporté par Al-Bukhari et Muslim.",
      },
      {
        title: "Contre le souci et la tristesse",
        arabicText:
          "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
        transliteration:
          "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayni wa ghalabatir-rijal.",
        translation:
          "Ô Allah, je cherche refuge auprès de Toi contre le souci et la tristesse, l'incapacité et la paresse, l'avarice et la lâcheté, le poids des dettes et la domination des hommes.",
        repeatCount: 1,
        virtue: "Invocation fréquente du Prophète ﷺ - rapportée par Al-Bukhari.",
      },
      {
        title: "Hasbunallahu wa ni'mal-Wakil",
        arabicText: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        transliteration: "Hasbunallahu wa ni'mal-Wakil.",
        translation: "Allah nous suffit, Il est notre excellent garant. (Coran 3:173)",
        repeatCount: 1,
        referenceUrl: "/quran/3/173",
        virtue: "Dite par Ibrahim dans le feu et par le Prophète ﷺ face à une menace ennemie.",
      },
      {
        title: "Refuge dans les paroles parfaites d'Allah",
        arabicText: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq.",
        translation: "Je cherche refuge dans les paroles parfaites d'Allah contre le mal de ce qu'Il a créé.",
        repeatCount: 3,
        virtue: "Aucun mal ne peut atteindre celui qui la récite le soir jusqu'au matin - rapporté par Muslim.",
      },
    ],
  },
  {
    name: "Après l'appel à la prière (Adhan)",
    slug: "apres-adhan",
    description: "Invocation à réciter après avoir entendu l'appel à la prière (adhan).",
    items: [
      {
        title: "Allahumma Rabba hadhihid-da'wa",
        arabicText:
          "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ",
        transliteration:
          "Allahumma Rabba hadhihid-da'watit-tammah, was-salatil-qa'imah, ati Muhammadanil-wasilata wal-fadilah, wab'athhu maqaman mahmudanil-ladhi wa'adtah.",
        translation:
          "Ô Allah, Seigneur de cet appel parfait et de la prière qui va être accomplie, accorde à Muhammad al-wasila (le rang élevé) et la supériorité, et élève-le au rang louable que Tu lui as promis.",
        repeatCount: 1,
        virtue: "Mon intercession lui sera acquise le Jour de la Résurrection - rapporté par Al-Bukhari.",
      },
    ],
  },
  {
    name: "Salawat sur le Prophète ﷺ",
    slug: "salawat",
    description: "Formule de prière sur le Prophète ﷺ, recommandée en tout temps et particulièrement le vendredi.",
    items: [
      {
        title: "Salawat Ibrahimiyya",
        ...SALAWAT_IBRAHIMIYYA,
        repeatCount: 1,
        virtue: "Formule enseignée par le Prophète ﷺ lui-même à ses Compagnons qui lui demandaient comment prier sur lui - rapportée par Al-Bukhari.",
      },
    ],
  },
  {
    name: "Protection",
    slug: "protection",
    description: "Invocations générales de protection, à réciter en toute circonstance.",
    items: [
      {
        title: "Refuge dans les paroles parfaites d'Allah",
        arabicText: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq.",
        translation: "Je cherche refuge dans les paroles parfaites d'Allah contre le mal de ce qu'Il a créé.",
        repeatCount: 3,
        virtue: "Rapporté par Muslim ; à réciter notamment en s'installant quelque part en voyage.",
      },
      {
        title: "Au nom d'Allah, rien ne peut nuire",
        arabicText: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration: "Bismillahil-ladhi la yadhurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim.",
        translation:
          "Au nom d'Allah, avec le nom duquel rien ne peut nuire, ni sur terre ni dans le ciel ; Il est Celui qui entend tout, qui sait tout.",
        repeatCount: 3,
        virtue: "Rien ne pourra lui nuire jusqu'au lendemain - rapporté par Abu Dawud et At-Tirmidhi.",
      },
    ],
  },
  {
    name: "Visite d'un malade",
    slug: "visite-malade",
    description: "Invocations à réciter en visitant une personne malade.",
    items: [
      {
        title: "Pas de mal, une purification",
        arabicText: "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ",
        transliteration: "La ba'sa tahurun in sha'Allah.",
        translation: "Ce n'est rien, ce sera une purification, si Allah le veut.",
        repeatCount: 1,
        virtue: "Parole du Prophète ﷺ à un malade qu'il visitait - rapportée par Al-Bukhari.",
      },
      {
        title: "Demande de guérison",
        arabicText: "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ",
        transliteration: "As'alullahal-'Azima Rabbal-'Arshil-'Azimi an yashfiyak.",
        translation: "Je demande à Allah l'Immense, Seigneur du Trône immense, de te guérir.",
        repeatCount: 7,
        virtue: "Rapporté par Abu Dawud et At-Tirmidhi, à dire au chevet d'un malade dont le terme n'est pas encore arrivé.",
      },
    ],
  },
  {
    name: "Mariage",
    slug: "mariage",
    description: "Invocations liées au mariage.",
    items: [
      {
        title: "Félicitations pour un mariage",
        arabicText: "بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
        transliteration: "Barakallahu laka, wa baraka 'alayka, wa jama'a baynakuma fi khayr.",
        translation: "Qu'Allah te bénisse, répande Sa bénédiction sur toi, et vous unisse tous deux dans le bien.",
        repeatCount: 1,
        virtue: "Formule de félicitations recommandée pour un nouveau marié - rapportée par Abu Dawud et At-Tirmidhi.",
      },
      {
        title: "En se mariant",
        arabicText:
          "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ",
        transliteration:
          "Allahumma inni as'aluka khayraha wa khayra ma jabaltaha 'alayh, wa a'udhu bika min sharriha wa sharri ma jabaltaha 'alayh.",
        translation:
          "Ô Allah, je Te demande son bien et le bien de ce sur quoi Tu l'as façonnée, et je cherche refuge auprès de Toi contre son mal et le mal de ce sur quoi Tu l'as façonnée.",
        repeatCount: 1,
        virtue: "Rapporté par Abu Dawud, recommandé au mari lors de la nuit de noces.",
      },
    ],
  },
  {
    name: "Colère",
    slug: "colere",
    description: "Invocation à réciter en cas de colère.",
    items: [
      {
        title: "Refuge contre le diable maudit",
        arabicText: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
        transliteration: "A'udhu billahi minash-shaytanir-rajim.",
        translation: "Je cherche refuge auprès d'Allah contre le diable maudit.",
        repeatCount: 1,
        virtue:
          "Le Prophète ﷺ l'a enseignée à un homme en colère, précisant que la colère vient du diable - rapporté par Al-Bukhari et Muslim.",
      },
    ],
  },
  {
    name: "Marché",
    slug: "marche",
    description: "Invocation à réciter en entrant sur un marché ou un lieu de commerce.",
    items: [
      {
        title: "En entrant au marché",
        arabicText:
          "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration:
          "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu yuhyi wa yumit, wa huwa hayyun la yamut, biyadihil-khayr, wa huwa 'ala kulli shay'in qadir.",
        translation:
          "Point de divinité à part Allah, Seul, sans associé. À Lui la royauté, à Lui la louange. Il fait vivre et fait mourir, Il est Vivant et ne meurt pas, le bien est dans Sa main, et Il est capable de toute chose.",
        repeatCount: 1,
        virtue: "Allah lui inscrit un million de bonnes actions - rapporté par At-Tirmidhi.",
      },
    ],
  },
  {
    name: "Phénomènes naturels",
    slug: "phenomenes-naturels",
    description: "Invocations liées au vent, au tonnerre et à la pluie.",
    items: [
      {
        title: "En cas de vent fort",
        arabicText:
          "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا فِيهَا وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا وَشَرِّ مَا أُرْسِلَتْ بِهِ",
        transliteration:
          "Allahumma inni as'aluka khayraha wa khayra ma fiha wa khayra ma ursilat bih, wa a'udhu bika min sharriha wa sharri ma fiha wa sharri ma ursilat bih.",
        translation:
          "Ô Allah, je Te demande son bien, le bien qu'il contient et le bien pour lequel il a été envoyé, et je cherche refuge auprès de Toi contre son mal, le mal qu'il contient et le mal pour lequel il a été envoyé.",
        repeatCount: 1,
        virtue: "Rapporté par Muslim, invocation du Prophète ﷺ face au vent.",
      },
      {
        title: "En entendant le tonnerre",
        arabicText: "سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ",
        transliteration: "Subhanal-ladhi yusabbihur-ra'du bihamdihi wal-mala'ikatu min khifatih.",
        translation:
          "Gloire à Celui que le tonnerre glorifie par Sa louange, ainsi que les anges par crainte de Lui.",
        repeatCount: 1,
        virtue: "Rapportée comme pratique d'Abdullah ibn Umar plutôt que comme parole directe du Prophète ﷺ, mais largement reprise dans les recueils d'invocations.",
      },
      {
        title: "Sous la pluie",
        arabicText: "اللَّهُمَّ صَيِّبًا نَافِعًا",
        transliteration: "Allahumma sayyiban nafi'an.",
        translation: "Ô Allah, fais qu'elle soit une pluie bénéfique.",
        repeatCount: 1,
        virtue: "Rapportée par Al-Bukhari, dite par le Prophète ﷺ dès qu'il voyait la pluie.",
      },
    ],
  },
  {
    name: "Nouvelle lune",
    slug: "nouvelle-lune",
    description: "Invocation à réciter en voyant la nouvelle lune (début du mois lunaire).",
    items: [
      {
        title: "En voyant la nouvelle lune",
        arabicText: "اللَّهُ أَكْبَرُ، اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ",
        transliteration:
          "Allahu Akbar. Allahumma ahillahu 'alayna bil-amni wal-iman, was-salamati wal-Islam, Rabbi wa Rabbukallah.",
        translation:
          "Allah est le plus grand. Ô Allah, fais-la se lever sur nous avec la sécurité et la foi, la préservation et l'Islam ; mon Seigneur et le tien est Allah.",
        repeatCount: 1,
        virtue: "Rapportée par At-Tirmidhi.",
      },
    ],
  },
  {
    name: "Éternuement",
    slug: "eternuement",
    description: "L'échange de formules recommandé lorsqu'une personne éternue.",
    items: [
      {
        title: "Échange après un éternuement",
        arabicText: "الْحَمْدُ لِلَّهِ ← يَرْحَمُكَ اللَّهُ ← يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ",
        transliteration: "Alhamdulillah ← Yarhamukallah ← Yahdikumullahu wa yuslihu balakum.",
        translation:
          "Celui qui éternue dit : \"Louange à Allah\". Celui qui l'entend répond : \"Qu'Allah te fasse miséricorde\". Celui qui a éternué répond à son tour : \"Qu'Allah vous guide et améliore votre état\".",
        repeatCount: null,
        virtue: "Échange en trois temps rapporté par Al-Bukhari.",
      },
    ],
  },
  {
    name: "Ramadan",
    slug: "ramadan",
    description: "Invocations propres au mois de Ramadan.",
    items: [
      {
        title: "En rompant le jeûne (iftar)",
        arabicText: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
        transliteration: "Dhahaba zama'u wabtallatil-'uruqu wa thabatal-ajru in sha'Allah.",
        translation: "La soif est partie, les veines sont désaltérées, et la récompense est acquise, si Allah le veut.",
        repeatCount: 1,
        virtue: "Rapportée par Abu Dawud, dite par le Prophète ﷺ en rompant le jeûne.",
      },
      {
        title: "Nuit du Destin (Laylat al-Qadr)",
        arabicText: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        transliteration: "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'anni.",
        translation: "Ô Allah, Tu es Celui qui pardonne et Tu aimes le pardon ; pardonne-moi donc.",
        repeatCount: 1,
        virtue: "Enseignée par le Prophète ﷺ à Aisha pour la Nuit du Destin - rapportée par At-Tirmidhi.",
      },
    ],
  },
  {
    name: "Parents",
    slug: "parents",
    description: "Invocation en faveur des parents.",
    items: [
      {
        title: "Miséricorde envers les parents",
        arabicText: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
        transliteration: "Rabbi irhamhuma kama rabbayani saghira.",
        translation: "Seigneur, fais-leur miséricorde comme ils m'ont élevé tout petit. (Coran 17:24)",
        repeatCount: 1,
        referenceUrl: "/quran/17/24",
      },
    ],
  },
  {
    name: "Enfants",
    slug: "enfants",
    description: "Invocation de protection pour les enfants.",
    items: [
      {
        title: "Protection des enfants",
        arabicText:
          "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
        transliteration: "U'idhukuma bikalimatillahit-tammati min kulli shaytanin wa hammah, wa min kulli 'aynin lammah.",
        translation:
          "Je vous place tous deux sous la protection des paroles parfaites d'Allah, contre tout diable, toute bête nuisible et tout œil malveillant.",
        repeatCount: 1,
        virtue:
          "Le Prophète ﷺ récitait cette formule sur Al-Hasan et Al-Husayn, précisant que c'est ainsi qu'Ibrahim protégeait Isma'il et Ishaq - rapportée par Al-Bukhari.",
      },
    ],
  },
  {
    name: "Tristesse",
    slug: "tristesse",
    description: "Invocation face à la tristesse ou à l'épreuve.",
    items: [
      {
        title: "Rien n'est facile hormis ce que Tu rends facile",
        arabicText: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزَنَ إِذَا شِئْتَ سَهْلًا",
        transliteration: "Allahumma la sahla illa ma ja'altahu sahla, wa anta taj'alul-hazna idha shi'ta sahla.",
        translation:
          "Ô Allah, rien n'est facile hormis ce que Tu rends facile, et Tu peux, si Tu le veux, rendre facile ce qui est source de tristesse.",
        repeatCount: 1,
        virtue: "Rapportée par Ibn Hibban, largement reprise dans les recueils de duas.",
      },
    ],
  },
  {
    name: "Bonheur",
    slug: "bonheur",
    description: "Formule de gratitude lorsqu'un bienfait ou un événement heureux survient.",
    items: [
      {
        title: "Louange pour un bienfait",
        arabicText: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
        transliteration: "Alhamdu lillahil-ladhi bini'matihi tatimmus-salihat.",
        translation: "Louange à Allah, par la grâce duquel s'accomplissent les bonnes œuvres.",
        repeatCount: 1,
        virtue: "Rapportée par Ibn Majah.",
      },
    ],
  },
  {
    name: "Doute",
    slug: "doute",
    description: "Que faire et que dire face aux insinuations et doutes concernant la foi.",
    items: [
      {
        title: "Face aux insinuations du doute",
        arabicText: "آمَنْتُ بِاللَّهِ",
        transliteration: "Amantu billah.",
        translation: "Je crois en Allah.",
        repeatCount: 1,
        virtue:
          "Le Prophète ﷺ a enseigné de dire cela et de cesser d'y penser face aux insinuations sur l'origine de la création - rapportée par Al-Bukhari et Muslim.",
      },
    ],
  },
  {
    name: "Repentir",
    slug: "repentir",
    description: "Invocation de repentir, au-delà du Sayyid al-Istighfar des adhkar du matin et du soir.",
    items: [
      {
        title: "Demande de pardon et de repentir",
        arabicText: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
        transliteration: "Rabbighfir li wa tub 'alayya innaka Antat-Tawwabur-Rahim.",
        translation:
          "Seigneur, pardonne-moi et accepte mon repentir, car Tu es Celui qui accueille le repentir, le Très Miséricordieux.",
        repeatCount: 1,
      },
    ],
  },
  {
    name: "Richesse",
    slug: "richesse",
    description: "Invocation pour la subsistance et l'indépendance financière licite.",
    items: [
      {
        title: "Suffisance par le licite",
        arabicText: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
        transliteration: "Allahummak-fini bihalalika 'an haramik, wa aghnini bifadlika 'amman siwak.",
        translation:
          "Ô Allah, suffis-moi par ce qui est licite en me passant de ce qui est illicite, et rends-moi riche par Ta grâce en me passant de tout autre que Toi.",
        repeatCount: 1,
        virtue: "Rapportée par At-Tirmidhi, dua pour être libéré des dettes et de la dépendance envers autrui.",
      },
    ],
  },
  {
    name: "Hajj et 'Umra",
    slug: "hajj-umra",
    description: "Invocation emblématique du pèlerinage.",
    items: [
      {
        title: "La Talbiya",
        arabicText:
          "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ",
        transliteration:
          "Labbayk Allahumma labbayk, labbayka la sharika laka labbayk, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak.",
        translation:
          "Me voici à Ton service, ô Allah, me voici. Me voici, Tu n'as point d'associé, me voici. La louange, le bienfait et la royauté T'appartiennent ; Tu n'as point d'associé.",
        repeatCount: 1,
        virtue:
          "Invocation emblématique récitée dès l'entrée en état de sacralisation (ihram) - rapportée par Al-Bukhari et Muslim.",
      },
    ],
  },
  {
    name: "Louange",
    slug: "louange",
    description: "Formules de glorification et de louange d'Allah.",
    items: [
      {
        title: "Les paroles les plus aimées d'Allah",
        arabicText: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
        transliteration: "Subhanallahi, walhamdulillahi, wa la ilaha illallahu, wallahu akbar.",
        translation: "Gloire à Allah, louange à Allah, il n'y a de divinité qu'Allah, Allah est le plus grand.",
        repeatCount: 1,
        virtue: "Les paroles les plus aimées d'Allah après le Coran - rapportées par Muslim.",
      },
    ],
  },
  {
    name: "Prière",
    slug: "priere",
    description: "Invocation d'ouverture (istiftah) récitée au début de la prière.",
    items: [
      {
        title: "Invocation d'ouverture de la prière",
        arabicText: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَٰهَ غَيْرُكَ",
        transliteration: "Subhanaka Allahumma wa bihamdika, wa tabaraka ismuka, wa ta'ala jadduka, wa la ilaha ghayruk.",
        translation:
          "Gloire à Toi, ô Allah, et louange à Toi. Béni soit Ton nom, exaltée soit Ta majesté, et il n'y a de divinité que Toi.",
        repeatCount: 1,
        virtue: "Récitée après le premier takbir - rapportée par Abu Dawud et At-Tirmidhi.",
      },
    ],
  },
  {
    name: "Société",
    slug: "societe",
    description: "Invocation pour l'unité et la concorde entre croyants.",
    items: [
      {
        title: "Contre la rancune entre croyants",
        arabicText:
          "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِلَّذِينَ آمَنُوا",
        transliteration:
          "Rabbanaghfir lana wa li-ikhwaninal-ladhina sabaquna bil-imani wa la taj'al fi qulubina ghillal-lilladhina amanu.",
        translation:
          "Notre Seigneur, pardonne-nous, ainsi qu'à nos frères qui nous ont précédés dans la foi, et ne mets dans nos cœurs aucune rancune envers ceux qui ont cru. (Coran 59:10)",
        repeatCount: 1,
        referenceUrl: "/quran/59/10",
      },
    ],
  },
  {
    name: "Tentation",
    slug: "tentation",
    description: "Invocation de refuge contre les épreuves et tentations.",
    items: [
      {
        title: "Refuge contre les épreuves",
        arabicText: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْفِتَنِ مَا ظَهَرَ مِنْهَا وَمَا بَطَنَ",
        transliteration: "Allahumma inni a'udhu bika minal-fitani ma zahara minha wa ma batan.",
        translation: "Ô Allah, je cherche refuge auprès de Toi contre les épreuves, apparentes et cachées.",
        repeatCount: 1,
        virtue: "Rapportée par Muslim.",
      },
    ],
  },
  {
    name: "Connaissance",
    slug: "connaissance",
    description: "Invocations pour la recherche d'une connaissance bénéfique.",
    items: [
      {
        title: "Accroître ma connaissance",
        arabicText: "رَبِّ زِدْنِي عِلْمًا",
        transliteration: "Rabbi zidni 'ilma.",
        translation: "Seigneur, accrois mes connaissances. (Coran 20:114)",
        repeatCount: 1,
        referenceUrl: "/quran/20/114",
      },
      {
        title: "Connaissance et action bénéfiques",
        arabicText: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا",
        transliteration: "Allahummanfa'ni bima 'allamtani, wa 'allimni ma yanfa'uni, wa zidni 'ilma.",
        translation:
          "Ô Allah, fais-moi profiter de ce que Tu m'as enseigné, enseigne-moi ce qui m'est utile, et accrois mes connaissances.",
        repeatCount: 1,
        virtue: "Rapportée par At-Tirmidhi et Ibn Majah.",
      },
    ],
  },
  {
    name: "Nuit",
    slug: "nuit",
    description: "La prière de nuit (tahajjud), au-delà des heures obligatoires.",
    items: [
      {
        title: "La prière de nuit (Tahajjud)",
        arabicText: null,
        transliteration: null,
        translation:
          "Et de nuit, éveille-toi en prière, ceci est un supplément pour toi. Il se peut que ton Seigneur t'élève à une position glorieuse. (Coran 17:79)",
        repeatCount: null,
        referenceUrl: "/quran/17/79",
      },
    ],
  },
  {
    name: "Décès",
    slug: "deces",
    description: "Invocation à l'annonce d'un décès ou d'une épreuve.",
    items: [
      {
        title: "À l'annonce d'un décès",
        arabicText:
          "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
        transliteration: "Inna lillahi wa inna ilayhi raji'un. Allahumma'jurni fi musibati wa akhlif li khayran minha.",
        translation:
          "Certes nous sommes à Allah, et c'est à Lui que nous retournons. Ô Allah, récompense-moi dans mon épreuve et remplace-la moi par quelque chose de meilleur.",
        repeatCount: 1,
        virtue: "Rapportée par Muslim.",
      },
    ],
  },
  {
    name: "Mosquée",
    slug: "mosquee",
    description: "Invocations en entrant et en sortant de la mosquée.",
    items: [
      {
        title: "En entrant à la mosquée",
        arabicText: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        transliteration: "Allahummaf-tah li abwaba rahmatik.",
        translation: "Ô Allah, ouvre-moi les portes de Ta miséricorde.",
        repeatCount: 1,
        virtue: "Rapportée par Muslim.",
      },
      {
        title: "En sortant de la mosquée",
        arabicText: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
        transliteration: "Allahumma inni as'aluka min fadlik.",
        translation: "Ô Allah, je Te demande de Ta grâce.",
        repeatCount: 1,
        virtue: "Rapportée par Muslim.",
      },
    ],
  },
  {
    name: "Vêtements",
    slug: "vetements",
    description: "Invocation en mettant un nouveau vêtement.",
    items: [
      {
        title: "En mettant un nouveau vêtement",
        arabicText: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        transliteration: "Alhamdu lillahil-ladhi kasani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah.",
        translation: "Louange à Allah qui m'a vêtu de ceci et me l'a accordé sans nul effort ni force de ma part.",
        repeatCount: 1,
        virtue: "Rapportée par Abu Dawud et At-Tirmidhi.",
      },
    ],
  },
  {
    name: "Ablutions",
    slug: "ablutions",
    description: "Invocation à réciter après avoir accompli le wudu (petites ablutions).",
    items: [
      {
        title: "Après le wudu",
        arabicText: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
        transliteration:
          "Ashhadu an la ilaha illallahu wahdahu la sharika lah, wa ashhadu anna Muhammadan 'abduhu wa rasuluh.",
        translation:
          "J'atteste qu'il n'y a de divinité qu'Allah, Seul, sans associé, et j'atteste que Muhammad est Son serviteur et Son messager.",
        repeatCount: 1,
        virtue: "Les huit portes du Paradis lui sont ouvertes, il peut entrer par celle qu'il souhaite - rapportée par Muslim.",
      },
    ],
  },
  {
    name: "Animaux",
    slug: "animaux",
    description: "Invocations liées aux animaux et aux montures.",
    items: [
      {
        title: "En entendant un coq chanter ou un âne braire",
        arabicText: null,
        transliteration: null,
        translation:
          "En entendant un coq chanter, demander à Allah de Sa grâce, car il aurait vu un ange ; en entendant un âne braire, chercher refuge auprès d'Allah contre le diable, car il aurait vu un diable - rapporté par Al-Bukhari et Muslim.",
        repeatCount: null,
      },
      {
        title: "En montant sur sa monture ou son véhicule",
        arabicText:
          "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ",
        transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun.",
        translation:
          "Gloire à Celui qui a mis ceci à notre service, alors que nous n'aurions pu l'accomplir par nous-mêmes. Et c'est vers notre Seigneur que nous retournerons. (Coran 43:13-14)",
        repeatCount: 1,
        referenceUrl: "/quran/43/13",
      },
    ],
  },
  {
    name: "Maladie",
    slug: "maladie",
    description: "Invocations pour soi-même en cas de maladie ou de douleur.",
    items: [
      {
        title: "Demande de guérison pour soi-même",
        arabicText: "أَذْهِبِ الْبَأْسَ رَبَّ النَّاسِ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",
        transliteration: "Adhhibil-ba'sa Rabban-nas, ishfi Antash-Shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama.",
        translation:
          "Éloigne le mal, Seigneur des hommes, guéris, c'est Toi qui guéris, il n'y a de guérison que la Tienne, une guérison qui ne laisse aucune trace de la maladie.",
        repeatCount: 1,
        virtue: "Rapportée par Al-Bukhari et Muslim, invocation du Prophète ﷺ auprès d'un malade.",
      },
      {
        title: "En cas de douleur localisée",
        arabicText: "أَعُوذُ بِعِزَّةِ اللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ",
        transliteration: "A'udhu bi'izzatillahi wa qudratihi min sharri ma ajidu wa uhadhir.",
        translation: "Je cherche refuge dans la puissance et le pouvoir d'Allah contre le mal que je ressens et que je crains.",
        repeatCount: 7,
        virtue: "Rapportée par Muslim, à dire en posant la main sur l'endroit douloureux.",
      },
    ],
  },
  {
    name: "40 Rabbana",
    slug: "40-rabbana",
    description:
      "Une sélection des invocations coraniques commençant par « Rabbana » (Notre Seigneur), parmi les plus connues et les plus récitées - non une liste canonique unique, les compilations existantes variant d'un ouvrage à l'autre.",
    items: [
      {
        title: "Rabbana atina (le bien ici-bas et dans l'au-delà)",
        arabicText: "وَمِنْهُم مَّن يَقُولُ رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةًۭ وَفِى ٱلْءَاخِرَةِ حَسَنَةًۭ وَقِنَا عَذَابَ ٱلنَّارِ",
        transliteration:
          "Wa minhum mai yaqoolu rabbanaaa aatina fid dunyaa hasanatawn wa fil aakhirati hasanatanw wa qinaa azaaban Naar.",
        translation:
          "Et il est des gens qui disent : « Seigneur ! Accorde-nous belle part ici-bas, et belle part aussi dans l'au-delà, et protège-nous du châtiment du Feu ! » (Coran 2:201)",
        repeatCount: null,
        referenceUrl: "/quran/2/201",
      },
      {
        title: "Rabbana la tu'akhidhna (l'oubli et l'erreur)",
        arabicText:
          "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًۭا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَٰفِرِينَ",
        transliteration:
          "Laa yukalliful-laahu nafsan illaa wus'ahaa ; lahaa maa kasabat wa 'alaihaa maktasabat ; Rabbanaa la tu'aakhiznaa in naseenaaa aw akhtaanaa ; Rabbanaa wa laa tahmil-'alainaaa isran kamaa hamaltahoo 'alal-lazeena min qablinaa ; Rabbanaa wa laa tuhammilnaa maa laa taaqata lanaa bih, wa'fu 'annaa waghfir lanaa warhamnaa ; Anta mawlaanaa fansurnaa 'alal qawmil kaafireen.",
        translation:
          "Allah n'impose à aucune âme une charge supérieure à sa capacité. [...] Notre Seigneur, ne nous sanctionne pas si nous oublions ou commettons une erreur. Notre Seigneur ! Ne nous charge pas d'un fardeau lourd comme Tu as chargé ceux qui vécurent avant nous. Notre Seigneur ! Ne nous impose pas ce que nous ne pouvons supporter, efface nos fautes, pardonne-nous et fais-nous miséricorde. Tu es notre Maître, accorde-nous donc la victoire sur les peuples infidèles. (Coran 2:286, verset complet)",
        repeatCount: null,
        referenceUrl: "/quran/2/286",
      },
      {
        title: "Rabbana la tuzigh (l'égarement du cœur)",
        arabicText: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ ٱلْوَهَّابُ",
        transliteration:
          "Rabbanaa laa tuzigh quloobanaa ba'da iz hadaitanaa wa hab lanaa mil ladunka rahmah ; innaka antal Wahhaab.",
        translation:
          "Seigneur ! Ne laisse pas dévier nos cœurs après que Tu nous aies guidés, et accorde-nous Ta miséricorde. C'est Toi, certes, le Grand Donateur ! (Coran 3:8)",
        repeatCount: null,
        referenceUrl: "/quran/3/8",
      },
      {
        title: "Rabbana innana amanna (la foi et le pardon)",
        arabicText: "ٱلَّذِينَ يَقُولُونَ رَبَّنَآ إِنَّنَآ ءَامَنَّا فَٱغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ ٱلنَّارِ",
        transliteration: "Allazeena yaqooloona Rabbanaaa innanaaa aamannaa faghfir lanaa zunoobanaa wa qinaa 'azaaban Naar.",
        translation:
          "Qui disent : « Ô notre Seigneur, nous avons la foi ; pardonne-nous donc nos péchés, et protège-nous du châtiment du Feu. » (Coran 3:16)",
        repeatCount: null,
        referenceUrl: "/quran/3/16",
      },
      {
        title: "Rabbi ishrah li sadri (l'ouverture de la poitrine)",
        arabicText:
          "قَالَ رَبِّ ٱشْرَحْ لِى صَدْرِى وَيَسِّرْ لِىٓ أَمْرِى وَٱحْلُلْ عُقْدَةًۭ مِّن لِّسَانِى يَفْقَهُوا۟ قَوْلِى",
        transliteration:
          "Qaala Rabbish rah lee sadree, wa yassir leee amree, wahlul 'uqdatam milli saanee, yafqahoo qawlee.",
        translation:
          "[Moïse] dit : « Seigneur, ouvre-moi ma poitrine, et facilite ma mission, et dénoue un nœud en ma langue, afin qu'ils comprennent mes paroles. » (Coran 20:25-28)",
        repeatCount: null,
        referenceUrl: "/quran/20/25",
      },
      {
        title: "Rabbi habli minas-salihin (une descendance vertueuse)",
        arabicText: "رَبِّ هَبْ لِى مِنَ ٱلصَّٰلِحِينَ",
        transliteration: "Rabbi hab lee minas saaliheen.",
        translation: "Seigneur, fais-moi don d'une [descendance] d'entre les vertueux. (Coran 37:100, invocation d'Ibrahim)",
        repeatCount: null,
        referenceUrl: "/quran/37/100",
      },
      {
        title: "Rabbi ij'alni muqimas-salat (l'assiduité à la prière)",
        arabicText:
          "رَبِّ ٱجْعَلْنِى مُقِيمَ ٱلصَّلَوٰةِ وَمِن ذُرِّيَّتِى ۚ رَبَّنَا وَتَقَبَّلْ دُعَآءِ رَبَّنَا ٱغْفِرْ لِى وَلِوَٰلِدَىَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ ٱلْحِسَابُ",
        transliteration:
          "Rabbij 'alnee muqeemas Salaati wa min zurriyyatee Rabbanaa wa taqabbal du'aaa'. Rabbanagh fir lee wa liwaalidaiya wa lilmu'mineena Yawma yaqoomul hisaab.",
        translation:
          "Ô mon Seigneur ! Fais que j'accomplisse assidûment la prière, ainsi qu'une partie de ma descendance ; exauce ma prière, ô notre Seigneur ! Ô notre Seigneur ! Pardonne-moi, ainsi qu'à mes père et mère et aux croyants, le jour de la reddition des comptes. (Coran 14:40-41)",
        repeatCount: null,
        referenceUrl: "/quran/14/40",
      },
      {
        title: "Rabbana hab lana (la joie des yeux)",
        arabicText:
          "وَٱلَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّٰتِنَا قُرَّةَ أَعْيُنٍۢ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
        transliteration:
          "Wallazeena yaqooloona Rabbanaa hab lanaa min azwaajinaa wa zurriyaatinaa qurrata a'yuninw waj 'alnaa lilmuttaqeena Imaamaa.",
        translation:
          "Et qui disent : « Seigneur, donne-nous, en nos épouses et nos descendants, la joie des yeux, et fais de nous un guide pour les pieux. » (Coran 25:74)",
        repeatCount: null,
        referenceUrl: "/quran/25/74",
      },
      {
        title: "Rabbi inni lima anzalta (le besoin en Allah)",
        arabicText: "فَسَقَىٰ لَهُمَا ثُمَّ تَوَلَّىٰٓ إِلَى ٱلظِّلِّ فَقَالَ رَبِّ إِنِّى لِمَآ أَنزَلْتَ إِلَىَّ مِنْ خَيْرٍۢ فَقِيرٌۭ",
        transliteration:
          "Fasaqaa lahumaa summa tawallaaa ilaz zilli faqaala Rabbi innee limaaa anzalta ilaiya min khairin faqeer.",
        translation:
          "Il abreuva [les bêtes] pour elles puis retourna à l'ombre et dit : « Seigneur, j'ai grand besoin du bien que Tu feras descendre vers moi. » (Coran 28:24, invocation de Musa à Madyan)",
        repeatCount: null,
        referenceUrl: "/quran/28/24",
      },
      {
        title: "Rabbi anzilni (une descente bénie)",
        arabicText: "وَقُل رَّبِّ أَنزِلْنِى مُنزَلًۭا مُّبَارَكًۭا وَأَنتَ خَيْرُ ٱلْمُنزِلِينَ",
        transliteration: "Wa qur Rabbi anzilnee munzalam mubaarakanw wa Anta khairul munzileen.",
        translation:
          "Et dis : « Seigneur, fais-moi débarquer d'un débarquement béni. Tu es Celui qui procure le meilleur débarquement. » (Coran 23:29, invocation de Nuh)",
        repeatCount: null,
        referenceUrl: "/quran/23/29",
      },
    ],
  },
];

export async function seedDuas(db: Database): Promise<void> {
  const [refAuthor] = await db
    .insert(authors)
    .values({ name: HISN_AL_MUSLIM.authorName, era: HISN_AL_MUSLIM.authorEra })
    .onConflictDoNothing()
    .returning();
  const refAuthorRow = refAuthor ?? (await db.query.authors.findFirst({ where: eq(authors.name, HISN_AL_MUSLIM.authorName) }));

  const [refSource] = await db
    .insert(sources)
    .values({ title: HISN_AL_MUSLIM.title, type: "book", authorId: refAuthorRow?.id, language: "ar" })
    .onConflictDoNothing()
    .returning();
  const refSourceRow = refSource ?? (await db.query.sources.findFirst({ where: eq(sources.title, HISN_AL_MUSLIM.title) }));
  if (!refSourceRow) throw new Error("Impossible de créer la source Hisn al-Muslim");

  let categoryCount = 0;
  let duaCount = 0;

  for (const [categoryIndex, categorySeed] of CATEGORIES.entries()) {
    const [category] = await db
      .insert(duaCategories)
      .values({
        name: categorySeed.name,
        slug: categorySeed.slug,
        description: categorySeed.description,
        orderIndex: categoryIndex,
      })
      .onConflictDoUpdate({
        target: duaCategories.slug,
        set: { name: categorySeed.name, description: categorySeed.description, orderIndex: categoryIndex },
      })
      .returning();
    categoryCount++;

    for (const [itemIndex, item] of categorySeed.items.entries()) {
      const existing = await db.query.duas.findFirst({
        where: (t, { and, eq: eqOp }) => and(eqOp(t.categoryId, category.id), eqOp(t.orderIndex, itemIndex)),
      });
      const values = {
        title: item.title,
        arabicText: item.arabicText,
        transliteration: item.transliteration,
        translation: item.translation,
        repeatCount: item.repeatCount,
        virtue: item.virtue ?? null,
        referenceUrl: item.referenceUrl ?? null,
        sourceId: refSourceRow.id,
      };
      if (existing) {
        await db.update(duas).set(values).where(eq(duas.id, existing.id));
      } else {
        await db.insert(duas).values({ categoryId: category.id, orderIndex: itemIndex, ...values });
      }
      duaCount++;
    }
  }

  console.log(`Duas: ${categoryCount} categories, ${duaCount} invocations seedees.`);
}
