const express = require('express')
const fs = require('fs')

const app = express()
const port = process.env.PORT || 8080

app.use('/static', express.static('Client'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.listen(port, () => {
	console.log(`Listening on: http://localhost:${port}/static`);
});


app.get('/', (req, res) => {
    res.send("Hello World")
})

app.post('/recording', (req, res) => {
   //res.send("Hello World")
  
})


