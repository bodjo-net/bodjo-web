import React from 'react';
import Link from './../../Components/Link/Link';
import Auth from './Auth';
import './Header.css';

export default function Header() {
	return (
		<div id="header">
			<div id="title">bodjo<Link className='version' to={'https://pages.bodjo.net/main.devstatus.' + window.T.lang}>v2.0</Link></div>
			<div id="auth">
				<Auth></Auth>
			</div>
			<div id="menu">
				<Link to="/">{ window.T('menu_main') }</Link>
				{/*<Link to="/about/">про bodjo</Link>*/}
				<Link to="/news/">{ window.T('menu_news') }</Link>
				<Link to="/scoreboard/">{ window.T('menu_scoreboard') }</Link>
			</div>
		</div>
	);
};