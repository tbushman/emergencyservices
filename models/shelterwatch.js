const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ShelterWatch = new Schema({
	Date:Date,
	Time:String,
	"Geraldine King":Number,
	"Mens Shelter":Number,
	"Gail Miller":Number,
	"Gail Miller (Women)":Number,
	"Gail Miller (Men)":Number,
	"Overflow Center":Number,
	"Total (non-site-specific)":Number,
	"Temperature @ Call Time (F)":Number,
	"Daily Temp Low":Number
}, {collection: 'sw'});
module.exports = mongoose.model('ShelterWatch', ShelterWatch);