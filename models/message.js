var mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
	message: {
		type: String,
		required: true,
		unique: false
	},
	name: {
		type: String,
		require: true,
		unique: false
	},
	created_at: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('message', messageSchema);
