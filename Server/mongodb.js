const monk = require('monk');
const uri = process.env.DB_URI

const db = monk(uri);
db.then(() => {
	console.log(`Connected correctly to MongoDB`);
});


const recordings = db.get('recordings');


const store_recording = (name, blob, date) => {
    recordings.insert({
        name: name,
        recording: blob,
        date: date
    })
}

module.exports = {
    store_recording
}
