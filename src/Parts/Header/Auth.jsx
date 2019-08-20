import React from 'react';
import Loading from './../../Components/Loading/Loading';
import User from './../../Components/User/User';
import Link from './../../Components/Link/Link';
import account from './../../Controllers/AccountController';

class Auth extends React.Component {
	constructor(props) {
		super(props);

		let update = () => this.forceUpdate();
		account.on('checking', update);
		account.on('checked', update);
	}

	render() {
		if (account.loading)
			return <Loading />

		if (account.token && account.username && account.verified) {
			return <User me username={account.username} />
		}

		return (
			<div>
				<Link to="/login/">войти</Link> <span>/</span> <Link to="/register/">регистрация</Link>
			</div>
		);
	}
}

export default Auth;