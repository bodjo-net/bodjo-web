import React from 'react';
import { Link } from "react-router-dom";
import './Link.css';

let links = {}
class _Link extends React.Component {
	constructor(props) {
		super(props);

		this.__to = props.to;
		if (!Array.isArray(links[props.to]))
			links[props.to] = [];
		links[props.to].push(this);
	}

	componentWillUnmount() {
		let index = links[this.props.to].findIndex(link => link == this);
		if (index >= 0)
			links[this.props.to].splice(index, 1);
	}

	onClick(to) {
		let current = window.location.pathname;
		for (let dest in links) {
			if (dest == current || dest == to) {
				for (let link of links[dest])
					link.forceUpdate();
			}
		}
		this.__to = to;
	}

	render() {
		if (this.props.to.indexOf('\/\/') == 0 ||
			this.props.to.indexOf('http:\/\/') == 0 ||
			this.props.to.indexOf('https:\/\/') == 0)
			return <a href={this.props.to} className={(this.props.className||'')+' link'}>{this.props.children}</a>;

		return <Link 
					to={this.props.to} 
					onClick={this.onClick.bind(this, this.props.to)}
					className={'link '+(this.props.className||'')+
							   ((window.location.pathname == this.props.to ||
								 window.location.pathname == this.__to) ? ' active' : '')}>
					{this.props.children}
				</Link>;
	}
}

export default _Link;