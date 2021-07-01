const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Message = require('./models/message');
const app = express();

app.use(express.json());
app.use(cors());
// websocket
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
	cors: {
		origin: '*'
	}
});

io.of('/api/socket').on('connection', (socket) => {});

// database connection
mongoose.connect(
	'mongodb+srv://zainab:uiZpJYwQtYqTP9s@cluster1.9ewwr.mongodb.net/chatbox?retryWrites=true&w=majority',
	{
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true
	},
	function(err) {
		if (err) console.log(err);
		console.log('database is connected');
	}
);

// connect to socket
const connection = mongoose.connection;

connection.once('open', () => {
	console.log('Setting change streams');
	const messageChangeStream = connection.collection('messages').watch();

	messageChangeStream.on('change', (change) => {
		switch (change.operationType) {
			case 'insert':
				console.log('new data has been inserted');
				io.of('/api/socket').emit('newMessage', change.fullDocument);
				break;
		}
	});
});

app.get('/messages', async (req, res) => {
	try {
		Message.find({}, async (err, message) => {
			if (!message) return await res.json({ status: 200, error: 'No Message Founded' });
			res.json({
				status: 200,
				data: message.reverse()
			});
		})
			.sort({ created_at: -1 })
			.limit(100);
	} catch (err) {
		console.log(err);
	}
});

app.post('/messages', async (req, res) => {
	try {
		const newMessage = new Message(req.body);
		newMessage.save(async (err, doc) => {
			if (err) {
				console.log(err);
				return res.json({ success: false });
			}

			res.status(200).json({
				succes: 200,
				name: doc.name,
				message: doc.message
			});
		});
	} catch (err) {
		console.log(err);
	}
});

server.listen(5001, () => {
	console.log(`app is live at http://192.168.100.15:5001`);
});
