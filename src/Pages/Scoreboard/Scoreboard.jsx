import React from 'react';
import './Scoreboard.css';

class ScoreboardPage extends React.Component {
	render() {
		return (
			<div id="scoreboard">
				<b>{window.randomFace()}</b>
				<p>пока нету</p>
			</div>
		);
	}
}

export default ScoreboardPage;