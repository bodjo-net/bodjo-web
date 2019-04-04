const server_url = 'https://vkram.shpp.me:3518';
var token = getToken();
window.username = null;
var checkedToken = false;

if (token != null) {
	request('GET','/check_token', {token: token}, function (response) {
		if (response.status == 'ok') {
			username = response.username;
			checkedToken = true;
			updateAuthority(true);
		}
	});
}

var dontHaveAccount = document.querySelector('#dont-have-account');
var haveAccount = document.querySelector('#have-account');
var playButtons = document.querySelectorAll('.play');
function updateAuthority(first) {
	dontHaveAccount.style.opacity = checkedToken ? '0' : '1';
	haveAccount.style.opacity = checkedToken ? '1' : '0';
	dontHaveAccount.style.display = haveAccount.style.display = 'initial';
	if (playButtons != null) {
		for (var i = 0; i < playButtons.length; ++i) {
			playButtons[i].style.opacity = checkedToken ? '1' : '0';
			playButtons[i].style.maxWidth = checkedToken ? '500px' : '0px';
			playButtons[i].style.paddingLeft = 
				playButtons[i].style.paddingRight = checkedToken ? '1em' : '0';
		}
	}

	function finishAnimation() {
		dontHaveAccount.style.display = checkedToken ? 'none' : 'initial';
		haveAccount.style.display = checkedToken ? 'initial' : 'none';
	}

	if (first)
		finishAnimation();
	else
		setTimeout(finishAnimation, 250);
}
updateAuthority(true);

var signUpUsername = document.querySelector('#sign-up .username');
var signUpPassword = document.querySelector('#sign-up .password');
var signUpPasswordAgain = document.querySelector('#sign-up .password-again');
var signUpEmail = document.querySelector('#sign-up .email');
var signUpPlace = document.querySelector('#sign-up .place');
var signUpButton = document.querySelector('#sign-up .btn');

signUpButton.addEventListener('click', signUp);
function signUp() {
	var username = signUpUsername.value;
	if (username.length < 3 || username.length > 100) {
		errorInput(signUpUsername);
		return;
	}
	var password1 = signUpPassword.value;
	var password2 = signUpPasswordAgain.value;
	if (password1.length < 6 || password1.length > 100) {
		errorInput(signUpPassword);
		return;
	}
	if (password1 != password2) {
		errorInput(signUpPassword);
		errorInput(signUpPasswordAgain);
		return;
	}
	var email = signUpEmail.value;
	if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email))) {
		errorInput(signUpEmail);
		return;
	}
	var place = signUpPlace.selectedIndex;

	request('POST', '/register', {username: username, password: password,
								  email: email, place: place}, function (obj) {
		if (obj.status == 'ok') {
			token = obj.token;
			localStorage.token = token;
			setCookie("token", token);
			checkedToken = true;
			setActivePage('root')
			updateAuthority();
			window.username = username;

			signUpUsername.value = '';
			signUpPassword.value = '';
			signUpPasswordAgain.value = '';
			signUpEmail.value = '';
			signUpPlace.selectedIndex = 0;
		} else {
			if (obj.errorCode == 301) {
				errorInput(signUpUsername);
				return;
			}
		}
	});
}

var signInUsername = document.querySelector('#sign-in .username');
var signInPassword = document.querySelector('#sign-in .password');
var signInButton = document.querySelector('#sign-in .btn');
signInButton.addEventListener('click', signIn);
function signIn() {
	var username = signInUsername.value;
	var password = signInPassword.value;

	request('POST', '/login', {username: username, password: password}, function (obj) {
		if (obj.status == 'ok') {
			token = obj.token;
			localStorage.token = token;
			setCookie("token", token);
			checkedToken = true;
			setActivePage('root')
			updateAuthority();
			window.username = username;
			signInUsername.value = '';
			signInPassword.value = '';
		} else {
			if (obj.errorCode == 301) {
				errorInput(signUpUsername);
				errorInput(signUpPassword);
				return;
			}
		}
	});
}

window.addEventListener('keyup', function (e) {
	if (e.code == 'Enter') {
		if (activePage == 'sign-in')
			signIn();
		if (activePage == 'sign-up')
			signUp();
	}
})


function errorInput(input) {
	var start = Date.now();
	input.style.outline = '1px solid red';
	setTimeout(function () {
		input.style.outlineColor = 'transparent';
	}, 4000);

	function frame() {
		var t = (Date.now()-start)/500;
		if (t < 1)
			requestAnimationFrame(frame);
		else t = 1;
		var x = Math.sin((t+0.2)*Math.PI)*Math.sin((t+0.2)*Math.PI*5)*0.5;
		input.style.transform = 'translateX(' + x*10 + 'px)';
	}
	frame();
}

function getToken () {
	return localStorage.token || getCookie('token') || null;
}

request('GET', '/services', {}, function (obj) {
	var services = obj.services;
	services.forEach(function (service) {
		document.querySelector("#"+service).style.display = 'block';
		document.querySelector("#"+service+' .play').addEventListener('click', function () {
			request('GET', '/play', {gameName: service, token: token}, function (_obj) {
				if (_obj.status == 'ok') {
					window.location.href = window.location.protocol + '//' + window.location.hostname + '/' + service + '/?token=' + encodeURIComponent(_obj.gameSessionToken) + '&username=' + encodeURIComponent(username) + '&port=' + encodeURIComponent(_obj.port);
				} else {
					console.log(_obj);
				}
			});
		});
	});

	if (services.length == 0) {
		document.querySelector('#no-service').style.display = 'block';
	}

	if (Date.now() - startTime > 500)
		document.querySelector('#wrapper').style.opacity = '1';
	else
		setTimeout(function () {
			document.querySelector('#wrapper').style.opacity = '1';
		}, Date.now()-startTime)
});
var signOutButton = document.querySelector('#sign-out');
signOutButton.addEventListener('click', function () {
	if (checkedToken) {
		checkedToken = false;
		deleteCookie('token');
		localStorage.removeItem('token');
		updateAuthority();
	}
})


// ====
function request(method, url, parameters, callback) {
	var req = new XMLHttpRequest();
	var query = Array.from(Object.keys(parameters), function (p) {
		return p + '=' + encodeURIComponent(parameters[p]);
	}).join('&');
	req.open(method, server_url + url + '?' + query, true);
	req.setRequestHeader('Accept', 'application/json');
	req.onreadystatechange = function () {
		if (req.readyState != 4) return;
		//console.log(req.responseText);
		try {
			var obj = JSON.parse(req.responseText)
		} catch (e) {
			return;
		}

		callback(obj);
	}
	req.send();
}
function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie(name, value, options) {
  options = options || {};

  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  var updatedCookie = name + "=" + value;

  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}
function deleteCookie(name) {
  setCookie(name, "", {
    expires: -1
  });
}