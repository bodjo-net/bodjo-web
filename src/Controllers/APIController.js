import './DialogController.js';

let SERVER_HOST = null;

let API = {
	SERVER_HOST: null,
	__query: [],
	__init: function () {
		API.GET('https://bodjo.net/SERVER_HOST', (status, hostname) => {
			if (status) {
				API.SERVER_HOST = hostname;
				if (API.__query.length > 0) {
					API.__query.forEach(args => API[args[0]].apply(API, args.slice(1)));
				}
			} else {
				window.showDialog('Tried to obtain server\'s hostname.', 'https://bodjo.net\nGET /SERVER_HOST/')
			}
		});
	},
	GET: function (url, data, cb, tryToParse) {
		if (typeof data !== 'object') {
			tryToParse = cb || true;
			cb = data;
		}
		if (typeof tryToParse === 'undefined')
			tryToParse = true;
		let xhr = new XMLHttpRequest();
		let isAPIRequest = false;
		let censoredURL = url;
		if (typeof data === 'object') {
			if (API.SERVER_HOST == null) {
				API.__query.push(['GET'].concat(Array.prototype.slice.apply(arguments)));
				return;
			}
			isAPIRequest = true;
			censoredURL = API.SERVER_HOST + url + '?' + Object.keys(data).map(key => key + '=' + (key=='token'||key=='password'?'<'+key+'>':encodeURIComponent(data[key]))).join('&');
			url = API.SERVER_HOST + url + '?' + Object.keys(data).map(key => key + '=' + encodeURIComponent(data[key])).join('&');
		}
		console.log('[API] GET ' + url);
		xhr.open('GET', url, true);
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;

			if (xhr.status == 200) {
				let data = xhr.responseText;
				if (tryToParse) {
					try {
						data = JSON.parse(data);
					} catch (e) {}
				}
				cb(true, data);
			} else {
				if (isAPIRequest) {
					window.showDialog('Server, where are you?', 'Tried to make request:\n\nGET ' + censoredURL + '\n'+xhr.getAllResponseHeaders()+'\n\n'+xhr.statusText)
				}

				console.error('Bad HTTP Response: ' + xhr.statusCode + " - " + xhr.statusText);
				cb(false, xhr);
			}

		}
	},
	POST: function (url, data, before, cb, tryToParse) {
		if (typeof data !== 'object') {
			tryToParse = cb || true;
			cb = before;
			before = data;
		}
		if (typeof tryToParse === 'undefined')
			tryToParse = true;
		let xhr = new XMLHttpRequest();
		let isAPIRequest = false;
		let censoredURL = url;
		if (typeof data === 'object') {
			if (API.SERVER_HOST == null) {
				API.__query.push(['POST'].concat(Array.prototype.slice.apply(arguments)));
				return;
			}
			isAPIRequest = true;

			censoredURL = API.SERVER_HOST + url + '?' + Object.keys(data).map(key => key + '=' + (key=='token'||key=='password'?'<'+key+'>':encodeURIComponent(data[key]))).join('&');
			url = API.SERVER_HOST + url + '?' + Object.keys(data).map(key => key + '=' + encodeURIComponent(data[key])).join('&');
		}
		console.log('[API] POST ' + url);
		xhr.open('POST', url, true);
		before(xhr);
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;

			if (xhr.status == 200) {
				let data = xhr.responseText;
				if (tryToParse) {
					try {
						data = JSON.parse(data);
					} catch (e) {}
				}
				cb(true, data);
			} else {
				if (isAPIRequest) {
					window.showDialog('Server, where are you?', 'Tried to make request:\n\nGET ' + censoredURL + '\n'+xhr.getAllResponseHeaders()+'\n\n'+xhr.statusText)
				}

				console.error('Bad HTTP Response: ' + xhr.statusCode + " - " + xhr.statusText);
				cb(false, xhr);
			}
		}
	}
};
API.__init();
window.API = API;

export default API;