import React from 'react';
import { Redirect } from 'react-router-dom';
import Loading from '../Components/Loading/Loading';
import API from './APIController';
import account from './../Controllers/AccountController';

const settings = {
	github: {
		url: 'https://github.com/login/oauth/authorize',
		client_id: 'd823a0caac275c91d9e2',
		scope: 'user'
	},
	discord: {
		url: 'https://discordapp.com/api/v6/oauth2/authorize',
		client_id: '652244984036327462',
		response_type: 'code',
		prompt: 'consent',
		scope: 'identify email guilds.join'
	},
	google: {
		url: 'https://accounts.google.com/o/oauth2/v2/auth',
		client_id: '208677133829-00m6sbstptmupskl5dnn0h9t3ujaurjn.apps.googleusercontent.com',
		scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
		response_type: 'code',
		access_type: 'offline',
		prompt: 'consent'
	}
};
account.socials = Object.keys(settings);

function queryString(obj) {
	return Object.keys(obj).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])).join('&');
}
function queryObject(str) {
	if (typeof str === 'undefined') {
		let href = window.location.href;
		str = (href.indexOf('?') >= 0 ? href.substring(href.indexOf('?')+1) : '');
	}

	let o = {};
	str.split('&').map(param => {
		if (param.indexOf('=') < 0)
			o[decodeURIComponent(param)] = true;
		else
			o[decodeURIComponent(param.substring(0, param.indexOf('=')))] = decodeURIComponent(param.substring(param.indexOf('=')+1));
	});
	return o;
}
function rmKey(obj, key) {
	obj = Object.assign({}, obj);
	delete obj[key];
	return obj;
}

class SocialController {
	constructor() {
		this.provider = SocialControllerProvider;
	}
	login(socialname) {
		this.redirect(socialname, 'login');
	}
	attach(socialname) {
		this.redirect(socialname, 'attach');
	}

	redirect(socialname, purpose) {
		let hostname = window.location.href.substring(0, window.location.href.length - window.location.pathname.length);
		let redirect_uri = hostname + '/social-provider/' + purpose + '/' + socialname + '/';

		window.location.href = settings[socialname].url + '?' + queryString(
			Object.assign({redirect_uri}, rmKey(settings[socialname], 'url'))
		);
	}
}

class SocialControllerProvider extends React.Component {
	constructor(props) {
		super(props);

		let query = queryObject();
		this._redirect = null;
		this._error = null;

		if (window.location.pathname.split('/').length < 3)
			this._error = 'wrong pathname';
		if (query.error) {
			this._error = query.error;
			return;
		}

		let purpose = window.location.pathname.split('/')[2];
		let social = window.location.pathname.split('/')[3];

		if (purpose === 'login') {
			API.GET('/account/login', Object.assign({social}, query), (status, data) => {
				if (status && data.status == 'ok') {
					if (data.token) {
						account.putVerifiedToken(data.token);
						this.redirect('/');
					} else {
						this.redirect('/register/?' + queryString(Object.assign(data.recommendedInfo, {hash: data.hash})));
					}
				} else {
					this.error(JSON.stringify(data));
				}
			});
		} else if (purpose === 'attach') {
			API.GET('/account/attach', 
					Object.assign({token: account.token, social}, query),
					(status, data) => {
						if (status && data.status == 'ok') {
							this.redirect('/my-account/');
						} else
							this.error(JSON.stringify(data));
					}
			);
		}
	}

	redirect(url) {
		this._redirect = url;
		this.forceUpdate();
	}

	error(msg) {
		this._error = msg;
		this.forceUpdate();
	}

	render() {
		if (this._redirect != null)
			return <Redirect to={this._redirect} />
		if (this._error != null)
			return <p>{this._error}</p>;
		return <Loading />;
	}
}

export default (window.SocialController = new SocialController());