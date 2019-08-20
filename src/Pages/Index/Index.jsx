import React from 'react';
import GamesList from './GamesList/GamesList';
import NewsList from './NewsList/NewsList';
import './Index.css';

class IndexPage extends React.Component {
	constructor(props) {
		super(props);
	}


	render() {
		setTimeout(window.loadBodjoPage.bind(null, 'main.about.ru', '#index .whatisit', {
			signature: false,
			cache: true
		}), 1);


		return (
			<div id="index">
				<div className="left">
					<div className="section whatisit"></div>
					<GamesList />
				</div>
				<div className="right">
					<NewsList />
				</div>
			</div>
		);
	}
}


export default IndexPage;