import React from 'react';
import Loading from './../../Components/Loading/Loading';
import Input from './../../Components/Input/Input';
import Textarea from './../../Components/Textarea/Textarea';
import Button from './../../Components/Button/Button';
import { Redirect } from "react-router-dom";

import account from './../../Controllers/AccountController';
import T from './../../Controllers/LanguageController';

import './RegisterPage.css';

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

class RegisterPage extends React.Component {
	constructor(props){ 
		super(props);

		this.inited = false;
		this.query = queryObject();
		this.hash = this.query.hash;

		this.usernameInput = React.createRef();
		this.aboutInput = React.createRef();
		this.emailInput = React.createRef();

		let update = () => this.forceUpdate();
		account.on('checking', update);
		account.on('checked', update);
	}

	onSubmit() {
		let username = this.usernameInput.current.value();
		let about = this.aboutInput.current.value();
		let email = this.emailInput.current.value();

		if (username.length < 3 || username.length > 15 || /^bot.+$/g.test(username))
			this.usernameInput.current.error();
		else if (email.length > 0 && !account.EMAIL_REGEX.test(email))
			this.emailInput.current.error();
		else {
			account.register(this.hash, username, email, about, (status, errParameter) => {
				if (errParameter === 'username')
					this.usernameInput.current.error();
				if (errParameter === 'email')
					this.emailInput.current.error();
				if (errParameter === 'hash') {
					this.hash = null;
					this.forceUpdate();
				}
			});
		}
	}

	render () {
		if (account.verified || typeof this.hash !== 'string') {
			return <Redirect to="/" />
		}

		return (
			<div id='register-page-wrapper'>
				<div id='register-page'> 
					<h3>{ T('register_header') }</h3>
					<div className='inputs'>
						<div>
							<Input 
								ref={this.usernameInput} 
								placeholder={ T('register_username_placeholder') } 
								type="text" 
								className='username'
								value={!this.inited ? this.query.username : ''}
							/>
							<span
								dangerouslySetInnerHTML={ {__html: T('register_username_rules') } } 
							></span>
						</div>
						<div>
							<Input
								ref={this.emailInput}
								placeholder={ T('register_email_placeholder') }
								type="text"
								className='email'
								value={!this.inited ? this.query.email : ''}
							/>
							<span
								dangerouslySetInnerHTML={ {__html: T('register_email_rules') } }
							></span>
						</div>
						<div>
							<Textarea
								style={{width: '100%'}}
								ref={this.aboutInput}
								placeholder={ T('register_about_placeholder') }
								className='about'
							/>
						</div>
					</div>
					{account.loading ? 
						<Loading inline /> :
						<Button enter invert onClick={this.onSubmit.bind(this)}>{ T('register_submit') }</Button>
					}
				</div>
			</div>
		);
	}
}

export default RegisterPage;