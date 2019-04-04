Object.getOwnPropertyNames(Math).forEach(function(n){window[n]=Math[n]});

// editor
var editor = ace.edit('editor');
editor.setTheme("ace/theme/textmate");
editor.session.setMode("ace/mode/javascript");
editor.setValue((localStorage.TANKS_savedCode || 'function onTick(field) {\n\t// TODO\n\t\n}'), -1);
if (localStorage.TANKS_caretPos) {
	try {
		let pos = JSON.parse(localStorage.TANKS_caretPos);
		editor.moveCursorTo(pos.row, pos.column);
	} catch (e) {}
}
editor.getSession().on('change', function () {
	localStorage.TANKS_savedCode = editor.getValue();
	localStorage.TANKS_caretPos = JSON.stringify(editor.getCursorPosition());
});
if (localStorage.TANKS_codeSize)
	editor.setFontSize(parseInt(localStorage.TANKS_codeSize));
editor.container.addEventListener('keydown', function (e) {
	if ((e.key == "=" || e.key == "-") && e.altKey) {
		let fontSize = editor.getFontSize();
		let inc = 2 * (e.key == '=' ? 1 : -1)
		if ((fontSize < 4 && inc < 0) || 
			(fontSize > 100 && inc > 0))
			return;
		editor.setFontSize(fontSize + inc);
		localStorage.TANKS_codeSize = editor.getFontSize();
	}
});

// tabs
var tabs = document.querySelectorAll('.tab');
var sections = document.querySelectorAll('.section');

var sectionNames = Array.from(sections, function (section) {return section.id});
var activeSection = localStorage.TANKS_activeSection || "docs";
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
	localStorage.TANKS_activeSection = sectionName;
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
	errors.push({id: ID, div: newErrorDiv, removing: false});
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
		var I = errors.findIndex(function (e) {return e.id == ID});
		if (I < 0 || errors[I].removing) return;

		var B = bottom(errors[I].div);
		newErrorDiv.style.bottom = '0px';
		newErrorDiv.style.opacity = '0';
		setTimeout(newErrorDiv.remove.bind(newErrorDiv), 250);
			
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
	for (var i = 0; i < errors.length; ++i) {
		errors[i].div.style.bottom = '0px';
		errors[i].div.style.opacity = '0';
		errors[i].removing = true;
		setTimeout(errors[i].div.remove.bind(errors[i].div), 250);
	}
}

function range(x, _min, _max) {
	return min(max(x, _min), _max);
}