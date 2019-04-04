var server_url = 'https://vkram.shpp.me:3518';
Object.getOwnPropertyNames(Math).forEach(function(n){window[n]=Math[n]});

// editor
var editor = ace.edit('editor');
editor.setTheme("ace/theme/textmate");
editor.session.setMode("ace/mode/javascript");
editor.setValue((localStorage[gameName.toUpperCase()+'_savedCode'] || 'function onTick(data) {\n\t// TODO\n\t\n}'), -1);
if (localStorage[gameName.toUpperCase()+'_caretPos']) {
	try {
		let pos = JSON.parse(localStorage[gameName.toUpperCase()+'_caretPos']);
		editor.moveCursorTo(pos.row, pos.column);
	} catch (e) {}
}
editor.getSession().on('change', function () {
	localStorage[gameName.toUpperCase()+'_savedCode'] = editor.getValue();
	localStorage[gameName.toUpperCase()+'_caretPos'] = JSON.stringify(editor.getCursorPosition());
});
if (localStorage[gameName.toUpperCase()+'_codeSize'])
	editor.setFontSize(parseInt(localStorage[gameName.toUpperCase()+'_codeSize']));
editor.container.addEventListener('keydown', function (e) {
	if ((e.key == "=" || e.key == "-") && e.altKey) {
		let fontSize = editor.getFontSize();
		let inc = 2 * (e.key == '=' ? 1 : -1)
		if ((fontSize < 4 && inc < 0) || 
			(fontSize > 100 && inc > 0))
			return;
		editor.setFontSize(fontSize + inc);
		localStorage[gameName.toUpperCase()+'_codeSize'] = editor.getFontSize();
	}
});

// tabs
var tabs = document.querySelectorAll('.tab');
var sections = document.querySelectorAll('.section');

var sectionNames = Array.from(sections, function (section) {return section.id});
var activeSection = localStorage[gameName.toUpperCase()+'_activeSection'] || "docs";
if (sectionNames.indexOf(activeSection) < 0)
	activeSection = 'docs';

setActiveSection(activeSection);

tabs.forEach(function (tab) {
	tab.addEventListener('click', function () {
		activeSection = tab.id.substring(4);
		setActiveSection(activeSection);
	});
});

function setActiveSection(sectionName) {
	localStorage[gameName.toUpperCase()+'_activeSection'] = sectionName;
	document.querySelector(".section.active").className = "section";
	document.querySelector(".tab.active").className = "tab";

	document.querySelector("#"+sectionName).className = "section active";
	document.querySelector("#tab-"+sectionName).className = "tab active";
}

var html = document.querySelector('html');
var game = document.querySelector('#game');
var workspace = document.querySelector('#workspace');
var resizer = document.querySelector('#resizer');
var isMouseDown = false;
resizer.addEventListener('mousedown', function () {
	isMouseDown = true;
	html.style.userSelect = 'none';
});
window.addEventListener('mouseup', function () {
	isMouseDown = false;
	html.style.userSelect = 'initial';
});

var tabs = document.querySelector("#tabs");
var controlPanel = document.querySelector('#control-panel');
var sections = document.querySelectorAll('.section');

var lastGameWidth = 550;
window.addEventListener('mousemove', _onResize);
window.addEventListener('resize', _onResize);
function _onResize(e) {
	var width = window.innerWidth, 
		x = e.clientX||(width-lastGameWidth);
	if (isMouseDown || e.type == 'resize') {
		workspace.style.left = x + 'px';
		workspace.style.width = (width - x) + 'px';
		game.style.right = (width - x) + 'px';
		lastGameWidth = width - x;
		if (e.type != 'resize')
			window.dispatchEvent(new Event('resize'));

		if (sections != null) {
			for (var i = 0; i < sections.length; ++i) {
				var section = sections[i];
				section.style.top = tabs.clientHeight + 'px';
				section.style.bottom = controlPanel.clientHeight + 'px';
			}
		}
	}
}
_onResize({type:'resize'});

var errors = [];
var codeContainer = document.querySelector('#code');
function showError(text) {
	var newErrorDiv = document.createElement('div');
	var ID = round(random()*1000000);
	errors.push({id: ID, div: newErrorDiv});
	newErrorDiv.className = 'error';
	newErrorDiv.style.opacity = '0';
	newErrorDiv.style.bottom = Array.from(errors, function (e) {return e.id==ID?0:e.div.clientHeight}).reduce(function (m, a) {return m+a;}) + 'px';


	var pre = document.createElement('pre');
	pre.innerHTML = text;
	newErrorDiv.append(pre);
	setTimeout(function () {
		newErrorDiv.style.opacity = '1';
		newErrorDiv.style.bottom = Array.from(errors, function (e,i) {return e.id==ID?0:e.div.clientHeight}).reduce(function (m, a) {return m+a;}) + 'px';
	}, 17);
	setTimeout(function () {
		if (!newErrorDiv) return;
		newErrorDiv.style.bottom = '0px';
		newErrorDiv.style.opacity = '0';
		setTimeout(newErrorDiv.remove.bind(newErrorDiv), 250);
			
		var I = errors.findIndex(function (e) {return e.id == ID});
		var B = bottom(errors[I].div);
		for (var i = 0; i < errors.length; ++i) {
			var b = bottom(errors[i].div);
			if (b > B)
				errors[i].div.style.bottom = (b - errors[I].div.clientHeight) + 'px';
		}
		errors.splice(I, 1);
	}, 5000);

	codeContainer.append(newErrorDiv);
}
function bottom(div) {
	return parseInt((B=div.style.bottom).substring(0, B.length-2));
}

function clearErrors() {

}
function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
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

var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function replaceTag(tag) {
    return tagsToReplace[tag] || tag;
}
function escape(str) {
	return (str+"").replace(/[&<>]/g, replaceTag);
}

var scoreboardData = document.querySelector('#scoreboard table tbody:nth-child(2)');
function updateScoreboard(array, f) {
	var newHTML = "";
	for (var i = 0; i < array.length; ++i)
		newHTML += '<tr><td>' + Array.from(f(array[i]), escape).join('</td><td>') + '<td>';
	scoreboardData.innerHTML = newHTML;
}
function range(x, _min, _max) {
	return min(max(x, _min), _max);
}