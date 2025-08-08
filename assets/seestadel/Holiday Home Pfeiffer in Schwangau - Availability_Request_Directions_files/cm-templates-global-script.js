/* Global Script File */
document.addEventListener('DOMContentLoaded', function() {
	var scrollUpButton = document.querySelectorAll('div.scrollup > a, a.scrollup')[0];
	if (scrollUpButton) {
		var lang = window.beng.env.pageLanguage || window.beng.env.language || 'en';
		lang = lang.substring(0, 2);
		var translateLangMap = {
		    "en": "Scroll to top",
			"cs": "Přejděte na začátek",
			"da": "Rul til toppen",
			"de": "Nach oben scrollen",
			"es": "Desplazarse hacia arriba",
			"fi": "Siirry ylös",
			"fr": "Défiler vers le haut",
			"hr": "Pomakni se prema gore",
			"it": "Scorrere verso l'alto",
			"lt": "Slinkti į viršų",
			"nl": "Scroll naar boven",
			"no": "Rull til toppen",
			"pl": "Przewiń do góry",
			"pt": "Rolar para cima",
			"sv": "Rulla upp",
			"tr": "Yukarı kaydır"
		}
		scrollUpButton.setAttribute('role', 'button');
		scrollUpButton.setAttribute('aria-label', translateLangMap[lang]);
	}
});
