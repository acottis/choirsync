const express = require('express')
const multer = require('multer')
const fs = require('fs')

const upload = multer({ dest: 'storage/' }).single('recording')


const app = express()
const port = process.env.PORT || 8080


app.post('/api/v0/recording', upload, (req, res) => {
   //res.send("Hello World")
  console.log(req.body)
  console.log(req.file)
  res.json({status: res.statusCode})
})

app.use('/', express.static('Client'))

app.listen(port, () => {
	console.log(`Listening on: http://localhost:${port}/static`);
});