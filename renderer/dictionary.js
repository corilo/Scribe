// Built-in offline dictionary. Hebrew keys are consonantal (nikud stripped).
// reg: usage register — 'biblical', 'modern', or 'both'
const BUILTIN_HE = {
  "שלום": { he: "שָׁלוֹם", translit: "shalom", pos: "noun m.", root: "שׁ־ל־ם", reg: "both",
    meaning: ["peace, well-being, wholeness", "hello / goodbye (greeting)", "safety, health"],
    ety: "From root שׁ־ל־ם 'to be complete, whole'. Cognate with Arabic salām, Akkadian shalāmu. The greeting sense is post-biblical." },
  "תורה": { he: "תּוֹרָה", translit: "torah", pos: "noun f.", root: "י־ר־ה", reg: "both",
    meaning: ["instruction, teaching, law", "the Torah (Pentateuch)"],
    ety: "From root י־ר־ה 'to throw, shoot, point' → hiphil 'to instruct, direct'. Literally 'that which points the way'." },
  "אלהים": { he: "אֱלֹהִים", translit: "elohim", pos: "noun m.", root: "א־ל־ה", reg: "both",
    meaning: ["God (with singular verbs)", "gods, divine beings", "judges (rare)"],
    ety: "Plural of אֱלוֹהַּ; related to אֵל (el, 'god, might'). The plural form with singular meaning is often called a 'plural of majesty'." },
  "ארץ": { he: "אֶרֶץ", translit: "eretz", pos: "noun f.", root: "א־ר־ץ", reg: "both",
    meaning: ["land, earth, country", "ground"],
    ety: "Common Semitic: Akkadian erṣetu, Arabic arḍ, Aramaic arʿā. In modern usage הָאָרֶץ often means the Land of Israel." },
  "שמים": { he: "שָׁמַיִם", translit: "shamayim", pos: "noun m. dual/pl.", root: "שׁ־מ־ה?", reg: "both",
    meaning: ["heavens, sky"],
    ety: "Always dual/plural in form. Possibly from שָׁם 'there' + מַיִם 'waters' by folk etymology; cognate with Akkadian shamū." },
  "דבר": { he: "דָּבָר", translit: "davar", pos: "noun m.", root: "ד־ב־ר", reg: "both",
    meaning: ["word, speech", "thing, matter, affair"],
    ety: "Root ד־ב־ר 'to speak'. The noun spans both 'word' and 'thing' — in biblical thought speech and reality are intertwined." },
  "מים": { he: "מַיִם", translit: "mayim", pos: "noun m. dual/pl.", root: "מ־י־ם", reg: "both",
    meaning: ["water, waters"],
    ety: "Always dual/plural in form. Common Semitic: Arabic māʾ, Aramaic mayyā, Akkadian mū." },
  "יום": { he: "יוֹם", translit: "yom", pos: "noun m.", root: "י־ו־ם", reg: "both",
    meaning: ["day", "time, period (e.g. בַּיּוֹם הַהוּא 'in that day')"],
    ety: "Common Semitic: Arabic yawm, Akkadian ūmu. Plural יָמִים also means 'era, lifetime'." },
  "לילה": { he: "לַיְלָה", translit: "layla", pos: "noun m.", root: "ל־י־ל", reg: "both",
    meaning: ["night"],
    ety: "Despite the ־ה ending it is masculine. Cognate with Arabic layl, Aramaic lēlyā." },
  "אור": { he: "אוֹר", translit: "or", pos: "noun m.", root: "א־ו־ר", reg: "both",
    meaning: ["light", "daylight, dawn"],
    ety: "Root א־ו־ר 'to be(come) light, shine'. First created thing in Genesis 1:3 (יְהִי אוֹר 'let there be light')." },
  "מלך": { he: "מֶלֶךְ", translit: "melekh", pos: "noun m.", root: "מ־ל־ך", reg: "both",
    meaning: ["king, ruler"],
    ety: "Common Semitic root מ־ל־ך 'to rule, reign'; Akkadian malku, Arabic malik. Verbal form מָלַךְ 'he reigned'." },
  "בית": { he: "בַּיִת", translit: "bayit", pos: "noun m.", root: "ב־י־ת", reg: "both",
    meaning: ["house, home", "household, family", "(construct בֵּית) house of..."],
    ety: "Common Semitic: Arabic bayt, Akkadian bītu. Also the letter name 'bet'. הַבַּיִת 'the Temple' in rabbinic usage." },
  "בן": { he: "בֵּן", translit: "ben", pos: "noun m.", root: "ב־נ־ה", reg: "both",
    meaning: ["son", "member of (בֶּן־ אָדָם 'human being')", "aged (בֶּן שָׁנָה 'a year old')"],
    ety: "Related to root ב־נ־ה 'to build' — children 'build' the family. Cognate: Arabic ibn." },
  "בת": { he: "בַּת", translit: "bat", pos: "noun f.", root: "ב־נ־ה", reg: "both",
    meaning: ["daughter", "girl, member of (fem.)"],
    ety: "Contracted from *bint; cognate Arabic bint. Same root family as בֵּן." },
  "אב": { he: "אָב", translit: "av", pos: "noun m.", root: "א־ב", reg: "both",
    meaning: ["father", "ancestor, forefather", "originator"],
    ety: "Primitive biconsonantal noun, common Semitic: Arabic ab, Akkadian abu. Plural אָבוֹת." },
  "אם": { he: "אֵם", translit: "em", pos: "noun f.", root: "א־מ", reg: "both",
    meaning: ["mother"],
    ety: "Primitive noun; Arabic umm, Akkadian ummu. Note: אִם (im) with hiriq = 'if'." },
  "איש": { he: "אִישׁ", translit: "ish", pos: "noun m.", root: "א־י־שׁ", reg: "both",
    meaning: ["man, husband", "each, everyone (distributive)"],
    ety: "Plural is suppletive: אֲנָשִׁים (anashim), from a different root א־נ־שׁ." },
  "אשה": { he: "אִשָּׁה", translit: "isha", pos: "noun f.", root: "א־נ־שׁ", reg: "both",
    meaning: ["woman, wife"],
    ety: "From *ʾintsha; Genesis 2:23 links it by wordplay to אִישׁ ('she shall be called isha because from ish she was taken')." },
  "לב": { he: "לֵב", translit: "lev", pos: "noun m.", root: "ל־ב־ב", reg: "both",
    meaning: ["heart", "mind, will, inner self"],
    ety: "In biblical anthropology the heart is the seat of thought and decision, not just emotion. Longer form לֵבָב (levav)." },
  "נפש": { he: "נֶפֶשׁ", translit: "nefesh", pos: "noun f.", root: "נ־פ־שׁ", reg: "both",
    meaning: ["soul, life, living being", "person, self", "appetite, desire"],
    ety: "Originally 'throat, breath' (cf. Akkadian napishtu 'throat, life'); hence breath → life → self." },
  "רוח": { he: "רוּחַ", translit: "ruach", pos: "noun f.", root: "ר־ו־ח", reg: "both",
    meaning: ["wind, breath", "spirit, mind"],
    ety: "Semantic span wind → breath → spirit. רוּחַ הַקֹּדֶשׁ 'the holy spirit' in rabbinic Hebrew." },
  "עולם": { he: "עוֹלָם", translit: "olam", pos: "noun m.", root: "ע־ל־ם", reg: "both",
    meaning: ["eternity, forever (biblical: לְעוֹלָם)", "world (post-biblical & modern)"],
    ety: "Biblically 'remote time, eternity'; the sense 'world' developed in rabbinic Hebrew. Perhaps from ע־ל־ם 'to hide' — the hidden distance of time." },
  "אדם": { he: "אָדָם", translit: "adam", pos: "noun m.", root: "א־ד־ם", reg: "both",
    meaning: ["human being, mankind", "Adam (name)"],
    ety: "Linked to אֲדָמָה adamah 'ground, earth' (Genesis 2:7) and possibly אָדֹם adom 'red' (the color of soil)." },
  "אדמה": { he: "אֲדָמָה", translit: "adamah", pos: "noun f.", root: "א־ד־ם", reg: "both",
    meaning: ["ground, soil, land"],
    ety: "Same root family as אָדָם 'human' and אָדֹם 'red'." },
  "ברא": { he: "בָּרָא", translit: "bara", pos: "verb (qal)", root: "ב־ר־א", reg: "biblical",
    meaning: ["to create (used only with God as subject)"],
    ety: "First verb of the Bible (בְּרֵאשִׁית בָּרָא אֱלֹהִים). In the qal stem, only God creates; distinct from עשׂה 'to make'." },
  "ברוך": { he: "בָּרוּךְ", translit: "barukh", pos: "passive participle", root: "ב־ר־ך", reg: "both",
    meaning: ["blessed"],
    ety: "Root ב־ר־ך related to בֶּרֶךְ 'knee' — blessing and kneeling are linked. Opens most Jewish blessings: בָּרוּךְ אַתָּה ה׳." },
  "ברכה": { he: "בְּרָכָה", translit: "berakha", pos: "noun f.", root: "ב־ר־ך", reg: "both",
    meaning: ["blessing", "gift, present (rare)"],
    ety: "Root ב־ר־ך; cf. בֶּרֶךְ 'knee'. In rabbinic usage, a liturgical benediction." },
  "קדוש": { he: "קָדוֹשׁ", translit: "kadosh", pos: "adjective", root: "ק־ד־שׁ", reg: "both",
    meaning: ["holy, sacred, set apart"],
    ety: "Root ק־ד־שׁ 'to be set apart, consecrated'. Core idea is separation for divine purpose, not moral perfection." },
  "קודש": { he: "קֹדֶשׁ", translit: "kodesh", pos: "noun m.", root: "ק־ד־שׁ", reg: "both",
    meaning: ["holiness, sacredness", "sanctuary, holy thing"],
    ety: "Same root as קָדוֹשׁ. לְשׁוֹן הַקֹּדֶשׁ 'the holy tongue' = Hebrew." },
  "ספר": { he: "סֵפֶר", translit: "sefer", pos: "noun m.", root: "ס־פ־ר", reg: "both",
    meaning: ["book, scroll, document"],
    ety: "Root ס־פ־ר covers counting, recounting, writing: סָפַר 'count', סִפֵּר 'tell', סוֹפֵר 'scribe', מִסְפָּר 'number', סִפּוּר 'story'." },
  "מלה": { he: "מִלָּה", translit: "mila", pos: "noun f.", root: "מ־ל־ל", reg: "both",
    meaning: ["word"],
    ety: "From מ־ל־ל 'to utter, speak' (mostly poetic in the Bible; common in Aramaic). Standard modern word for 'word'." },
  "שם": { he: "שֵׁם", translit: "shem", pos: "noun m.", root: "שׁ־מ", reg: "both",
    meaning: ["name", "reputation, renown", "הַשֵּׁם 'The Name' = God"],
    ety: "Common Semitic: Arabic ism, Akkadian shumu. Also the personal name Shem, son of Noah — hence 'Semitic'." },
  "טוב": { he: "טוֹב", translit: "tov", pos: "adjective", root: "ט־ו־ב", reg: "both",
    meaning: ["good, pleasant, right"],
    ety: "Refrain of Genesis 1: וַיַּרְא אֱלֹהִים כִּי־טוֹב 'and God saw that it was good'. Cognate Arabic ṭayyib." },
  "רע": { he: "רַע", translit: "ra", pos: "adjective", root: "ר־ע־ע", reg: "both",
    meaning: ["bad, evil", "harmful, unpleasant"],
    ety: "Root ר־ע־ע 'to be bad, break'. Note רֵעַ (rea) with tsere = 'friend, neighbor' — a different root." },
  "גדול": { he: "גָּדוֹל", translit: "gadol", pos: "adjective", root: "ג־ד־ל", reg: "both",
    meaning: ["big, great, large", "important, elder"],
    ety: "Root ג־ד־ל 'to grow, become great'. Modern לְהַגְדִּיל 'to enlarge', מִגְדָּל 'tower'." },
  "קטן": { he: "קָטָן", translit: "katan", pos: "adjective", root: "ק־ט־ן", reg: "both",
    meaning: ["small, little", "young, insignificant"],
    ety: "Cognate Arabic qaṭīn. Modern הִקְטִין 'to reduce'." },
  "אהבה": { he: "אַהֲבָה", translit: "ahava", pos: "noun f.", root: "א־ה־ב", reg: "both",
    meaning: ["love"],
    ety: "Root א־ה־ב 'to love'. וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ 'love your neighbor as yourself' (Lev 19:18)." },
  "חסד": { he: "חֶסֶד", translit: "chesed", pos: "noun m.", root: "ח־ס־ד", reg: "both",
    meaning: ["loving-kindness, covenant loyalty, mercy", "grace, favor"],
    ety: "Famously hard to translate: loyal love within relationship. גְּמִילוּת חֲסָדִים 'acts of kindness' in rabbinic Hebrew." },
  "אמת": { he: "אֱמֶת", translit: "emet", pos: "noun f.", root: "א־מ־ן", reg: "both",
    meaning: ["truth, faithfulness, reliability"],
    ety: "From root א־מ־ן 'to be firm, reliable' — same root as אָמֵן 'amen' and אֱמוּנָה 'faith'. Spelled with first, middle and last letters of the alphabet." },
  "אמן": { he: "אָמֵן", translit: "amen", pos: "interjection", root: "א־מ־ן", reg: "both",
    meaning: ["amen — 'truly, so be it'"],
    ety: "From א־מ־ן 'to be firm, confirm'. Borrowed from Hebrew into Greek, Latin and nearly every European language." },
  "צדק": { he: "צֶדֶק", translit: "tzedek", pos: "noun m.", root: "צ־ד־ק", reg: "both",
    meaning: ["righteousness, justice"],
    ety: "Root צ־ד־ק; derivatives: צַדִּיק tzaddik 'righteous person', צְדָקָה tzedaka 'righteousness; charity (post-biblical)'." },
  "צדקה": { he: "צְדָקָה", translit: "tzedaka", pos: "noun f.", root: "צ־ד־ק", reg: "both",
    meaning: ["righteousness (biblical)", "charity, almsgiving (post-biblical & modern)"],
    ety: "The shift from 'righteousness' to 'charity' reflects the rabbinic view that giving to the poor is justice, not optional kindness." },
  "עין": { he: "עַיִן", translit: "ayin", pos: "noun f.", root: "ע־י־ן", reg: "both",
    meaning: ["eye", "spring, fountain", "appearance"],
    ety: "Common Semitic; also the letter name. 'Spring' as the 'eye' of the landscape. Dual עֵינַיִם." },
  "יד": { he: "יָד", translit: "yad", pos: "noun f.", root: "י־ד", reg: "both",
    meaning: ["hand", "power, control", "memorial, monument"],
    ety: "Primitive noun. Extensive idioms: בְּיַד 'by the hand of / through', יָד חֲזָקָה 'strong hand'. Also the Torah pointer." },
  "ראש": { he: "רֹאשׁ", translit: "rosh", pos: "noun m.", root: "ר־א־שׁ", reg: "both",
    meaning: ["head", "top, chief, beginning"],
    ety: "Common Semitic: Arabic raʾs, Akkadian rēshu. In רֹאשׁ הַשָּׁנָה 'head of the year' = New Year. Basis of רֵאשִׁית 'beginning' (first word of the Bible: בְּרֵאשִׁית)." },
  "דרך": { he: "דֶּרֶךְ", translit: "derekh", pos: "noun f./m.", root: "ד־ר־ך", reg: "both",
    meaning: ["way, road, path", "manner, custom"],
    ety: "Root ד־ר־ך 'to tread'. דֶּרֶךְ אֶרֶץ 'the way of the land' = proper conduct, courtesy (rabbinic)." },
  "עיר": { he: "עִיר", translit: "ir", pos: "noun f.", root: "ע־י־ר", reg: "both",
    meaning: ["city, town"],
    ety: "Plural is irregular: עָרִים (arim). Possibly originally 'guarded place' (cf. ע־ו־ר 'to watch, rouse')." },
  "עם": { he: "עַם", translit: "am", pos: "noun m.", root: "ע־מ־ם", reg: "both",
    meaning: ["people, nation", "kinsfolk"],
    ety: "עַם יִשְׂרָאֵל 'the people of Israel'. Note עִם (im) with hiriq = 'with'. Cognate Arabic ʿamm 'paternal uncle' — kinship core." },
  "מלחמה": { he: "מִלְחָמָה", translit: "milchama", pos: "noun f.", root: "ל־ח־ם", reg: "both",
    meaning: ["war, battle"],
    ety: "From root ל־ח־ם 'to fight'. Same consonants as לֶחֶם 'bread' — possibly from a shared idea of 'close engagement', though the connection is debated." },
  "לחם": { he: "לֶחֶם", translit: "lechem", pos: "noun m.", root: "ל־ח־ם", reg: "both",
    meaning: ["bread", "food in general"],
    ety: "In Arabic the cognate laḥm means 'meat' — each language kept its staple food. בֵּית לֶחֶם Bethlehem = 'house of bread'." },
  "שנה": { he: "שָׁנָה", translit: "shana", pos: "noun f.", root: "שׁ־נ־ה", reg: "both",
    meaning: ["year"],
    ety: "Root שׁ־נ־ה 'to repeat, change' — a year is a repetition. Same root gives מִשְׁנָה Mishnah ('repeated teaching') and שֵׁנִי 'second'." },
  "עת": { he: "עֵת", translit: "et", pos: "noun f.", root: "ע־נ־ה?", reg: "both",
    meaning: ["time, season, proper moment"],
    ety: "לַכֹּל זְמָן וְעֵת לְכָל־חֵפֶץ 'for everything there is a season' (Ecclesiastes 3:1). Note אֵת/אֶת = object marker, different word." },
  "קול": { he: "קוֹל", translit: "kol", pos: "noun m.", root: "ק־ו־ל", reg: "both",
    meaning: ["voice, sound", "thunder (קֹלוֹת)"],
    ety: "Note כֹּל (kol) with kaf = 'all, every' — a different word. קוֹל דְּמָמָה דַקָּה 'a still small voice' (1 Kings 19:12)." },
  "כל": { he: "כֹּל", translit: "kol", pos: "noun/quantifier", root: "כ־ל־ל", reg: "both",
    meaning: ["all, every, whole"],
    ety: "Root כ־ל־ל 'to complete, include'. Construct form כָּל־. Derivatives: כְּלָל 'rule, totality', כָּלִיל 'entirely'." },
  "עבודה": { he: "עֲבוֹדָה", translit: "avoda", pos: "noun f.", root: "ע־ב־ד", reg: "both",
    meaning: ["work, labor", "service, worship (esp. Temple service)"],
    ety: "Root ע־ב־ד 'to work, serve'; עֶבֶד 'servant, slave'. The Temple liturgy and modern 'job' share one word." },
  "מצוה": { he: "מִצְוָה", translit: "mitzva", pos: "noun f.", root: "צ־ו־ה", reg: "both",
    meaning: ["commandment", "good deed (colloquial)"],
    ety: "From צ־ו־ה 'to command'. Traditionally 613 mitzvot in the Torah. Colloquially, any good deed." },
  "חיים": { he: "חַיִּים", translit: "chayim", pos: "noun m. pl.", root: "ח־י־ה", reg: "both",
    meaning: ["life"],
    ety: "Plural in form ('lives'), singular in sense. Root ח־י־ה 'to live'. לְחַיִּים 'to life!' — the toast. Also a personal name." },
  "מות": { he: "מָוֶת", translit: "mavet", pos: "noun m.", root: "מ־ו־ת", reg: "both",
    meaning: ["death"],
    ety: "Root מ־ו־ת 'to die' (מֵת met 'dead, he died'). Common Semitic: Arabic mawt, Akkadian mūtu." },
  "אחד": { he: "אֶחָד", translit: "echad", pos: "numeral", root: "א־ח־ד", reg: "both",
    meaning: ["one", "single, unique"],
    ety: "Featured in the Shema: ה׳ אֶחָד 'the LORD is one' (Deut 6:4). Feminine אַחַת (achat)." },
  "לא": { he: "לֹא", translit: "lo", pos: "negative particle", root: "—", reg: "both",
    meaning: ["no, not"],
    ety: "Common Semitic negation: Arabic lā, Akkadian lā. Negates verbs and the Ten Commandments' prohibitions (לֹא תִרְצָח)." },
  "כן": { he: "כֵּן", translit: "ken", pos: "adverb", root: "כ־ו־ן", reg: "both",
    meaning: ["yes (modern)", "so, thus (biblical)"],
    ety: "Biblically 'thus, so' (וַיְהִי־כֵן 'and it was so'); the sense 'yes' is modern. From כ־ו־ן 'to be firm, established'." },
  "תודה": { he: "תּוֹדָה", translit: "toda", pos: "noun f.", root: "י־ד־ה", reg: "both",
    meaning: ["thanks, gratitude (modern: 'thank you')", "thanksgiving offering (biblical)"],
    ety: "From root י־ד־ה (hiphil הוֹדָה 'to thank, acknowledge'). Same root as the name יְהוּדָה Judah — hence 'Jew' ultimately means 'one who thanks'." },
  "בבקשה": { he: "בְּבַקָּשָׁה", translit: "bevakasha", pos: "interjection", root: "ב־ק־שׁ", reg: "modern",
    meaning: ["please", "you're welcome; here you are"],
    ety: "Literally 'with a request', from בַּקָּשָׁה 'request', root ב־ק־שׁ 'to seek'." },
  "סליחה": { he: "סְלִיחָה", translit: "slicha", pos: "noun f. / interjection", root: "ס־ל־ח", reg: "both",
    meaning: ["excuse me, sorry (modern)", "forgiveness, pardon"],
    ety: "Root ס־ל־ח 'to forgive' — in the Bible used only of divine forgiveness. סְלִיחוֹת: penitential prayers before the High Holidays." },
  "אני": { he: "אֲנִי", translit: "ani", pos: "pronoun", root: "—", reg: "both",
    meaning: ["I"],
    ety: "Longer biblical form אָנֹכִי (anokhi). Note עָנִי (ani, with ayin) = 'poor'." },
  "אתה": { he: "אַתָּה", translit: "ata", pos: "pronoun", root: "—", reg: "both",
    meaning: ["you (masculine singular)"],
    ety: "Feminine אַתְּ (at). From Proto-Semitic *ʾanta (cf. Arabic anta)." },
  "הוא": { he: "הוּא", translit: "hu", pos: "pronoun", root: "—", reg: "both",
    meaning: ["he, it", "that (demonstrative)"],
    ety: "Also serves as copula: דָּוִד הוּא הַמֶּלֶךְ 'David is the king'. Feminine הִיא (hi)." },
  "אנחנו": { he: "אֲנַחְנוּ", translit: "anachnu", pos: "pronoun", root: "—", reg: "both",
    meaning: ["we"],
    ety: "Biblical short form נַחְנוּ occurs rarely. Cf. Arabic naḥnu." },
  "מה": { he: "מָה", translit: "ma", pos: "interrogative", root: "—", reg: "both",
    meaning: ["what?", "how! (exclamation: מַה־טֹּבוּ 'how good are...')"],
    ety: "Common Semitic interrogative: Arabic mā. Vowel varies (מַה/מָה/מֶה) by phonetic context." },
  "מי": { he: "מִי", translit: "mi", pos: "interrogative", root: "—", reg: "both",
    meaning: ["who?"],
    ety: "Common Semitic: Arabic man, Akkadian mannu. מִי כָמֹכָה 'Who is like You?' (Exodus 15:11)." },
  "כתב": { he: "כָּתַב", translit: "katav", pos: "verb (qal)", root: "כ־ת־ב", reg: "both",
    meaning: ["to write"],
    ety: "Root כ־ת־ב: מִכְתָּב 'letter', כְּתָב 'script', כְּתוּבָּה ketubah 'marriage contract', הַכְתָּבָה 'dictation'." },
  "קרא": { he: "קָרָא", translit: "kara", pos: "verb (qal)", root: "ק־ר־א", reg: "both",
    meaning: ["to call, name", "to read (aloud)", "to summon, proclaim"],
    ety: "Reading was aloud in antiquity, so 'call' and 'read' are one verb. מִקְרָא 'Scripture', קְרִיאָה 'reading'." },
  "אמר": { he: "אָמַר", translit: "amar", pos: "verb (qal)", root: "א־מ־ר", reg: "both",
    meaning: ["to say, speak"],
    ety: "The Bible's most frequent verb of speech (וַיֹּאמֶר 'and he said'). Derivatives: אִמְרָה 'utterance', מַאֲמָר 'article, statement'." },
  "הלך": { he: "הָלַךְ", translit: "halakh", pos: "verb (qal)", root: "ה־ל־ך", reg: "both",
    meaning: ["to go, walk"],
    ety: "Source of הֲלָכָה halakha — Jewish law, literally 'the way one walks'. הִתְהַלֵּךְ 'to walk about' (Enoch walked with God)." },
  "ידע": { he: "יָדַע", translit: "yada", pos: "verb (qal)", root: "י־ד־ע", reg: "both",
    meaning: ["to know", "to know intimately, experience"],
    ety: "Knowledge in Hebrew is experiential, not only intellectual. Derivatives: דַּעַת 'knowledge', מַדָּע 'science', מוֹדָע 'acquaintance'." },
  "ראה": { he: "רָאָה", translit: "ra'a", pos: "verb (qal)", root: "ר־א־ה", reg: "both",
    meaning: ["to see", "to perceive, understand", "to provide (Gen 22:8)"],
    ety: "Derivatives: מַרְאֶה 'appearance', רְאִיָּה 'sight; proof', מַרְאָה 'mirror'." },
  "שמע": { he: "שָׁמַע", translit: "shama", pos: "verb (qal)", root: "שׁ־מ־ע", reg: "both",
    meaning: ["to hear, listen", "to obey, heed"],
    ety: "Hearing and obeying share one verb — שְׁמַע יִשְׂרָאֵל 'Hear, O Israel' commands both. Derivative: מִשְׁמַעַת 'discipline'." },
  "עשה": { he: "עָשָׂה", translit: "asa", pos: "verb (qal)", root: "ע־שׂ־ה", reg: "both",
    meaning: ["to do, make"],
    ety: "Derivatives: מַעֲשֶׂה 'deed, story', תַּעֲשִׂיָּה 'industry'. נַעֲשֶׂה וְנִשְׁמָע 'we will do and we will hear' (Exodus 24:7)." },
  "נתן": { he: "נָתַן", translit: "natan", pos: "verb (qal)", root: "נ־ת־ן", reg: "both",
    meaning: ["to give", "to put, place", "to allow"],
    ety: "A palindrome root (נתן reads the same both ways). Derivatives: מַתָּנָה 'gift', the names נָתָן Nathan and יוֹנָתָן Jonathan ('God has given')." },
  "אכל": { he: "אָכַל", translit: "akhal", pos: "verb (qal)", root: "א־כ־ל", reg: "both",
    meaning: ["to eat", "to consume, devour (of fire, sword)"],
    ety: "Derivatives: אֹכֶל 'food', מַאֲכָל 'dish'. Cognate Arabic akala." },
  "בוא": { he: "בּוֹא", translit: "bo", pos: "verb (qal)", root: "ב־ו־א", reg: "both",
    meaning: ["to come, enter", "(hiphil הֵבִיא) to bring"],
    ety: "One of the most frequent biblical verbs. בָּרוּךְ הַבָּא 'blessed is the one who comes' = 'welcome'." },
  "ישב": { he: "יָשַׁב", translit: "yashav", pos: "verb (qal)", root: "י־שׁ־ב", reg: "both",
    meaning: ["to sit", "to dwell, inhabit"],
    ety: "Derivatives: מוֹשָׁב 'seat; settlement', יְשִׁיבָה yeshiva 'sitting; Torah academy', תּוֹשָׁב 'resident'." },
  "אהב": { he: "אָהַב", translit: "ahav", pos: "verb (qal)", root: "א־ה־ב", reg: "both",
    meaning: ["to love"],
    ety: "Derivatives: אַהֲבָה 'love', אָהוּב 'beloved'. Cognate with Arabic ḥabba (metathesis)." },
  "למד": { he: "לָמַד", translit: "lamad", pos: "verb (qal)", root: "ל־מ־ד", reg: "both",
    meaning: ["to learn", "(piel לִמֵּד) to teach"],
    ety: "Derivatives: תַּלְמוּד Talmud 'learning', תַּלְמִיד 'student', מְלַמֵּד 'teacher'. Possibly from goading cattle (מַלְמָד 'ox-goad')." },
  "ישראל": { he: "יִשְׂרָאֵל", translit: "yisrael", pos: "proper noun", root: "שׂ־ר־ה + אֵל", reg: "both",
    meaning: ["Israel (patriarch Jacob's new name; the people; the modern state)"],
    ety: "Genesis 32:29: 'for you have striven (שָׂרִיתָ) with God (אֱלֹהִים) and with men and prevailed' — 'he strives with God'." },
  "ירושלים": { he: "יְרוּשָׁלַיִם", translit: "yerushalayim", pos: "proper noun", root: "—", reg: "both",
    meaning: ["Jerusalem"],
    ety: "Attested as Urusalim in Amarna letters (14th c. BCE) — probably 'foundation of (the god) Shalem'; tradition hears יְרוּ 'city/foundation' + שָׁלוֹם 'peace'." },
  "שבת": { he: "שַׁבָּת", translit: "shabbat", pos: "noun f.", root: "שׁ־ב־ת", reg: "both",
    meaning: ["Sabbath, Saturday", "week (rabbinic, in dates)"],
    ety: "From שׁ־ב־ת 'to cease, rest' (Genesis 2:2-3). Loaned into Greek sabbaton, thence 'Sabbath', Spanish sábado, etc." },
  "משפחה": { he: "מִשְׁפָּחָה", translit: "mishpacha", pos: "noun f.", root: "שׁ־פ־ח", reg: "both",
    meaning: ["family", "clan (biblical)"],
    ety: "Biblically a clan — wider than the modern nuclear family. Possibly related to שִׁפְחָה 'maidservant' (household members)." },
  "ילד": { he: "יֶלֶד", translit: "yeled", pos: "noun m.", root: "י־ל־ד", reg: "both",
    meaning: ["boy, child"],
    ety: "Root י־ל־ד 'to give birth'. Family: יַלְדָּה 'girl', יְלָדִים 'children', מוֹלֶדֶת 'homeland', תּוֹלְדוֹת 'generations'." },
  "בוקר": { he: "בֹּקֶר", translit: "boker", pos: "noun m.", root: "ב־ק־ר", reg: "both",
    meaning: ["morning"],
    ety: "From ב־ק־ר 'to split' — dawn splits the darkness; or 'to inspect' (time of inspecting herds; cf. בָּקָר 'cattle'). בֹּקֶר טוֹב 'good morning'." },
  "ערב": { he: "עֶרֶב", translit: "erev", pos: "noun m.", root: "ע־ר־ב", reg: "both",
    meaning: ["evening", "eve (of a holiday)"],
    ety: "From ע־ר־ב 'to set (of the sun); mix'. וַיְהִי־עֶרֶב וַיְהִי־בֹקֶר 'and there was evening and there was morning' — hence the Jewish day begins at sunset. Related: מַעֲרָב 'west'." },
  "אחר": { he: "אַחֵר", translit: "acher", pos: "adjective", root: "א־ח־ר", reg: "both",
    meaning: ["other, another", "(אַחַר) after, behind"],
    ety: "Root א־ח־ר 'to be behind, tarry'. Family: אַחֲרֵי 'after', מָחָר 'tomorrow', אַחֲרוֹן 'last'." },
  "עכשיו": { he: "עַכְשָׁו", translit: "akhshav", pos: "adverb", root: "—", reg: "modern",
    meaning: ["now"],
    ety: "Rabbinic Hebrew, perhaps from עַד כְּשָׁעָה 'up to this hour'. The biblical equivalent is עַתָּה (ata)." },
  "פה": { he: "פֹּה", translit: "po", pos: "adverb", root: "—", reg: "both",
    meaning: ["here"],
    ety: "Note פֶּה (pe) = 'mouth', also the letter name. Modern אֵיפֹה 'where?' = אֵי + פֹה 'which here?'." },
  "היה": { he: "הָיָה", translit: "haya", pos: "verb (qal)", root: "ה־י־ה", reg: "both",
    meaning: ["to be, become, happen"],
    ety: "The root behind the Tetragrammaton יהוה is traditionally connected to ה־י־ה/ה־ו־ה 'to be' — אֶהְיֶה אֲשֶׁר אֶהְיֶה 'I will be what I will be' (Exodus 3:14)." },
  "רצה": { he: "רָצָה", translit: "ratza", pos: "verb (qal)", root: "ר־צ־ה", reg: "both",
    meaning: ["to want, desire (modern)", "to be pleased with, accept favorably (biblical)"],
    ety: "Derivatives: רָצוֹן 'will, favor', רָצוּי 'desirable'. בִּרְצוֹנוֹ 'willingly'." },
  "דוד": { he: "דָּוִד", translit: "david", pos: "proper noun", root: "ד־ו־ד", reg: "both",
    meaning: ["David (king of Israel)", "(דּוֹד dod) uncle; beloved"],
    ety: "Probably 'beloved', from דּוֹד 'beloved' (as in Song of Songs דּוֹדִי 'my beloved'). מָגֵן דָּוִד 'Shield of David' = Star of David." },
  "משיח": { he: "מָשִׁיחַ", translit: "mashiach", pos: "noun m.", root: "מ־שׁ־ח", reg: "both",
    meaning: ["anointed one, messiah"],
    ety: "From מ־שׁ־ח 'to anoint (with oil)'. Kings and priests were anointed. Via Greek christos ('anointed') gives 'Christ'; via Aramaic, English 'messiah'." },
  "תפלה": { he: "תְּפִלָּה", translit: "tefila", pos: "noun f.", root: "פ־ל־ל", reg: "both",
    meaning: ["prayer"],
    ety: "From פ־ל־ל 'to intercede, judge'; hitpael הִתְפַּלֵּל 'to pray' — perhaps literally 'to judge oneself'. Plural תְּפִלִּין tefillin (phylacteries)." },
  "חכמה": { he: "חָכְמָה", translit: "chokhma", pos: "noun f.", root: "ח־כ־ם", reg: "both",
    meaning: ["wisdom, skill"],
    ety: "Biblical wisdom includes craftsmanship (Exodus 31:3). רֵאשִׁית חָכְמָה יִרְאַת ה׳ 'the beginning of wisdom is the fear of the LORD' (Psalm 111:10)." },
  "כבוד": { he: "כָּבוֹד", translit: "kavod", pos: "noun m.", root: "כ־ב־ד", reg: "both",
    meaning: ["honor, glory", "the divine Presence (כְּבוֹד ה׳)"],
    ety: "Root כ־ב־ד 'to be heavy' — glory is 'weightiness'. Modern כָּל הַכָּבוֹד 'well done!' (literally 'all the honor')." },
  "גם": { he: "גַּם", translit: "gam", pos: "particle", root: "—", reg: "both",
    meaning: ["also, too, even"],
    ety: "גַּם... וְגַם 'both... and'. גַּם זוּ לְטוֹבָה 'this too is for the best' (rabbinic saying)." },
  "רק": { he: "רַק", translit: "rak", pos: "adverb", root: "ר־ק־ק", reg: "both",
    meaning: ["only, just"],
    ety: "From an adjective meaning 'thin' (רַק, cf. Gen 41:19 'thin cows') → restricted → only." },
  "אבל": { he: "אֲבָל", translit: "aval", pos: "conjunction", root: "—", reg: "both",
    meaning: ["but, however (modern)", "verily, indeed (biblical)"],
    ety: "Meaning shifted from biblical 'truly' to modern 'but'. Note אָבֵל (avel) = 'mourner', אֵבֶל (evel) = 'mourning'." },
  "אוהב": { he: "אוֹהֵב", translit: "ohev", pos: "participle", root: "א־ה־ב", reg: "both",
    meaning: ["loving; (I/you/he) love(s)", "friend (biblical noun)"],
    ety: "Qal participle of אָהַב 'to love'; modern Hebrew uses participles as present tense: אֲנִי אוֹהֵב 'I love'." },
  "יפה": { he: "יָפֶה", translit: "yafe", pos: "adjective", root: "י־פ־ה", reg: "both",
    meaning: ["beautiful, nice", "well, properly (adverb, modern)"],
    ety: "Feminine יָפָה. יְפֵה־נוֹף 'beautiful of vista' (Psalm 48:3, of Jerusalem). Modern slang יָפֶה! 'nice!'" },
  "חבר": { he: "חָבֵר", translit: "chaver", pos: "noun m.", root: "ח־ב־ר", reg: "both",
    meaning: ["friend, companion", "member (of a group)"],
    ety: "Root ח־ב־ר 'to join, bind'. Family: חֶבְרָה 'society, company', חִבּוּר 'composition; connection', מַחְבֶּרֶת 'notebook'." },
  "עברית": { he: "עִבְרִית", translit: "ivrit", pos: "noun f.", root: "ע־ב־ר", reg: "modern",
    meaning: ["Hebrew (language)"],
    ety: "From עִבְרִי 'Hebrew (person)', traditionally linked to עֵבֶר Eber (Gen 10:21) or ע־ב־ר 'to cross over' — Abraham 'the one from beyond' the river. The Bible calls the language יְהוּדִית or 'the language of Canaan'." },
  "מדבר": { he: "מִדְבָּר", translit: "midbar", pos: "noun m.", root: "ד־ב־ר", reg: "both",
    meaning: ["wilderness, desert", "(מְדַבֵּר medaber) speaking"],
    ety: "Perhaps from ד־ב־ר in the sense 'to drive (flocks)' — pastureland beyond settlement. Same consonants as מְדַבֵּר 'speaking' — context and vowels decide." },
  "ברית": { he: "בְּרִית", translit: "brit", pos: "noun f.", root: "ב־ר־ה?", reg: "both",
    meaning: ["covenant, pact", "circumcision (בְּרִית מִילָה)"],
    ety: "Covenants were 'cut' (כָּרַת בְּרִית) — possibly from ב־ר־ה 'to cut/eat', sealed over a meal. 'B'nai B'rith' = children of the covenant." },
  "זמן": { he: "זְמַן", translit: "zman", pos: "noun m.", root: "ז־מ־ן", reg: "both",
    meaning: ["time", "term, semester (modern)"],
    ety: "Late biblical loan from Aramaic/Persian. שֶׁהֶחֱיָנוּ... לַזְּמַן הַזֶּה '...who brought us to this time' (blessing)." },
  "טעם": { he: "טַעַם", translit: "ta'am", pos: "noun m.", root: "ט־ע־ם", reg: "both",
    meaning: ["taste, flavor", "reason, sense", "cantillation mark (טְעָמִים)"],
    ety: "From physical taste → discernment → meaning. טַעֲמֵי הַמִּקְרָא: the musical accents of Scripture." },
  "ספרות": { he: "סִפְרוּת", translit: "sifrut", pos: "noun f.", root: "ס־פ־ר", reg: "modern",
    meaning: ["literature"],
    ety: "Modern coinage from סֵפֶר 'book' + abstract suffix ־וּת." },
  "מלון": { he: "מִלּוֹן", translit: "milon", pos: "noun m.", root: "מ־ל־ל", reg: "modern",
    meaning: ["dictionary", "(מָלוֹן malon) hotel, inn"],
    ety: "מִלּוֹן 'dictionary' coined by Eliezer Ben-Yehuda from מִלָּה 'word'. מָלוֹן 'inn' is biblical, from ל־ו־ן 'to lodge overnight'." }
};

// Small built-in English glossary for instant hover on very common words.
const BUILTIN_EN = {
  "the": { pos: "article", meaning: ["definite article: refers to a specific thing"], ety: "Old English 'se/seo/þæt'; 'th-' form generalized in Middle English." },
  "and": { pos: "conjunction", meaning: ["connects words or clauses"], ety: "Old English 'and/ond', from Proto-Germanic *andi." },
  "of": { pos: "preposition", meaning: ["belonging to; relating to"], ety: "Old English 'of' ('away from'), from Proto-Germanic *af." },
  "to": { pos: "preposition/particle", meaning: ["in the direction of; infinitive marker"], ety: "Old English 'tō', from Proto-Germanic *tō." },
  "in": { pos: "preposition", meaning: ["located inside; within"], ety: "Old English 'in', from Proto-Germanic *in; cognate Latin 'in'." },
  "a": { pos: "article", meaning: ["indefinite article: one, any"], ety: "Reduced form of 'an', from Old English 'ān' (one)." },
  "is": { pos: "verb", meaning: ["third person singular of 'be'"], ety: "Old English 'is', from Proto-Indo-European *h1esti (cf. Latin est)." },
  "you": { pos: "pronoun", meaning: ["second person pronoun"], ety: "Old English 'ēow', originally the object/plural form; replaced 'thou'." },
  "that": { pos: "pronoun/conjunction", meaning: ["demonstrative; introduces clauses"], ety: "Old English 'þæt', neuter demonstrative." },
  "it": { pos: "pronoun", meaning: ["third person neuter pronoun"], ety: "Old English 'hit'; the h- was lost in unstressed positions." },
  "for": { pos: "preposition", meaning: ["intended to belong to; because of"], ety: "Old English 'for', from Proto-Germanic *fur." },
  "with": { pos: "preposition", meaning: ["accompanied by; using"], ety: "Old English 'wið' ('against'); sense shifted under Norse influence." },
  "word": { pos: "noun", meaning: ["a unit of language", "a promise (give one's word)"], ety: "Old English 'word', from Proto-Germanic *wurdą; PIE *werdh-, cognate with Latin 'verbum'." },
  "language": { pos: "noun", meaning: ["system of communication", "a particular tongue"], ety: "From Old French 'langage', from Latin 'lingua' (tongue)." },
  "write": { pos: "verb", meaning: ["to form letters; to compose text"], ety: "Old English 'wrītan' ('to scratch, carve') — writing began as incising runes." },
  "read": { pos: "verb", meaning: ["to interpret written text"], ety: "Old English 'rǣdan' ('to advise, interpret') — reading was interpreting signs." },
  "book": { pos: "noun", meaning: ["a written work; bound pages"], ety: "Old English 'bōc', related to 'beech' — early runes were carved on beechwood." },
  "meaning": { pos: "noun", meaning: ["what is intended or signified"], ety: "From Old English 'mænan' ('to intend, signify')." },
  "peace": { pos: "noun", meaning: ["absence of war; tranquility"], ety: "From Old French 'pais', from Latin 'pax'. Displaced native 'frith' (Old English friþ)." },
  "holy": { pos: "adjective", meaning: ["sacred, consecrated"], ety: "Old English 'hālig', from 'hāl' (whole, healthy) — same family as 'whole', 'heal', 'hale'." }
};


// Spelling aliases: defective (biblical) vs plene (modern) spellings
const HE_ALIASES = { "קדש": "קודש", "בקר": "בוקר", "עכשו": "עכשיו", "חכמת": "חכמה", "תפילה": "תפלה", "מצווה": "מצוה", "עבדה": "עבודה" };
for (const [alias, key] of Object.entries(HE_ALIASES)) {
  if (BUILTIN_HE[key] && !BUILTIN_HE[alias]) BUILTIN_HE[alias] = BUILTIN_HE[key];
}

// Nikud + cantillation stripper
function stripNikud(s) {
  return s.replace(/[֑-ׇ]/g, '');
}

function builtinLookup(word, lang) {
  if (lang === 'he') {
    const bare = stripNikud(word);
    if (BUILTIN_HE[bare]) return { ...BUILTIN_HE[bare], key: bare, lang: 'he' };
    // try stripping common prefixes (ו, ה, ב, ל, כ, מ, ש)
    const prefixes = ['ו', 'ה', 'ב', 'ל', 'כ', 'מ', 'ש', 'וה', 'וב', 'ול', 'שה', 'מה', 'בה', 'לה', 'כש'];
    for (const p of prefixes) {
      if (bare.startsWith(p) && BUILTIN_HE[bare.slice(p.length)]) {
        const e = BUILTIN_HE[bare.slice(p.length)];
        return { ...e, key: bare.slice(p.length), prefix: p, lang: 'he' };
      }
    }
    return null;
  }
  const lower = word.toLowerCase();
  if (BUILTIN_EN[lower]) return { ...BUILTIN_EN[lower], key: lower, lang: 'en' };
  return null;
}

/* ---------------- Hebrew alphabet (letter explanations) ---------------- */
const HEB_LETTERS = {
  'א': { name: 'Alef',   sound: 'silent (glottal stop)', gematria: 1 },
  'ב': { name: 'Bet',    sound: 'b (with dagesh) / v',   gematria: 2 },
  'ג': { name: 'Gimel',  sound: 'g',                     gematria: 3 },
  'ד': { name: 'Dalet',  sound: 'd',                     gematria: 4 },
  'ה': { name: 'He',     sound: 'h',                     gematria: 5 },
  'ו': { name: 'Vav',    sound: 'v (also vowels o/u)',   gematria: 6 },
  'ז': { name: 'Zayin',  sound: 'z',                     gematria: 7 },
  'ח': { name: 'Chet',   sound: 'ch (as in Bach)',       gematria: 8 },
  'ט': { name: 'Tet',    sound: 't',                     gematria: 9 },
  'י': { name: 'Yod',    sound: 'y (also vowel i/e)',    gematria: 10 },
  'כ': { name: 'Kaf',    sound: 'k (with dagesh) / kh',  gematria: 20, final: 'ך' },
  'ך': { name: 'Kaf (final)',   sound: 'kh', gematria: 20, finalOf: 'כ' },
  'ל': { name: 'Lamed',  sound: 'l',                     gematria: 30 },
  'מ': { name: 'Mem',    sound: 'm',                     gematria: 40, final: 'ם' },
  'ם': { name: 'Mem (final)',   sound: 'm',  gematria: 40, finalOf: 'מ' },
  'נ': { name: 'Nun',    sound: 'n',                     gematria: 50, final: 'ן' },
  'ן': { name: 'Nun (final)',   sound: 'n',  gematria: 50, finalOf: 'נ' },
  'ס': { name: 'Samekh', sound: 's',                     gematria: 60 },
  'ע': { name: 'Ayin',   sound: 'silent (guttural)',     gematria: 70 },
  'פ': { name: 'Pe',     sound: 'p (with dagesh) / f',   gematria: 80, final: 'ף' },
  'ף': { name: 'Pe (final)',    sound: 'f',  gematria: 80, finalOf: 'פ' },
  'צ': { name: 'Tsadi',  sound: 'ts',                    gematria: 90, final: 'ץ' },
  'ץ': { name: 'Tsadi (final)', sound: 'ts', gematria: 90, finalOf: 'צ' },
  'ק': { name: 'Qof',    sound: 'k',                     gematria: 100 },
  'ר': { name: 'Resh',   sound: 'r',                     gematria: 200 },
  'ש': { name: 'Shin / Sin', sound: 'sh (dot right) / s (dot left)', gematria: 300 },
  'ת': { name: 'Tav',    sound: 't',                     gematria: 400 }
};

/* ---------------- Nikud-based transliteration ---------------- */
const HEB_CONS_TR = {
  'א': '', 'ב': 'v', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
  'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'kh', 'ך': 'kh', 'ל': 'l',
  'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': '', 'פ': 'f',
  'ף': 'f', 'צ': 'ts', 'ץ': 'ts', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't'
};
const HEB_VOWEL_TR = {
  'ְ': 'e',  // sheva
  'ֱ': 'e',  // hataf segol
  'ֲ': 'a',  // hataf patach
  'ֳ': 'o',  // hataf kamatz
  'ִ': 'i',  // chirik
  'ֵ': 'e',  // tzere
  'ֶ': 'e',  // segol
  'ַ': 'a',  // patach
  'ָ': 'a',  // kamatz
  'ֹ': 'o',  // cholam
  'ֺ': 'o',  // cholam haser for vav
  'ֻ': 'u',  // kubutz
  'ׇ': 'o'   // kamatz katan
};

function hasNikud(s) { return /[ְ-ׇֻ]/.test(s); }

function hebTranslit(word) {
  const s = String(word).normalize('NFC');
  const letters = [];
  for (const ch of s) {
    if (HEB_CONS_TR.hasOwnProperty(ch)) letters.push({ c: ch, marks: [] });
    else if (letters.length && /[֑-ׇ]/.test(ch)) letters[letters.length - 1].marks.push(ch);
  }
  let out = '';
  for (let i = 0; i < letters.length; i++) {
    const L = letters[i];
    if (L.skip) continue;
    const { c, marks } = L;
    const dagesh = marks.includes('ּ');
    let cons = HEB_CONS_TR[c];
    if (c === 'ב') cons = dagesh ? 'b' : 'v';
    else if (c === 'כ' || c === 'ך') cons = dagesh ? 'k' : 'kh';
    else if (c === 'פ' || c === 'ף') cons = dagesh ? 'p' : 'f';
    else if (c === 'ש') cons = marks.includes('ׂ') ? 's' : 'sh';
    else if (c === 'ו') {
      if (marks.includes('ֹ') || marks.includes('ֺ')) { out += 'o'; continue; } // cholam vav
      if (dagesh && !marks.some(m => HEB_VOWEL_TR[m])) { out += 'u'; continue; }          // shuruk
    }
    let vowel = '';
    for (const m of marks) if (HEB_VOWEL_TR[m]) { vowel = HEB_VOWEL_TR[m]; break; }
    // silent sheva at the end of a word
    if (vowel === 'e' && marks.includes('ְ') && i === letters.length - 1) vowel = '';
    // mater lectionis: chirik/tzere + final unpointed yod → long vowel, silent yod
    const next = letters[i + 1];
    if (vowel && next && next.c === 'י' && !next.marks.some(m => HEB_VOWEL_TR[m]) &&
        (vowel === 'i' || vowel === 'e')) next.skip = true;
    // final unpointed he after a vowel is silent
    if (next && next.c === 'ה' && !next.marks.length && i + 1 === letters.length - 1 && vowel) next.skip = true;
    // glottal letters between vowels keep a light separator
    if ((c === 'א' || c === 'ע') && out && vowel) cons = "'";
    out += cons + vowel;
  }
  return out;
}
