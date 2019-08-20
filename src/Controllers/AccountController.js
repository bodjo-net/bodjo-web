import API from './APIController';
import storage from './StorageController';

const strictSymbols = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM_-";

class AccountController {
	constructor() {
		this.EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		this.__listeners = {};

		this.token = storage.get('bodjo-token');
		this.username = storage.get('bodjo-username');
		this.loading = false;
		this.verified = false;
		if (this.token != null &&
			typeof this.token === 'string') {
			this.check();
		}
	}
	on(name, callback) {
		if (typeof this.__listeners[name] === 'undefined')
			this.__listeners[name] = [];
		this.__listeners[name].push(callback);
	}
	emit(name) {
		if (typeof this.__listeners[name] === 'undefined')
			return;
		let args = Array.prototype.slice.apply(arguments).slice(1);
		for (let listener of this.__listeners[name])
			listener.apply(listener, args);
	}

	login(username, password, callback) {
		this.loading = true;
		this.emit('checking');
		API.GET('/account/login', {username, password}, (status, data) => {
			this.loading = false;
			this.verified = (status && data.status === 'ok');
			if (this.verified) {
				this.token = data.token.value;
				this.username = username;
				storage.set('bodjo-token', this.token);
				storage.set('bodjo-username', this.username);
			}

			this.emit('checked', this.verified);
			callback(this.verified, data.errParameter, data);
		});
	}

	register(username, password, email, callback) {
		this.loading = true;
		this.emit('checking');
		let data = {username, password};
		if (typeof email !== 'undefined' &&
			email.length > 0)
			data.email = email;
		API.GET('/account/register', data, (status, data) => {
			this.loading = false;
			this.verified = (status && data.status === 'ok');
			if (this.verified) {
				this.token = data.token.value;
				this.username = data.token.username;
				storage.set('bodjo-token', this.token);
				storage.set('bodjo-username', this.username);
			}

			this.emit('checked', this.verified);
			callback(this.verified, data.errParameter, data);
		})
	}
	uploadImage(file, callback) {
		if (!this.verified)
			return;
		const exts = {
			'image/png': 'png',
			'image/jpeg': 'jpeg',
			'image/jpg': 'jpg',
			'image/gif': 'gif'
		};

		API.POST('/account/uploadImage', {
			token: this.token,
			ext: exts[file.type]
		}, (req) => {
			// req.setRequestHeader('Content-Type', 'multipart/form-data');
			let formData = new FormData();
			formData.append('image', file);
			req.send(formData)
		}, (status, data) => {
			callback(status && data.status == 'ok', data);
		})
	}

	logout() {
		if (this.token && this.verified) {
			this.loading = true;
			API.GET('/account/logout', {token: this.token}, (status, data) => {
				this.loading = false;
				this.token = null;
				this.verified = false;
				if (status && data.status == 'ok') {
					console.log('token removed successfully')
				}

				this.emit('checked', this.verified);
			})
		}

		storage.remove('bodjo-token');
		storage.remove('bodjo-username');
	}

	edit(email, about, callback) {
		let o = {token: this.token};
		if (email.length > 0) o.email = email;
		if (about.length > 0) o.about = about;
		API.GET('/account/edit', o, (status, data) => {
			callback(status && data.status === 'ok');
		});
	}

	check() {
		this.loading = true;
		this.emit('checking');
		API.GET('/account/check', {token: this.token}, (status, data) => {
			this.loading = false;
			this.verified = (status && data.status === 'ok');
			if (data.token && data.token.username)
				this.username = data.token.username;

			if (this.verified) {
				storage.set('bodjo-token', this.token);
				storage.set('bodjo-username', this.username);
			}

			this.emit('checked', this.verified);
		});
	}
}
export default (window.account = new AccountController());