import React from 'react';
import Loading from './../../../Components/Loading/Loading';
import Link from './../../../Components/Link/Link';
import API from './../../../Controllers/APIController';
import './NewsList.css';

const pagesCount = 2;

class NewsList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {news: [], newsTotal: 0, loading: true};

		function obtain(component, isMounted, data) {
			function more(page) {
				return '<span class="closer"></span><a class="link more" href="https://pages.bodjo.net/'+page.id+'">'+window.T('news_moreinfo')+'</a>';
			}
			let news = data.pages;
			for (let newsPiece of news)
				newsPiece.html = window.parseBodjoPage(newsPiece.preview) + more(newsPiece);
			let newState = {
				news: news,
				newsTotal: data.total,
				loading: false
			};
			if (isMounted)
				component.setState(newState);
			else component.state = newState;
		}

		if (window.__newsListCache) {
			obtain(this, false, window.__newsListCache)
		} else {	
			API.GET('/pages/search', {q: 'news.', lang: window.T.lang, preview: 1, order: false, count: pagesCount}, (status, data) => {
				if (status && data.status === 'ok') {
					obtain(this, true, data);
					window.__newsListCache = data;
				}
			});
		}
	}

	render() {
		return (
			<div className="section news">
				<h2><img src='/assets/news.png' />{ window.T('tab_news') }</h2>
				{this.state.loading ? <Loading /> :
					[
						this.state.news.map(page => <div key={page.id} className='news-piece bodjo-page' dangerouslySetInnerHTML={{__html:page.html}}></div>),
						(this.state.newsTotal > pagesCount ? <Link to="/news/">{ window.T('news_morenews') }</Link> : '')
					]
				}
			</div>
		);
	}
}
export default NewsList;