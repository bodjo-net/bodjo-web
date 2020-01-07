import './Dialog.css';
import randomFace from '../Components/Face/Face';

let zindex = 100500;
window.showDialog = function (header, content, code) {
	let dialog = document.createElement('div');
	dialog.className = "dialog";
	dialog.style.zIndex = zindex++;

	let dialogContent = document.createElement('div');
	dialogContent.className = "dialog-content";

	let h1 = document.createElement('h1');
	h1.innerHTML = randomFace('html');
	dialogContent.appendChild(h1);

	let h2 = document.createElement('h2');
	h2.innerText = header;
	dialogContent.appendChild(h2);

	let p = document.createElement('p');
	p.innerText = content;
	dialogContent.appendChild(p);

	if (code) {
		let pre = document.createElement('pre');
		pre.innerText = code;
		dialogContent.appendChild(pre);
	}

	dialog.appendChild(dialogContent);

	document.body.appendChild(dialog);
	document.body.style.overflow = 'hidden';
}