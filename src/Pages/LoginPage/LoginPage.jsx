import React from 'react';
import Loading from './../../Components/Loading/Loading';
import Input from './../../Components/Input/Input';
import Button from './../../Components/Button/Button';
import { Redirect } from "react-router-dom";

import account from './../../Controllers/AccountController';
import T from './../../Controllers/LanguageController';

import './LoginPage.css';

class LoginPage extends React.Component {
	constructor(props){ 
		super(props);

		this.usernameInput = React.createRef();
		this.passwordInput = React.createRef();

		let update = () => this.forceUpdate();
		account.on('checking', update);
		account.on('checked', update);
	}

	onSubmit() {
		let username = this.usernameInput.current.value();
		let password = this.passwordInput.current.value();

		if (username.length == 0)
			this.usernameInput.current.error();
		if (password.length == 0)
			this.passwordInput.current.error();

		if (username.length > 0 &&
			password.length > 0) {
			account.login(username, password, (status, errParameter, data) => {
				if (errParameter === 'username' || (data.status == 'fail' && data.errCode == 1))
					this.usernameInput.current.error();
				if (errParameter === 'password' || (data.status == 'fail' && data.errCode == 1))
					this.passwordInput.current.error();
			});
		}
	}

	render () {
		if (account.verified) {
			return <Redirect to="/" />
		}

		return (
			<div id='login-page-wrapper'>
				<div id='login-page'> 
					<h3>{ T('login_header') }</h3>
					<div className='inputs'>
						<Input ref={this.usernameInput} placeholder={ T('login_username_placeholder') } type="text" className='username' />
						<Input ref={this.passwordInput} placeholder={ T('login_password_placeholder') } type="password" className='password' />
					</div>
					{account.loading ? 
						<Loading inline /> :
						<Button enter invert onClick={this.onSubmit.bind(this)}>{ T('login_submit') }</Button>
					}
				</div>
			</div>
		);
	}
}

export default LoginPage;