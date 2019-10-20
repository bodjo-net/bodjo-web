import React from 'react';
import T from '../../Controllers/LanguageController';
import RandomFace from '../../Components/Face/Face';
import './Scoreboard.css';

class ScoreboardPage extends React.Component {
	render() {
		return (
			<div id="scoreboard">
				<b><RandomFace /></b>
				<p>{T('scoreboard_missing')}</p>
			</div>
		);
	}
}

export default ScoreboardPage;