import React from 'react';
import Button from './../../Components/Button/Button';

import SocialController from './../../Controllers/SocialController';

import './SocialButton.css';
import T from './../../Controllers/LanguageController';

const colors = {
	'github': '#000000',
	'discord': '#7289da',
	'google': '#FFFFFF'
};

function capitalize(string) {
	return string[0].toUpperCase() + string.substring(1);
}

class SocialButton extends React.Component {
	render() {
		let bgColor = colors[this.props.social] || '#FFFFFF';
		let invertColor = bgColor !== '#FFFFFF'; // todo: make normally
		return (
			<Button
				disabled={this.props.disabled}
				invert={invertColor}
				className='socialbutton'
				style={{ backgroundColor: bgColor }}
				onClick={SocialController[this.props.purpose].bind(SocialController, this.props.social)}
			>
				<img src={'/assets/social/'+this.props.social+'.png'} />
				<p>{T('login_social_button') + ' ' + capitalize(this.props.social)}</p>
			</Button>
		);
	}
}

export default SocialButton;