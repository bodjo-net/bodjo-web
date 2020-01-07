import React from 'react';
import './Face.css';

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

export default (window.randomFace = function (type) {
	if (typeof type !== 'string')
		type = 'react';
	let text = window.faces[Math.round(Math.random()*(window.faces.length-1))];

	if (type === 'react') {
		let spans = [];
		for (let i = 0; i < text.length; ++i) {
			spans.push(<span key={i+''} style={{animationDelay: (i / 3) % 1 + 's'}}>{text[i]}</span>)
		}
		return <div className="face">{spans}</div>;
	} else {
		let h = '<div className="face">';
		for (let i = 0; i < text.length; ++i)
			h += '<span style="animation-delay: ' + ((i / 3) % 1) + 's">' + text[i] + '</span>';
		return h + '</div>';
	}
});