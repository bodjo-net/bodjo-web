import React from 'react';
import account from './../../Controllers/AccountController';
import T from './../../Controllers/LanguageController';
import UserInfo from './../../Controllers/UserInfoController';
import Textarea from './../../Components/Textarea/Textarea';
import Input from './../../Components/Input/Input';
import Button from './../../Components/Button/Button';
import Loading from './../../Components/Loading/Loading';
import SocialButton from './../../Components/SocialButton/SocialButton';
import {Redirect} from "react-router-dom";

import './MyAccount.css';

function range(x, min, max) {
	return Math.min(Math.max(x, min), max);
}
function digit(x) {
	if (x < 20)
		return x;
	let b = x % 10, a = (x-b)/10%10; // x = xxxxxab; (ex. 923912; b=2, a=1) 
	if (a >= 2 && b > 0)
		return b;
	return x;
}
function capitalize(string) {
	return string[0].toUpperCase() + string.substring(1);
}

function arrayPutBetween(arr, el) {
	for (let i = arr.length-1; i > 0; i -= 1)
		arr.splice(i, 0, el);
	return arr;
}



class MyAccountPage extends React.Component {
	constructor(props) {
		super(props);

		this.submitButton = React.createRef();
		this.aboutInput = React.createRef();
		this.emailInput = React.createRef();

		this.state = {loading: true, info: null};
		this._ismounted = false;

		let update = () => this.forceUpdate();
		account.on('checking', update);
		account.on('checked', update);
		UserInfo.my(account.token, (info) => {
			let newState = {loading: false, info};
			if (this._ismounted)
				this.setState(newState);
			else this.state = newState;
		});
	}

	componentDidMount() { 
		this._ismounted = true;
	}

	componentWillUnmount() {
		this._ismounted = false;
	}

	handleLogout() {
		account.logout();
	}
	handleEdit() {
		let email = this.emailInput.current.value();
		let about = this.aboutInput.current.value();

		if (email.length > 0 && !account.EMAIL_REGEX.test(email))
			this.emailInput.current.error();
		else if (about.length > 250)
			this.aboutInput.current.error();
		else {
			account.edit(email, about, () => {
				let info = this.state.info;
				info.email = email;
				info.about = about;
				this.setState({info});
				this.update();
			})
		}
	}
	handleImageUpload(e) {
		e.persist()
		let input = e.target;
		let file = input.files[0];
		if (typeof file !== 'object')
			return;

		account.uploadImage(file, (status, data) => {
			if (status && data.status == 'ok') {
				let info = this.state.info;
				info.image = data;
				this.setState({imaget: Date.now(), info});
			} else {
				alert(data.errText);
			}
		});
	}
	update() {
		this.submitButton.current.setState({disabled: (
			this.aboutInput.current.value() == this.state.info.about &&
			this.emailInput.current.value() == this.state.info.email
		)});
	}
	getTimeString() {
		let timeSpent = Date.now() - this.state.info['registration-time'];
		let timeString = '';
		let timeRanges = T('myaccount_usertime_ranges');
		let countLastNumber = T('myaccount_usertime_ranges_countlastnumber');
		for (let d = timeSpent, i = 0; i < timeRanges.length; ++i) {
			let v = Math.floor(d / timeRanges[i].value);
			if (v < 1) continue;
			timeString += v + ' ' + timeRanges[i].string[range(countLastNumber ? digit(v) : v, 1, timeRanges[i].string.length)-1] + ' ';
			d -= v * timeRanges[i].value;
		}
		return timeString;
	}
	render() {
		if (!account.loading && (!account.verified || !account.token))
			return <Redirect to="/login/" />;

		if (account.loading || this.state.loading)
			return <Loading />;

		let timeString = this.timeString || (this.timeString = this.getTimeString());

		return (
			<div id="my-account-wrapper">
				<div id="my-account">
					<span id="user-image" style={{backgroundImage:'url('+this.state.info.image[128]+(this.state.imaget?'?'+this.state.imaget:'')+')'}}>
						<span className="upload"></span>
						<input onChange={this.handleImageUpload.bind(this)} type='file' accept='.png,.jpg,.jpeg,.gif' />
					</span>
					<div id="user-info">
						<h1>{this.state.info.username}</h1>
						<p id="user-time">{T('myaccount_usertime')}{timeString}</p>
						<br />
						<Input ref={this.emailInput} onKeyUp={this.update.bind(this)} onChange={this.update.bind(this)} type='text' placeholder={T('myaccount_email_placeholder')} value={this.state.info.email} />
						<Textarea ref={this.aboutInput} onKeyUp={this.update.bind(this)} onChange={this.update.bind(this)} type='text' placeholder={T('myaccount_bio_placeholder')} value={this.state.info.about} max={250} />
						<br />
						<Button disabled ref={this.submitButton} enter onClick={this.handleEdit.bind(this)}>{T('myaccount_change')}</Button>
						<span className='space' />
						<Button invert onClick={this.handleLogout}>{T('myaccount_logout')}</Button>
						<br />
						<br />
						<h3>{T('myaccount_attach_header')}</h3>
						{
							account.socials.map(social => [
								//<h3 key={social+'-header'} style={{margin: '10px 0 5px 0'}}>{capitalize(social)}</h3>,
								<SocialButton key={social+'-button'} disabled={this.state.info[social]} purpose="attach" social={social} />
							])
						}
					</div>
				</div>
			</div>
		);
	}
}


export default MyAccountPage;