import React from 'react';
import './Face.css';

window.faces = [
  "\\(o_o)/",
  "(ノಠ益ಠ)ノ",
  "(ノಠ益ಠ)ノ彡┻━┻",
  "(╯°□°）╯︵ ┻━┻",
  "༼ つ ◕_◕ ༽つ",
  "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧",
  "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ ✧ﾟ･: *ヽ(◕ヮ◕ヽ)",
  "ヽ(`Д´)ﾉ",
  "ノ( º _ ºノ)",
  "(ﾉಥ益ಥ）ﾉ",
  "¬_¬",
  "¯(°_o)/¯",
  "¯\\_(ツ)_/¯",
  "┌( ಠ_ಠ)┘",
  "╚(ಠ_ಠ)=┐",
  "☜(⌒▽⌒)☞",
  "〆(・∀・＠)",
  "ノ( º _ ºノ)",
  "ノ( ゜-゜ノ)",
  "°Д°",
  "( ︶︿︶)",
  "( .-. )",
  "( .o.)",
  "┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻",
  "┬─┬ノ( º _ ºノ)"
];

export default (window.randomFace = function (type) {
	if (typeof type !== 'string')
		type = 'react';
	let text = window.faces[Math.round(Math.random()*(window.faces.length-1))];

	if (type === 'react') {
		let spans = [];
		for (let i = 0; i < text.length; ++i) {
			spans.push(<span key={i+''} style={{animationDelay: (i / 5) % 1 + 's'}}>{text[i]}</span>)
		}
		return <div className="face">{spans}</div>;
	} else {
		let h = '<div class="face">';
		for (let i = 0; i < text.length; ++i)
			h += '<span style="animation-delay: ' + ((i / 5) % 1) + 's">' + text[i] + '</span>';
		return h + '</div>';
	}
});