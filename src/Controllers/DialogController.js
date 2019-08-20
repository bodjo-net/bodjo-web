import './Dialog.css';

window.faces = [
  "\\(o_o)/",
  "(ノಠ益ಠ)ノ彡┻━┻",
  "(╯°□°）╯︵ ┻━┻",
  "ヽ(`Д´)ﾉ",
  "ノ( º _ ºノ)",
  "¬_¬",
  "¯(°_o)/¯",
  "¯\\_(ツ)_/¯",
  "°Д°",
  "( ︶︿︶)",
  "( .-. )",
  "( .o.)"
];

window.randomFace = function () {
	return window.faces[Math.round(Math.random()*(window.faces.length-1))];
}

let zindex = 100500;
window.showDialog = function (header, content, code) {
	let dialog = document.createElement('div');
	dialog.className = "dialog";
	dialog.style.zIndex = zindex++;

	let dialogContent = document.createElement('div');
	dialogContent.className = "dialog-content";

	let h1 = document.createElement('h1');
	h1.innerText = window.randomFace();
	dialogContent.appendChild(h1);

	let h2 = document.createElement('h2');
	h2.innerText = header;
	dialogContent.appendChild(h2);

	let p = document.createElement('p');
	p.innerText = content;
	dialogContent.appendChild(p);

	let span = document.createElement('span');
	span.innerText = code;
	dialogContent.appendChild(span);

	dialog.appendChild(dialogContent);

	document.body.appendChild(dialog);
	document.body.style.overflow = 'hidden';
}