import React from 'react';
import Loading from './../../Components/Loading/Loading';
import Input from './../../Components/Input/Input';
import Button from './../../Components/Button/Button';
import { Redirect } from "react-router-dom";

import account from './../../Controllers/AccountController';
import T from './../../Controllers/LanguageController';

import './RegisterPage.css';

class RegisterPage extends React.Component {
	constructor(props){ 
		super(props);

		this.usernameInput = React.createRef();
		this.passwordInput = React.createRef();
		this.repeatPasswordInput = React.createRef();
		this.emailInput = React.createRef();

		let update = () => this.forceUpdate();
		account.on('checking', update);
		account.on('checked', update);
	}

	onSubmit() {
		let username = this.usernameInput.current.value();
		let password = this.passwordInput.current.value();
		let passwordRepeat = this.repeatPasswordInput.current.value()
		let email = this.emailInput.current.value();

		if (username.length < 3 || username.length > 15 || /^bot.+$/g.test(username))
			this.usernameInput.current.error();
		else if (password.length < 6 || password.length > 100)
			this.passwordInput.current.error();
		else if (password !== passwordRepeat) {
			this.passwordInput.current.error();
			this.repeatPasswordInput.current.error();
		} else if (email.length > 0 && !account.EMAIL_REGEX.test(email))
			this.emailInput.current.error();
		else {
			account.register(username, password, email, (status, errParameter) => {
				if (errParameter === 'username')
					this.usernameInput.current.error();
				if (errParameter === 'password')
					this.passwordInput.current.error();
				if (errParameter === 'email')
					this.emailInput.current.error();
			});
		}
	}

	render () {
		if (account.verified) {
			return <Redirect to="/" />
		}

		return (
			<div id='register-page-wrapper'>
				<div id='register-page'> 
					<h3>{ T('register_header') }</h3>
					<div className='inputs'>
						<div>
							<Input ref={this.usernameInput} placeholder={ T('register_username_placeholder') } type="text" className='username' />
							<span dangerouslySetInnerHTML={ {__html: T('register_username_rules') } } ></span>
						</div>
						<div>
							<div>
								<Input ref={this.passwordInput} placeholder={ T('register_password_placeholder') } type="password" className='password' />
								<Input ref={this.repeatPasswordInput} placeholder={ T('register_password_repeat_placeholder') } type="password" className='password-repeat' />
							</div>
							<span dangerouslySetInnerHTML={ {__html: T('register_password_rules') } } ></span>
						</div>
						<div>
							<Input ref={this.emailInput} placeholder={ T('register_email_placeholder') } type="text" className='email' />
							<span dangerouslySetInnerHTML={ {__html: T('register_email_rules') } } ></span>
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