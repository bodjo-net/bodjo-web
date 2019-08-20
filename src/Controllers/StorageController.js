const domain = 'bodjo';
let Storage = {
	get: function (name) {
		let o = null;
		if (getCookie(name)) {
			o = getCookie(name);
			if (typeof localStorage.getItem(name) === 'undefined')
				localStorage.setItem(name, o);
		} else if (localStorage.getItem(name)) {
			o = localStorage.getItem(name);
			setCookie(name, o);
			setCookie(name, o, {domain});
		}
		if (o != null) {
			try {
				o = JSON.parse(o)
			} catch (e) {}
		}
		return o;
	},
	set: function (name, value) {
		let v = JSON.stringify(value);
		localStorage.setItem(name, v);
		setCookie(name, v);
		setCookie(name, v, {domain});
	},
	remove: function (name) {
		deleteCookie(name);
		localStorage.removeItem(name);
	}
};
window.Storage = Storage;

// cookies (thanks to https://learn.javascript.ru/cookie)
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie(name, value, options) {
  options = {
    path: '/',
    ...options
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true)
      updatedCookie += "=" + optionValue;
  }

  document.cookie = updatedCookie;
}
function deleteCookie(name) {
  setCookie(name, "", {
    'max-age': -1
  })
}


export default Storage;