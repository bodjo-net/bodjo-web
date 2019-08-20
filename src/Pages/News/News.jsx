import React from 'react';
import './News.css';

class NewsPage extends React.Component {
	render() {
		return (
			<div id='news'>
				<b>{window.randomFace()}</b>
				<p>ну, скоро будет...</p>
			</div>
		);
	}
}

export default NewsPage;