import React from 'react';
import './Loading.css';
export default function (props) {
	return <div className={(props.inline?'inline ':'')+'loader'}></div>
}