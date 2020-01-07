import React from 'react';

import RandomFace from '../Components/Face/Face';
import Button from '../Components/Button/Button';

import T from '../Controllers/LanguageController';

export default function () {
	return (
		<div style={{
			maxWidth: 600,
			margin: '0 auto'
		}}>
			<br />
			<h1 style={{
				color: '#B71C1C',
				margin: 0
			}}>
				<RandomFace></RandomFace>
			</h1>
			<h2>{T('404_header')}</h2>
			<p>{T('404_text')}</p>
			<Button to="/">{T('404_button')}</Button>
		</div>
	);
}