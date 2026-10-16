export const translations = {
  en: {
    // Header & Global
    appName: 'NFSU Library — Self Check',
    subTitle: 'National Forensic Sciences University',
    kohaConnected: 'Koha Connected',
    kohaOffline: 'Koha Offline',
    highContrast: 'High Contrast',
    textSize: 'Text Size',
    voiceAssist: 'Voice Guidance',
    
    // Attract / Idle
    tapCardTitle: 'Tap your MIFARE ID card or scan your card barcode to begin',
    tapCardSub: 'Place your student / faculty smart card against the reader below',
    returnBooksNoLogin: 'Return Books (No card needed)',
    enterCardNumber: 'Enter Card Number',
    useFaceLogin: 'Use Face Login (AI)',
    touchToStart: 'Touch anywhere to interact',
    kohaOfflineNotice: 'Koha circulation system is offline. Please approach the library helpdesk.',

    // Keypad Modal
    keypadTitle: 'Enter Patron ID / Library Card Number',
    keypadPlaceholder: 'e.g. NFSU1001 or 1001',
    clear: 'Clear',
    backspace: '⌫',
    cancel: 'Cancel',
    proceed: 'Confirm & Login',

    // Patron Home
    welcome: 'Welcome,',
    borrowedCount: 'Borrowed',
    overdueCount: 'Overdue',
    holdsCount: 'Holds',
    finesDue: 'Fines Due',
    currentLoansTitle: 'Currently Issued Materials',
    noLoans: 'No books currently issued to your account.',
    dueDate: 'Due Date',
    renew: 'Renew',
    renewAll: 'Renew All Books',
    renewing: 'Renewing…',
    renewed: 'Renewed',
    borrowBooksBtn: 'Borrow Books',
    returnBooksBtn: 'Return Books',
    finishBtn: 'Finish Session',
    kohaNotice: 'Library Notice',

    // Borrow Screen
    borrowTitle: 'Borrow Materials',
    borrowInstruction: 'Scan the barcode inside the book or place it on the RFID pad',
    confirmingKoha: 'Confirming with Koha…',
    borrowSuccess: 'Issued successfully',
    borrowFailed: 'Issue rejected',
    unconfirmedNotice: 'Not confirmed — please see library staff',
    manualBarcodeBtn: 'Type Barcode Manually',
    doneBorrowing: 'Finish & View Receipt',
    emptyBorrowList: 'No items scanned yet. Scan a book barcode to begin.',

    // Return Screen
    returnTitle: 'Return Materials',
    returnInstruction: 'Scan the barcode on the back of the book or place on the return plate',
    returnSuccess: 'Returned successfully',
    returnFailed: 'Return failed',
    sortBinLabel: 'Sort Bin',
    holdShelfAlert: 'Place this book on the RESERVED / HOLD shelf',
    standardShelving: 'Return to standard circulation sorting cart',
    doneReturning: 'Finish Returns',
    emptyReturnList: 'Ready to receive books. Scan barcode to return.',

    // Summary / Receipt
    summaryTitle: 'Session Summary & Receipt',
    summarySubtitle: 'Thank you for using the NFSU Self-Check Kiosk',
    printReceiptBtn: 'Print Receipt (80mm)',
    qrCodeTitle: 'Digital Slip (Scan QR)',
    autoReturnMessage: 'Returning to home screen in {seconds} seconds…',
    doneBtn: 'Done / Logout Now',
    itemsProcessed: 'Items Processed',

    // Session Modal
    sessionModalTitle: 'Are you still there?',
    sessionModalDesc: 'Your session will expire automatically to protect your privacy.',
    secondsRemaining: 'seconds remaining',
    continueSessionBtn: 'I am still here',
    logoutNowBtn: 'End Session Now',

    // Errors
    invalidPatron: 'Invalid patron card. Card not found in Koha records.',
    patronBlocked: 'Account restricted in Koha. Please contact the librarian.',
    networkError: 'Unable to reach Koha server. Please check with staff.',
    genericError: 'An unexpected circulation error occurred.',

    // Staff & Gate routes
    staffPortal: 'Staff Circulation Console',
    gateSimulator: 'RFID Security Gate Simulator',
  },

  hi: {
    // Header & Global
    appName: 'एनएफएसयू पुस्तकालय — स्व-सेवा कियोस्क',
    subTitle: 'राष्ट्रीय फॉरेंसिक विज्ञान विश्वविद्यालय',
    kohaConnected: 'कोहा से जुड़ा हुआ',
    kohaOffline: 'कोहा ऑफ़लाइन',
    highContrast: 'उच्च कंट्रास्ट',
    textSize: 'अक्षर आकार',
    voiceAssist: 'ध्वनि सहायता',

    // Attract / Idle
    tapCardTitle: 'आरंभ करने के लिए अपना कार्ड टैप करें या बारकोड स्कैन करें',
    tapCardSub: 'अपना स्मार्ट कार्ड नीचे दिए गए रीडर पर स्पर्श करें',
    returnBooksNoLogin: 'पुस्तकें लौटाएं (लॉगिन आवश्यक नहीं)',
    enterCardNumber: 'कार्ड संख्या दर्ज करें',
    useFaceLogin: 'चेहरा पहचान लॉगिन (AI)',
    touchToStart: 'प्रारंभ करने के लिए स्पर्श करें',
    kohaOfflineNotice: 'कोहा प्रणाली ऑफ़लाइन है। कृपया पुस्तकालय हेल्पडेस्क से संपर्क करें।',

    // Keypad Modal
    keypadTitle: 'सदस्यता पहचान संख्या दर्ज करें',
    keypadPlaceholder: 'उदा. NFSU1001 या 1001',
    clear: 'साफ़ करें',
    backspace: '⌫',
    cancel: 'रद्द करें',
    proceed: 'पुष्टि करें व आगे बढ़ें',

    // Patron Home
    welcome: 'स्वागत है,',
    borrowedCount: 'जारी पुस्तकें',
    overdueCount: 'अतिदेय (Overdue)',
    holdsCount: 'आरक्षित',
    finesDue: 'बकाया शुल्क',
    currentLoansTitle: 'वर्तमान में जारी सामग्री',
    noLoans: 'वर्तमान में आपके खाते में कोई पुस्तक जारी नहीं है।',
    dueDate: 'अंतिम तिथि',
    renew: 'नवीनीकरण',
    renewAll: 'सभी का नवीनीकरण करें',
    renewing: 'नवीनीकरण हो रहा है…',
    renewed: 'नवीनीकृत',
    borrowBooksBtn: 'पुस्तकें उधार लें',
    returnBooksBtn: 'पुस्तकें लौटाएं',
    finishBtn: 'सत्र समाप्त करें',
    kohaNotice: 'पुस्तकालय सूचना',

    // Borrow Screen
    borrowTitle: 'पुस्तकें जारी करें (उधार लें)',
    borrowInstruction: 'पुस्तक का बारकोड स्कैन करें या आरएफआईडी पैड पर रखें',
    confirmingKoha: 'कोहा से पुष्टि हो रही है…',
    borrowSuccess: 'सफलतापूर्वक जारी',
    borrowFailed: 'अस्वीकृत',
    unconfirmedNotice: 'पुष्टि नहीं हुई — कृपया स्टाफ से संपर्क करें',
    manualBarcodeBtn: 'मैन्युअल बारकोड दर्ज करें',
    doneBorrowing: 'समाप्त करें व रसीद देखें',
    emptyBorrowList: 'कोई पुस्तक स्कैन नहीं की गई। बारकोड स्कैन करें।',

    // Return Screen
    returnTitle: 'पुस्तकें वापस जमा करें',
    returnInstruction: 'पुस्तक का बारकोड स्कैन करें अथवा स्लॉट में रखें',
    returnSuccess: 'सफलतापूर्वक जमा',
    returnFailed: 'जमा विफल',
    sortBinLabel: 'सॉर्टिंग बिन',
    holdShelfAlert: 'कृपया इसे आरक्षित/होल्ड शेल्फ पर रखें',
    standardShelving: 'सामान्य रैक छँटाई में रखें',
    doneReturning: 'वापसी पूर्ण करें',
    emptyReturnList: 'पुस्तकें स्कैन करने हेतु तैयार।',

    // Summary / Receipt
    summaryTitle: 'लेनदेन सारांश एवं रसीद',
    summarySubtitle: 'एनएफएसयू स्व-सेवा कियोस्क उपयोग करने हेतु धन्यवाद',
    printReceiptBtn: 'रसीद प्रिंट करें',
    qrCodeTitle: 'डिजिटल रसीद (क्यूआर स्कैन)',
    autoReturnMessage: '{seconds} सेकंड में होम स्क्रीन पर वापस…',
    doneBtn: 'पूर्ण / अभी लॉगआउट करें',
    itemsProcessed: 'कुल प्रसंस्कृत सामग्री',

    // Session Modal
    sessionModalTitle: 'क्या आप अभी भी उपस्थित हैं?',
    sessionModalDesc: 'आपकी सुरक्षा व गोपनीयता हेतु सत्र जल्द समाप्त होगा।',
    secondsRemaining: 'सेकंड शेष',
    continueSessionBtn: 'मैं यहीं हूँ (जारी रखें)',
    logoutNowBtn: 'अभी समाप्त करें',

    // Errors
    invalidPatron: 'अमान्य कार्ड। कोहा में रिकॉर्ड नहीं मिला।',
    patronBlocked: 'कोहा में खाता अवरुद्ध है। कृपया पुस्तकालयाध्यक्ष से संपर्क करें।',
    networkError: 'कोहा सर्वर से संपर्क संभव नहीं।',
    genericError: 'एक अप्रत्याशित त्रुटि उत्पन्न हुई।',

    staffPortal: 'स्टाफ कंसोल',
    gateSimulator: 'सुरक्षा गेट सिम्युलेटर',
  },

  gu: {
    // Header & Global
    appName: 'NFSU લાયબ્રેરી — સેલ્ફ ચેક કિયોસ્ક',
    subTitle: 'નેશનલ ફોરેન્સિક સાયન્સિસ યુનિવર્સિટી',
    kohaConnected: 'કોહા કનેક્ટેડ',
    kohaOffline: 'કોહા ઑફલાઇન',
    highContrast: 'હાઇ કોન્ટ્રાસ્ટ',
    textSize: 'અક્ષર માપ',
    voiceAssist: 'અવાજ માર્ગદર્શન',

    // Attract / Idle
    tapCardTitle: 'શરૂ કરવા માટે તમારું સ્માર્ટ કાર્ડ ટેપ કરો અથવા બારકોડ સ્કેન કરો',
    tapCardSub: 'તમારું MIFARE ઓળખપત્ર નીચેના રીડર પર મૂકો',
    returnBooksNoLogin: 'પુસ્તકો પરત કરો (કાર્ડ વગર)',
    enterCardNumber: 'કાર્ડ નંબર દાખલ કરો',
    useFaceLogin: 'ફેસ લોગિન (AI)',
    touchToStart: 'શરૂ કરવા માટે ટચ કરો',
    kohaOfflineNotice: 'કોહા સિસ્ટમ ઑફલાઇન છે. કૃપા કરીને લાયબ્રેરી હેલ્પડેસ્કનો સંપર્ક કરો.',

    // Keypad Modal
    keypadTitle: 'સભ્યપદ ઓળખ નંબર દાખલ કરો',
    keypadPlaceholder: 'દા.ત. NFSU1001 અથવા 1001',
    clear: 'સાફ કરો',
    backspace: '⌫',
    cancel: 'રદ કરો',
    proceed: 'પુષ્ટિ કરો અને આગળ વધો',

    // Patron Home
    welcome: 'સ્વાગત છે,',
    borrowedCount: 'ઇશ્યૂ કરેલા',
    overdueCount: 'મુદત વીતી ગયેલ',
    holdsCount: 'અનામત (Holds)',
    finesDue: 'બાકી ફી',
    currentLoansTitle: 'હાલમાં ઇશ્યૂ કરેલ પુસ્તકો',
    noLoans: 'હાલમાં કોઈ પુસ્તક ઇશ્યૂ કરેલ નથી.',
    dueDate: 'પરત કરવાની તારીખ',
    renew: 'રીન્યુ કરો',
    renewAll: 'બધા પુસ્તકો રીન્યુ કરો',
    renewing: 'રીન્યુ થઈ રહ્યું છે…',
    renewed: 'રીન્યુ થયેલ',
    borrowBooksBtn: 'પુસ્તકો મેળવો (ઉધાર)',
    returnBooksBtn: 'પુસ્તકો પરત કરો',
    finishBtn: 'સત્ર પૂર્ણ કરો',
    kohaNotice: 'લાયબ્રેરી નોટિસ',

    // Borrow Screen
    borrowTitle: 'પુસ્તકો ઇશ્યૂ કરો',
    borrowInstruction: 'પુસ્તકનો બારકોડ સ્કેન કરો અથવા RFID પેડ પર મૂકો',
    confirmingKoha: 'કોહા દ્વારા પુષ્ટિ થઈ રહી છે…',
    borrowSuccess: 'સફળતાપૂર્વક ઇશ્યૂ થયેલ',
    borrowFailed: 'અસ્વીકાર્ય',
    unconfirmedNotice: 'પુષ્ટિ થયેલ નથી — સ્ટાફનો સંપર્ક કરો',
    manualBarcodeBtn: 'હાથેથી બારકોડ લખો',
    doneBorrowing: 'પૂર્ણ કરો અને રસીદ જુઓ',
    emptyBorrowList: 'હજી સુધી કોઈ પુસ્તક સ્કેન નથી થયું.',

    // Return Screen
    returnTitle: 'પુસ્તકો પરત જમા કરો',
    returnInstruction: 'પુસ્તકનો બારકોડ સ્કેન કરો અથવા સ્લોટમાં મૂકો',
    returnSuccess: 'સફળતાપૂર્વક પરત જમા',
    returnFailed: 'પરત જમા નિષ્ફળ',
    sortBinLabel: 'સોર્ટિંગ બિન',
    holdShelfAlert: 'આ પુસ્તક રિઝર્વ્ડ/હોલ્ડ શેલ્ફ પર મૂકો',
    standardShelving: 'સામાન્ય સ્ટેક્સમાં ગોઠવો',
    doneReturning: 'પરત પૂર્ણ કરો',
    emptyReturnList: 'પુસ્તકો સ્વીકારવા તૈયાર.',

    // Summary / Receipt
    summaryTitle: 'વ્યવહાર સારાંશ અને રસીદ',
    summarySubtitle: 'NFSU સેલ્ફ-ચેક કિયોસ્કનો ઉપયોગ કરવા બદલ આભાર',
    printReceiptBtn: 'રસીદ પ્રિન્ટ કરો',
    qrCodeTitle: 'ડિજિટલ સ્લિપ (QR સ્કેન)',
    autoReturnMessage: '{seconds} સેકન્ડમાં હોમ સ્ક્રીન પર…',
    doneBtn: 'પૂર્ણ / લૉગઆઉટ કરો',
    itemsProcessed: 'પ્રક્રિયા કરેલ વસ્તુઓ',

    // Session Modal
    sessionModalTitle: 'શું તમે અહીં હાજર છો?',
    sessionModalDesc: 'તમારી સુરક્ષા માટે સત્ર ટૂંક સમયમાં આપમેળે સમાપ્ત થશે.',
    secondsRemaining: 'સેકન્ડ બાકી',
    continueSessionBtn: 'હું અહીં છું (ચાલુ રાખો)',
    logoutNowBtn: 'હમણાં જ સમાપ્ત કરો',

    // Errors
    invalidPatron: 'અમાન્ય કાર્ડ. કોહામાં રેકોર્ડ મળ્યો નથી.',
    patronBlocked: 'કોહામાં એકાઉન્ટ બ્લોક છે. કૃપા કરીને સંપર્ક કરો.',
    networkError: 'કોહા સર્વર સાથે સંપર્ક શક્ય નથી.',
    genericError: 'અણધારી ખામી સર્જાઈ છે.',

    staffPortal: 'સ્ટાફ પોર્ટલ',
    gateSimulator: 'સિક્યોરિટી ગેટ સિમ્યુલેટર',
  }
};
