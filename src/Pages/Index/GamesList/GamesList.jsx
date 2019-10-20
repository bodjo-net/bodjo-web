import React from 'react';
import Link from './../../../Components/Link/Link';
import Button from './../../../Components/Button/Button';
import Loading from './../../../Components/Loading/Loading';
import API from './../../../Controllers/APIController';
import account from './../../../Controllers/AccountController';
import T from './../../../Controllers/LanguageController';

import './GamesList.css';

class GamesList extends React.Component {
	constructor(props) {
		super(props);

		this.gameServers = {};
		this.state = {loading: true};

		let self = this;
		function obtain(component, isMounted, data) {
			let games = {};
			for (let server of data.servers) {
				let gameServer = 
						self.gameServers[server.name] = 
						new GameServer(server, (info) => {
							let o = {}; o[info.name] = info;
							self.setState(o);
						});
				gameServer.obtain();
				games[server.name] = gameServer.info();
			}
			games.loading = false;
			if (isMounted)
				component.setState(games);
			else component.state = games;
		}
		if (window.__gamesListCache) {
			obtain(this, false, window.__gamesListCache);
		} else {
			let roptions = {};
			if (account.token && account.verified)
				roptions.token = account.token;
			API.GET('/games/info', roptions, (status, data) => {
				if (status && data.status === 'ok') {
					obtain(this, true, data);
					window.__gamesListCache = data;
				}
			})
		}
	}

	componentWillUnmount() {
		for (let serverName in this.gameServers)
			this.gameServers[serverName].destroy();
		this.state = {};
	}

	go(name, link) {
		// API.GET('/games/join', {name: name, token: account.token}, (status, data) => {
			// if (status && data.status === 'ok')
				// window.location.href = link + '/#' + data.username + ':' + data.gameSessionToken;
		// });
		window.location.href = link + '/#' + account.username + ':' + account.token;
	}

	render() {
		let content = [];

		if (!this.state.loading) {
			let games = {};
			for (let serverName in this.state) {
				if (serverName == 'loading') continue;
				let game = this.state[serverName].game;
				if (this.state[serverName].local && 
					this.state[serverName].status)
					game = '_' + this.state[serverName].name;
				if (typeof games[game] === 'undefined')
					games[game] = [];
				games[game].push(this.state[serverName]);
			}

			for (let gameName in games) {
				let realGameName = (games[gameName][0]||{game:gameName}).game;
				let serversContent = [];
				for (let server of games[gameName]) {
					// console.log(server.spectateLink)
					serversContent.push(
						<div className="game-server" key={server.name}>
							<div className="info">
								<span className={'status ' + (server.status?'enabled':'disabled')} /> 
								<span className="players-count">{
									server.status ? 
									(<span>[{ server.local ? <i>local</i> : <span><b>{server.players.value}</b>/{server.players.max}</span> }]</span>) :
									(<span>[<b className="loading"><span>-/|\</span></b>]</span>)
								}</span>
								<span className="name">{server.showName}</span>
							</div>
							<div className={"go"+(!account.verified?" disabled":"")}>
								<div>
									{/*<span className="ping">{(server.ping||0).toFixed(1)}ms</span>*/}
									<Button disabled={!server.status || !account.verified} onClick={this.go.bind(this, server.name, server.link)}>{ T('game_play') }</Button>
									<span className="label">{T('game_shouldlogin1')} <Link to="/login/">{ T('game_shouldlogin2') }</Link></span>
								</div>
								<Button invert disabled={!server.status} to={server.spectateLink}>{ T('game_spectate') }</Button>
							</div>
						</div>
					);
				}

				content.unshift(
					<div className={'game' + (gameName[0]=='_'?' event':'')} key={gameName} style={{backgroundImage: 'url(assets/games/'+realGameName+'/bg.png)'}}>
						<h3>{gameName[0] == '_' ? 'LIVE '+realGameName+' hackathon' : realGameName}</h3>
						{gameName[0] == '_' ? <div className="eventanim"><span></span><span></span><span></span></div> : ''}
						{serversContent}
						<div className="grey"></div>
					</div>
				);
			}
		}

		if (content.length == 0) {
			content.push(
				<div className="no-games" key="no-games">
					<h3>{window.randomFace()}</h3>
					<span>все сломалось! где игрыы?</span>
				</div>
			);
		}

		return (
			<div className="section games">
				<h2><img src='/assets/games.png' />{ window.T('tab_games') }</h2>
				{this.state.loading ? <Loading /> : content}
			</div>
		);
	}
}

class GameServer {
	constructor(info, onUpdate) {
		this.onUpdate = onUpdate;
		this.host = info.host;
		this.apihost = info.apihost;
		this.name = info.name;
		this.game = info.game;
		this.showName = (this.name.substring(0, this.game.length+1) == this.game+'-') ?
						 this.name.substring(this.game.length+1) : this.name;
		this.status = false;
		this.link = info.host;
		if (this.link.indexOf('http:\/\/') < 0 &&
			this.link.indexOf('https:\/\/') < 0)
			this.link = 'http:\/\/' + this.link;
		this.spectateLink = this.link + '/spectate';
		this.loading = true;

		this.local = this.apihost.length == 0;

		// this.pings = [];
		// this.pingValue = null;

		this.players = {value: 0, max: 0}
	}

	update() {
		this.onUpdate(this.info())
	}

	info() {
		return {
			name: this.name,
			showName: this.showName,
			game: this.game,
			host: this.host,
			link: this.link,
			local: this.local,
			// ping: this.pingValue,
			status: this.status,
			players: this.players,
			spectateLink: this.spectateLink
		};
	}

	destroy() {
		if (this.pingTimeout)
			clearTimeout(this.pingTimeout);
	}

	obtain() {
		this.loadInfo();
		// this.pingEach(10);
	}

	loadInfo(callback) {
		if (this.local) {
			let img = new Image();
			img.src = this.link + '/favicon.png';
			img.onload = () => {
				let wasStatus = this.status;
				this.status = true;
				if (wasStatus != this.status)
					this.update();
			}
		} else {
			API.GET(this.apihost+'/status', (status, data) => {
				if (status) {
					this.players.value = data.playersCount;
					this.players.max = data.maxPlayersCount;
					this.loading = false;
					this.status = true;
					this.update();
				} else {
					let wasStatus = this.status;
					this.status = false;
					if (wasStatus != this.status)
						this.update();
				}

				if (typeof callback === 'function')
					callback();
			});
		}
	}
	// ping (callback) {
	// 	let start = Date.now();
	// 	API.GET(this.apihost+'/ping', (status, timestamp) => {
	// 		let end = Date.now(), middle = parseInt(timestamp);
	// 		if (status && !isNaN(middle)) {
	// 			this.pings.push(end-start);
	// 			this.pingValue = this.pings.reduce((a,b)=>a+b) / this.pings.length;
	// 			this.status = true;
	// 			this.update();
	// 		} else {
	// 			let wasStatus = this.status;
	// 			this.status = false;
	// 			if (wasStatus != this.status)
	// 				this.update();
	// 		}

	// 		if (typeof callback === 'function')
	// 			callback();
	// 	}, false);
	// }

	// pingEach(n, i = 0) {
	// 	if (i == n)
	// 		return;

	// 	this.ping(() => {
	// 		this.pingTimeout = setTimeout(this.pingEach.bind(this, n, i+1), 1000*i);
	// 	});
	// }
}

export default GamesList;