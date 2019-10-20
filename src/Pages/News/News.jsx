import React from 'react';
import T from '../../Controllers/LanguageController';
import RandomFace from '../../Components/Face/Face';
import './News.css';

class NewsPage extends React.Component {
	render() {
		return (
			<div id='news'>
				<b><RandomFace /></b>
				<p>{T('news_missing')}</p>
			</div>
		);
	}
}

export default NewsPage;