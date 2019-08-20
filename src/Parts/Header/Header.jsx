import React from 'react';
import Link from './../../Components/Link/Link';
import Auth from './Auth';
import './Header.css';

export default function Header() {
	return (
		<div id="header">
			<div id="title">bodjo<Link className='version' to='https://pages.bodjo.net/#main.devstatus.ru'>v2.0</Link></div>
			<div id="auth">
				<Auth></Auth>
			</div>
			<div id="menu">
				<Link to="/">главная</Link>
				{/*<Link to="/about/">про bodjo</Link>*/}
				<Link to="/news/">новости</Link>
				<Link to="/scoreboard/">таблица</Link>
			</div>
		</div>
	);
};