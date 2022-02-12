const mongoose = require('mongoose');

const xxxSchema = new mongoose.Schema({
    laneNo: String,
    rackNo: String,
    unit: String,
    units: Object,
    plugger: String,
    monitors: Array
});

module.exports = mongoose.model('xxxModel', xxxSchema);