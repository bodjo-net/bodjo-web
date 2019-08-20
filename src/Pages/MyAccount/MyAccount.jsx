import React from 'react';
import account from './../../Controllers/AccountController';
import UserInfo from './../../Controllers/UserInfoController';
import Textarea from './../../Components/Textarea/Textarea';
import Input from './../../Components/Input/Input';
import Button from './../../Components/Button/Button';
import Loading from './../../Components/Loading/Loading';
import {Redirect} from "react-router-dom";

import './MyAccount.css';

const TIME_RANGES = [
	{string: ['год', 'года', 'года', 'года', 'лет'], value: 1000 * 60 * 60 * 24 * 365},
	{string: ['месяц', 'месяца', 'месяца', "месяца", "месяцев"], value: 1000 * 60 * 60 * 24 * 30},
	{string: ['день', 'дня', "дня", "дня", "дней"], value: 1000 * 60 * 60 * 24},
	{string: ['час', 'часа', "часа", "часа", "часов"], value: 1000 * 60 * 60},
	{string: ['минуту', 'минуты', "минуты", "минуты", "минут"], value: 1000 * 60},
	{string: ['секунду', 'секунды', "секунды", "секунды", "секунд"], value: 1000}
];

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
		this.submitButton.current.setDisabled(
			this.aboutInput.current.value() == this.state.info.about &&
			this.emailInput.current.value() == this.state.info.email
		);
	}
	getTimeString() {
		let timeSpent = Date.now() - this.state.info['registration-time'];
		let timeString = '';
		for (let d = timeSpent, i = 0; i < TIME_RANGES.length; ++i) {
			let v = Math.floor(d / TIME_RANGES[i].value);
			if (v < 1) continue;
			timeString += v + ' ' + TIME_RANGES[i].string[range(digit(v), 1, TIME_RANGES[i].string.length)-1] + ' ';
			d -= v * TIME_RANGES[i].value;
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
						<p id="user-time">в bodjo уже {timeString}</p>
						<br />
						<Input ref={this.emailInput} onKeyUp={this.update.bind(this)} onChange={this.update.bind(this)} type='text' placeholder='Эл. адрес' value={this.state.info.email} />
						<Textarea ref={this.aboutInput} onKeyUp={this.update.bind(this)} onChange={this.update.bind(this)} type='text' placeholder='О себе' value={this.state.info.about} max={250} />
						<br />
						<Button disabled ref={this.submitButton} enter onClick={this.handleEdit.bind(this)}>Изменить</Button>
						<span className='space' />
						<Button invert onClick={this.handleLogout}>Выйти</Button>
					</div>
				</div>
			</div>
		);
	}
}


export default MyAccountPage;