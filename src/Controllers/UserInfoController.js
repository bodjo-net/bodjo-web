import API from './APIController';

let UserInfo = window.UserInfo = {
	cache: {},
	__query: [],
	__callbacks: [],
	__lastQueryAppend: 0,
	load: function (username, callback) {
		if (UserInfo.cache[username]) {
			callback(UserInfo.cache[username]);
			return;
		}

		UserInfo.__query.push(username);
		UserInfo.__callbacks.push(callback);
		let lastQueryAppend = UserInfo.__lastQueryAppend = Date.now();
		setTimeout(function () {
			if (lastQueryAppend === UserInfo.__lastQueryAppend &&
				UserInfo.__query.length > 0) {

				API.GET('/account/info', {usernames: UserInfo.__query}, (status, data) => {
					for (let _username in data.result) {
						UserInfo.cache[_username] = data.result[_username];
						if (username === _username)
							callback(UserInfo.cache[_username]);
					}

					UserInfo.__query = [];
				});
			}
		}, 50);
	},
	my: function (token, callback) {
		API.GET('/account/info', {token}, (status, data) => {
			if (status && data.status === 'ok' && data.result.length > 0) {
				callback(data.result[0]);
			}
		});
	}
}

// if (localStorage.UserInfo) {
// 	UserInfo.cache = JSON.parse(localStorage.UserInfo);
// }

export default UserInfo;