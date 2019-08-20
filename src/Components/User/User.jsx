import React from 'react';
import Link from './../../Components/Link/Link';
import UserInfo from './../../Controllers/UserInfoController';
import './User.css';

class User extends React.Component {
	constructor(props) {
		super(props);

		this.state = {loading: true, info: null};
		UserInfo.load(this.props.username, info => {
			this.setState({
				loading: false,
				info
			});
		})
	}

	render() {
		return (
			<div className={'user'+(this.state.loading?' loading':'')}>
				<span 
					className='image'
					style={{backgroundImage: (this.state.info ? 'url('+this.state.info.image[64]+')' : '')}}>
				</span>
				{this.props.me ? 
					<Link to="/my-account/" className='username'>{this.props.username}</Link> : 
					<span className='username'>{this.props.username}</span>
				}
			</div>
		);
	}
}

export default User;