import React from 'react';
import ReactDOM from 'react-dom';
import './Textarea.css';

class Textarea extends React.Component {
	constructor(props) {
		super(props);

		this.hasError = false;
	}
	value() {
		let textarea = ReactDOM.findDOMNode(this).querySelector('textarea');
		return textarea.value;
	}
	error() {
		if (this.hasError)
			return;
		this.hasError = true;

		let textarea = ReactDOM.findDOMNode(this).querySelector('textarea');
		textarea.className = (this.props.className||'') + ' error';
		setTimeout(() => {
			textarea.className = (this.props.className||'');
			this.hasError = false;
		}, 500);
	}
	onKeyUp(event) {
		if (this.props.onKeyUp)
			this.props.onKeyUp(event);

		let rootdiv = ReactDOM.findDOMNode(this);
		let textarea = rootdiv.querySelector('textarea');
		let span = rootdiv.querySelector('span');
		if (this.props.max) {
			span.innerText = textarea.value.length+' ('+this.props.max+')';
			span.className = (this.props.max < textarea.value.length) ? 'error' : '';
		} else
			span.innerText = textarea.value.length;
	}
	render() {
		return (
			<div className='textarea'
				 style={this.props.style}>
			 	<textarea
					type={this.props.type}
					placeholder={this.props.placeholder}
					name={this.props.name}
					id={this.props.id}
					className={this.props.className}
					onChange={this.props.onChange}
					onKeyUp={this.onKeyUp.bind(this)}
					defaultValue={this.props.value}
					style={this.props.style}
				></textarea>
				<span>{(this.props.value||'').length + (this.props.max ? ' ('+this.props.max+')' : '')}</span>
			</div>
		);
	}
}

export default Textarea;