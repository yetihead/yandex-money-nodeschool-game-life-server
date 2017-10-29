'use strict';

const WebSocket = require('ws');
const qs = require('query-string');
const LifeGame = require('../lib/LifeGameVirtualDom');
const randomHEXColor = require('random-hex-color');

const game = new LifeGame();
const wss = new WebSocket.Server({
	port: 3000,
	verifyClient: ({req}, done) => {
		const {token} = qs.parse(req.url.substr(2));
		if (!token) {
			done(false, 401, 'There is no token!');
		}
		req.__token = token;
		done(true);
	}
});

wss.on('connection', (ws, {__token}) => {

	ws.on('message', msg => {
		const {type, data} = JSON.parse(msg);

		if (type === 'ADD_POINT' && data) {
			game.applyUpdates(data);
			return;
		}
		
		console.warn('unhandled message type: ', type, JSON.stringify(data, null, ' '));
	});

	ws.on('error', err => {
		console.warn('error in socket: ', err);
	});

	ws.send(JSON.stringify({
		type: 'INITIALIZE',
		data: {
			state: game.state,
			settings: game.settings,
			user: {
				token: __token,
				color: randomHEXColor()
			}
		}
	}));
});

game.sendUpdates = data => {
	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({ type: 'UPDATE_STATE', data }));
		}
	});
};


//
// YOUR CODE GOES HERE...
//
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░░░░░░░░░░
// ░░░░░░░░▄▀░░░░░░░░░░░░▄░░░░░░░▀▄░░░░░░░░
// ░░░░░░░░█░░▄░░░░▄░░░░░░░░░░░░░░█░░░░░░░░
// ░░░░░░░░█░░░░░░░░░░░░▄█▄▄░░▄░░░█░▄▄▄░░░░
// ░▄▄▄▄▄░░█░░░░░░▀░░░░▀█░░▀▄░░░░░█▀▀░██░░░
// ░██▄▀██▄█░░░▄░░░░░░░██░░░░▀▀▀▀▀░░░░██░░░
// ░░▀██▄▀██░░░░░░░░▀░██▀░░░░░░░░░░░░░▀██░░
// ░░░░▀████░▀░░░░▄░░░██░░░▄█░░░░▄░▄█░░██░░
// ░░░░░░░▀█░░░░▄░░░░░██░░░░▄░░░▄░░▄░░░██░░
// ░░░░░░░▄█▄░░░░░░░░░░░▀▄░░▀▀▀▀▀▀▀▀░░▄▀░░░
// ░░░░░░█▀▀█████████▀▀▀▀████████████▀░░░░░░
// ░░░░░░████▀░░███▀░░░░░░▀███░░▀██▀░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
//
// Nyan cat lies here...
//
