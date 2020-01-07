import React from 'react';
import Link from '../../Components/Link/Link';
import './Footer.css';

export default function Footer() {
	let langs = [];
	for (let i = 0; i < window.T.langs.length; ++i) {
		let lang = window.T.langs[i];
		langs.push(<a className={"link " + (window.T.lang == lang ? "active" : "")}
					  onClick={window.T.updateLang.bind(null, lang)}
					  key={lang}>
						{ lang.toUpperCase() }
					</a>);
		if (i < window.T.langs.length - 1)
			langs.push(" / ");
	}

	return (
		<div id="footer">
			<div className="contacts">
				Telegram: <a href="https://t.me/dkaraush">@dkaraush</a><br />
				E-mail: <a href="mailto://dkaraush@gmail.com">dkaraush@gmail.com</a>
			</div>
			<div className="lang">
				{langs}
			</div>
		</div>
	);
}