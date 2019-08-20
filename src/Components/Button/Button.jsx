import React from 'react';
import ReactDOM from 'react-dom';
import './Button.css';

class Button extends React.Component {
	constructor(props) {
		super(props);

		this.enterHandler = this.onEnter.bind(this);
		this.disabled = props.disabled || false;
	}
	
	_down(element, event) {
		if (this.disabled)
			return;
		let rect = element.getBoundingClientRect();
		let x = (event.clientX - rect.left), y = (event.clientY - rect.top);
		let R = Math.max(
					Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
					Math.sqrt(Math.pow(x-rect.width, 2) + Math.pow(y, 2)),
					Math.sqrt(Math.pow(x, 2) + Math.pow(y-rect.height, 2)),
					Math.sqrt(Math.pow(x-rect.width, 2) + Math.pow(y-rect.height, 2))
				);

		let ripple = document.createElement('div');
		ripple.className = 'ripple';
		ripple.style.position = 'absolute';
		ripple.style.transition = 'all 0.25s cubic-bezier(0.215, 0.61, 0.355, 1)';
		ripple.style.borderRadius = '50%';
		ripple.style.opacity = '1';
		ripple.style.top = y + "px";
		ripple.style.left = x + "px";
		ripple.style.width = ripple.style.height = '0px';
		ripple.id = 's' + Date.now();
		setTimeout(function () {
			ripple.style.opacity = '0.75';
			ripple.style.top = (y-R) + "px";
			ripple.style.left = (x-R) + "px";
			ripple.style.width = ripple.style.height = R*2 + 'px';
		}, 10);

		element.append(ripple);
	}
	_up(element, event) {
		let ripples = element.querySelectorAll('.ripple');
		if (ripples == null)
			return;

		for (let i = 0; i < ripples.length; ++i) {
			let ripple = ripples[i];
			let start = parseInt(ripple.id.substring(1));
			if (Date.now() - start > 250) {
				ripple.style.opacity = '0';
				setTimeout(ripple.remove.bind(ripple), 250);
			} else {
				setTimeout(function () {
					ripple.style.opacity = '0';
					setTimeout(ripple.remove.bind(ripple), 250);
				}, 250 - (Date.now() - start))
			}
		}
	}


	componentDidMount() {
		let element = ReactDOM.findDOMNode(this);
		element.style.position = 'relative';
		element.style.overflow = 'hidden';

		this.down = this._down.bind(this, element);
		this.up = this._up.bind(this, element);
		element.addEventListener('mousedown', this.down);
		document.body.addEventListener('mouseup', this.up);
	}
	componentWillMount() {
		if (this.props.enter)
			window.addEventListener('keyup', this.enterHandler);
	}
	componentWillUnmount() {
		if (this.props.enter)
			window.removeEventListener('keyup', this.enterHandler);

		document.body.removeEventListener('mouseup', this.up);
	}

	onEnter(event) {
		if (event.keyCode == 13) {
			if (typeof this.props.onClick === 'function')
				this.props.onClick();
		}
	}	

	setDisabled(value) {
		this.disabled = value;
		let element = ReactDOM.findDOMNode(this);
		let classes = element.className.split(' ');
		if (value && classes.indexOf('disabled') < 0)
			classes.push('disabled');
		else if (!value) {
			while (classes.indexOf('disabled') >= 0)
				classes.splice(classes.indexOf('disabled'), 1);
		}
		element.className = classes.join(' ');
	}

	redirect(to) {
		window.location.href = to;
	}

	render() {
		let className = this.props.className || '';
		if (this.props.invert)
			className += ' invert';
		if (this.disabled || this.props.disabled) {
			this.disabled = this.props.disabled;
			className += ' disabled';
		}
		return ( 
			<div className={className+' button'} 
				 id={this.props.id} 
				 onClick={this.props.to ? this.redirect.bind(this, this.props.to) : this.props.onClick}>
				 {this.props.children}
			</div> 
		);
	}
}

export default Button;