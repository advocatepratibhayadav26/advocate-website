// ============================================================
// IPC → BNS SECTION MAPPING DATA
// Cross-verified from multiple legal sources as of July 2026,
// including a BPRD (Ministry of Home Affairs) comparison document.
// This is NOT an exhaustive list of all 511 IPC sections —
// it covers the most commonly referenced sections only.
// IMPORTANT: Always verify against the official Bare Act before
// relying on this for any filing, notice, or court document.
// ============================================================
const IPC_BNS_DATA = [
  { ipc: "34", bns: "3(5)", offence: "Common Intention", hindi: "सामूहिक आशय से किया गया कार्य", desc: "जब कई व्यक्ति मिलकर एक जैसे इरादे से अपराध करते हैं, तो सभी उस अपराध के लिए उत्तरदायी होंगे।" },
  { ipc: "120B", bns: "61(2)", offence: "Criminal Conspiracy", hindi: "आपराधिक षड्यंत्र", desc: "जब दो या अधिक व्यक्ति कोई अवैध कार्य करने या वैध कार्य को अवैध तरीके से करने पर सहमत होते हैं।" },
  { ipc: "124A", bns: "152", offence: "Sedition (recast)", hindi: "राष्ट्र की सम्प्रभुता/अखंडता को खतरे में डालने वाले कार्य", desc: "'राजद्रोह' शब्द अब कानून में नहीं है; इसे राष्ट्र की एकता व अखंडता के विरुद्ध कार्यों के रूप में फिर से परिभाषित किया गया है।" },
  { ipc: "149", bns: "190", offence: "Unlawful Assembly — Common Object", hindi: "विधिविरुद्ध जमाव का हर सदस्य दोषी", desc: "गैरकानूनी जमाव के दौरान किए गए अपराध के लिए जमाव का हर सदस्य जिम्मेदार माना जाता है।" },
  { ipc: "302", bns: "103(1)", offence: "Murder", hindi: "हत्या का दंड", desc: "हत्या के अपराध में मृत्युदंड या आजीवन कारावास और जुर्माने का प्रावधान।" },
  { ipc: "304A", bns: "106(1)", offence: "Causing Death by Negligence", hindi: "लापरवाही से मृत्यु कारित करना", desc: "लापरवाही से किसी की मृत्यु होने पर (जैसे सड़क दुर्घटना) यह धारा लगती है।" },
  { ipc: "304B", bns: "80", offence: "Dowry Death", hindi: "दहेज हत्या", desc: "विवाह के 7 वर्षों के भीतर दहेज सम्बन्धी उत्पीड़न के बाद महिला की असामान्य मृत्यु होने पर।" },
  { ipc: "307", bns: "109", offence: "Attempt to Murder", hindi: "हत्या का प्रयास", desc: "हत्या करने के इरादे से किया गया कार्य, भले ही मृत्यु न हुई हो।" },
  { ipc: "375", bns: "63", offence: "Rape (Definition)", hindi: "बलात्संग की परिभाषा", desc: "बलात्संग किन परिस्थितियों में माना जाएगा, इसकी परिभाषा।" },
  { ipc: "376", bns: "64", offence: "Punishment for Rape", hindi: "बलात्संग का दंड", desc: "न्यूनतम 10 वर्ष से आजीवन कारावास तक की सजा।" },
  { ipc: "376(3) / 376AB", bns: "65", offence: "Rape of Minor (under 16/12 yrs)", hindi: "नाबालिग से बलात्संग", desc: "16 या 12 वर्ष से कम उम्र की बालिका के साथ बलात्संग पर कड़ा दंड।" },
  { ipc: "376D", bns: "70(1)", offence: "Gang Rape", hindi: "सामूहिक बलात्संग", desc: "न्यूनतम 20 वर्ष से आजीवन कारावास तक, जुर्माना पीड़िता को दिया जाएगा।" },
  { ipc: "379", bns: "303(2)", offence: "Theft", hindi: "चोरी", desc: "किसी की सम्पत्ति बेईमानी से बिना अनुमति ले लेना।" },
  { ipc: "382", bns: "304", offence: "Theft after Preparation for Hurt", hindi: "हत्या/चोट पहुँचाने की तैयारी के साथ चोरी", desc: "चोरी करते समय जान से मारने/चोट पहुँचाने की तैयारी रखने पर अधिक गंभीर धारा।" },
  { ipc: "406", bns: "316", offence: "Criminal Breach of Trust", hindi: "आपराधिक विश्वासघात", desc: "सौंपी गई सम्पत्ति का दुरुपयोग या बेईमानी से हड़पना।" },
  { ipc: "420", bns: "318(4)", offence: "Cheating", hindi: "धोखाधड़ी", desc: "किसी को धोखे में रखकर सम्पत्ति/पैसा हासिल करना।" },
  { ipc: "442", bns: "330", offence: "House-Breaking", hindi: "गृहभेदन", desc: "किसी के घर में अवैध रूप से प्रवेश कर तोड़-फोड़ करना।" },
  { ipc: "494", bns: "82", offence: "Bigamy", hindi: "द्विविवाह", desc: "पहले जीवनसाथी के जीवित रहते दूसरा विवाह करना।" },
  { ipc: "498A", bns: "85", offence: "Cruelty by Husband/Relatives", hindi: "पति या ससुराल वालों द्वारा क्रूरता", desc: "पत्नी के साथ शारीरिक या मानसिक क्रूरता करना, विशेषकर दहेज सम्बन्धी।" },
  { ipc: "506", bns: "351", offence: "Criminal Intimidation", hindi: "आपराधिक धमकी", desc: "जान-माल को नुकसान पहुँचाने की धमकी देना।" },
  { ipc: "509", bns: "79", offence: "Insulting Modesty of a Woman", hindi: "महिला की गरिमा का अपमान", desc: "शब्द, इशारे या हरकत से किसी महिला की मर्यादा को ठेस पहुँचाना।" }
];

