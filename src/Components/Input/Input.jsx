import React from 'react';
import ReactDOM from 'react-dom';
import './Input.css';

class Input extends React.Component {
	constructor(props) {
		super(props);

		this.hasError = false;
	}
	value() {
		let input = ReactDOM.findDOMNode(this);
		return input.value;
	}
	error() {
		let input = ReactDOM.findDOMNode(this);
		if (this.hasError)
			return;

		this.hasError = true;
		input.className = (this.props.className||'') + ' error';
		setTimeout(() => {
			input.className = (this.props.className||'');
			this.hasError = false;
		}, 500);
	}
	render() {
		return <input
					type={this.props.type}
					placeholder={this.props.placeholder}
					name={this.props.name}
					id={this.props.id}
					className={this.props.className}
					onChange={this.props.onChange}
					onKeyUp={this.props.onKeyUp}
					defaultValue={this.props.value}
				/>;
	}
}

export default Input;