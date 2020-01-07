import text from '../text.json';

let LanguageController = function (name) {
	return text[LanguageController.lang][name];
};
LanguageController.langs = Object.keys(text);

LanguageController.lang = 
	window.Storage.get('bodjo-lang') || 
	(window.navigator.language.match(/^\w+/)||['en'])[0].toLowerCase();
if (LanguageController.langs.indexOf(LanguageController.lang) === -1)
	LanguageController.lang = LanguageController.langs[0];
LanguageController.updateLang = function (newLang) {
	if (newLang === LanguageController.lang)
		return;
	if (LanguageController.langs.indexOf(newLang) === -1)
		return;
	window.Storage.set('bodjo-lang', newLang);
	LanguageController.lang = newLang;

	window.location.reload();
}

export default (window.T = LanguageController);