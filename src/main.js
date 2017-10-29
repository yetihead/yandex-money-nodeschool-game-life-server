'use strict';

const SocketIO = require('socket.io');
const qs = require('query-string');
const LifeGame = require('../lib/LifeGameVirtualDom');
const randomHEXColor = require('random-hex-color');

const game = new LifeGame();
const io = new SocketIO(3000, {
	path: '/',
	transports: ['websocket']
});

io.use((ws, next) => {
	if (ws.handshake.query && ws.handshake.query.token) {
		return next();
	}
	// тут я так и не понял как установить 401 статус
	next(new Error('Authentication error'));
});

io.on('connection', ws => {
	let token = ws.client.request._query.token;
	ws
		.on('message', messageHandler)
		.on('error', errorHandler)
		.send(initUser(token));
});

game.sendUpdates = data => {
	io.emit('message', JSON.stringify({ type: 'UPDATE_STATE', data }));
};

function messageHandler(msg) {
	const {type, data} = JSON.parse(msg);
	if (type === 'ADD_POINT' && data) {
		game.applyUpdates(data);
		return;
	}
	console.warn('unhandled message type: ', type, JSON.stringify(data, null, ' '));
}

function errorHandler (err) {
	console.warn('error in socket: ', err);
}

function initUser (token) {
	return JSON.stringify({
		type: 'INITIALIZE',
		data: {
			state: game.state,
			settings: game.settings,
			user: {token, color: randomHEXColor()}
		}
	});
}

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
