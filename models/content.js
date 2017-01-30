var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var Content = new Schema({
	//_id: Number,
	type: String,
	properties: {
		label: String,
		address1: String,
		address2: String,
		city: String,
		state: String,
		zip: Number,
		phone: String,
		description: String,
		current: Boolean,
		website: String,
		cat: String,
		hours: {
			mo: {
				begin: Date,
				end: Date,
				allday: Boolean,
				closed: Boolean
			},
			tu: {
				begin: Date,
				end: Date,
				allday: Boolean,
				closed: Boolean
			},
			we: {
				begin: Date,
				end: Date,
				allday: Boolean,
				closed: Boolean
			},
			th: {
				begin: Date,
				end: Date,
				allday: Boolean,
				closed: Boolean
			},
			fr: {
				begin: Date,
				end: Date,
				allday: Boolean,
				closed: Boolean
			},
			sa: {
				begin: Date,
				end: Date,
				allday: Boolean,
				closed: Boolean
			},
			su: {
				begin: Date,
				end: Date,
				allday: Boolean,
				closed: Boolean
			}
		},
		image: String,
		thumb: String,
		clothing: Boolean,
		computer: Boolean,
		dayroom: Boolean,
		dental: Boolean,
		pantry: Boolean,
		housing: Boolean,
		meals: Boolean,
		medical: Boolean,
		personalcare: Boolean,
		showers: Boolean,
		shelter: Boolean,
		transportation: Boolean
	},
	geometry: {
		'type': {type: String},
	    coordinates: []
	}
}, { collection: 'es' })
Content.plugin(autoIncrement.plugin, 'Content');
module.exports = mongoose.model('Content', Content);