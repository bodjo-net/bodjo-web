import React from 'react';
import './Footer.css';

export default function Footer() {
	return (
		<div id="footer">
			<div className="contacts">
				Telegram: <a href="https://t.me/dkaraush">@dkaraush</a><br />
				E-mail: <a href="mailto://dkaraush@gmail.com">dkaraush@gmail.com</a>
			</div>
			<div className="love"><p>made with &lt;3</p></div>
		</div>
	);
}