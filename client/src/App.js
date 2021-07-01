import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useSocket from './socket';
import produce from 'immer';
import moment from 'moment';
import './App.css';

function App() {
	const [ name, setName ] = useState('');

	const [ showRoom, setShowRoom ] = useState(false);
	const input = useRef(null);
	const [ socket ] = useSocket('ws://localhost:5001/api/socket', {
		autoConnect: false
	});

	const Splash = () => {
		const login = (e) => {
			if (e) {
				setShowRoom(true);
			}
		};
		const handleSubmit = (event) => {
			const userName = input.current.value;
			setName(userName);
			login(userName);
			event.preventDefault();
		};
		return (
			<div className="splashContainer">
				<h1>ChatBox</h1>
				<p>Please type your name to join the Chat:</p>
				<form onSubmit={handleSubmit}>
					<input type="text" placeholder="Name" ref={input} />
					<input type="submit" value="Enter" />
				</form>
			</div>
		);
	};
	const Room = () => {
		const [ message, setMessage ] = useState('');
		const [ messages, setMessages ] = useState([]);
		const messageEl = useRef(null);

		//connect socket
		socket.connect();
		useEffect(
			() => {
				socket.once('newMessage', (message) => {
					const insert = produce(messages, (draft) => {
						draft.push(message);
					});
					setMessages(insert);
				});
			},
			[ messages ]
		);

		useEffect(() => {
			axios.get('http://localhost:5001/messages').then((response) => {
				setMessages(response.data.data);
			});
		}, []);

		useEffect(() => {
			if (messageEl) {
				messageEl.current.addEventListener('DOMNodeInserted', (event) => {
					const { currentTarget: target } = event;
					target.scroll({ top: target.scrollHeight, behavior: 'auto' });
				});
			}
		}, []);
		const sendMessage = () => {
			// check for shortcut
			const shortcuts = [
				{
					short: 'brb',
					full: 'Be Right Back 🚀'
				},
				{
					short: 'tyt',
					full: 'Tack your time'
				},
				{
					short: 'cu',
					full: 'See You 👋'
				},
				{
					short: 'bye',
					full: 'Bye 👋'
				},
				{
					short: ':)',
					full: '😀'
				},
				{
					short: 'lol',
					full: '🤣'
				}
			];

			const hasShort = shortcuts.filter((i) => i.short === message);
			let msg;
			if (hasShort.length > 0) {
				msg = hasShort[0].full;
			} else {
				msg = message;
			}

			axios
				.post('http://localhost:5001/messages', {
					name: name,
					message: msg
				})
				.then((res) => {
					console.log('message has been sent');
					setMessage('');
				});
		};
		const handleMessage = (e) => {
			setMessage(e);
		};

		const onEnter = (event) => {
			if (event.keyCode === 13) {
				sendMessage();
			}
		};

		return (
			<div className="roomContainer">
				<div className="head">
					User: <span className="username">{name}</span>
					<h1>ChatBox</h1>
				</div>
				<div className="messages" ref={messageEl}>
					{messages.map((m, i) => {
						var str = m.name;
						var matches = str.match(/\b(\w)/g);
						var acronym = matches.join('');

						return (
							<div key={i} className="msgHolder">
								<span className="avatar">{acronym}</span>
								<span
									className="msg"
									style={{
										backgroundColor: name === m.name ? '#2176FF' : '#fff',
										color: name === m.name ? '#fff' : '#000'
									}}
								>
									{m.message}
								</span>
								<span className="by">
									by {m.name} | {moment(m.created_at).fromNow()}
								</span>
							</div>
						);
					})}
				</div>
				<div className="footerHolder">
					<input
						type="text"
						placeholder="Message"
						value={message}
						onChange={(e) => handleMessage(e.target.value)}
						onKeyDown={(e) => onEnter(e)}
					/>
					<button onClick={sendMessage}>Send</button>
				</div>
			</div>
		);
	};
	return showRoom ? <Room /> : <Splash />;
}

export default App;
