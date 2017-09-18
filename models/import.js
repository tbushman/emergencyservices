var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// data paths to relative keys in import dataset
var importSchema = new Schema({
  importpath: String,
  featurekeypath: [],
  importtype: String,
  _id: String,
	type: String,
	properties: {
		label: String,
		address1: String,
		address2: String,
		city: String,
		state: String,
		zip: String,
		phone: String,
		description: String,
		current: String,
		website: String,
		cat: String,
		hours: {
			mo: {
				begin: String,
				end: String,
				allday: String,
				closed: String
			},
			tu: {
				begin: String,
				end: String,
				allday: String,
				closed: String
			},
			we: {
				begin: String,
				end: String,
				allday: String,
				closed: String
			},
			th: {
        begin: String,
				end: String,
				allday: String,
				closed: String
			},
			fr: {
        begin: String,
				end: String,
				allday: String,
				closed: String
			},
			sa: {
        begin: String,
				end: String,
				allday: String,
				closed: String
			},
			su: {
        begin: String,
				end: String,
				allday: String,
				closed: String
			}
		},
		image: String,
		thumb: String,
		clothing: String,
		computer: String,
		dayroom: String,
		dental: String,
		pantry: String,
		housing: String,
		meals: String,
		medical: String,
		personalcare: String,
		showers: String,
		shelter: String,
		transportation: String
  },
	geometry: {
		'type': {type: String},
    coordinates: [String,String]
	}
}, { collection: 'import' });
module.exports = mongoose.model('Import', importSchema);