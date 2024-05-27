import i18next from "i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import * as resources from '../locales';
i18next.use(LanguageDetector).init({
    debug: false,
    ns: ["defaultNS"],
    defaultNS: "defaultNS",
    fallbackLng: ['en', 'de'],
    resources: resources //TODO maybe need to configure the language detector, see https://github.com/i18next/i18next-browser-languageDetector
}, (err, t) => {
    if (err) {
        console.log("An error occurred while loading translations: ", err);
    }
}).then();
export default i18next;
//# sourceMappingURL=translator.js.map