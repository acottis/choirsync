const express = require('express')
const fs = require('fs')

const app = express()
const port = 3000

app.use('/static', express.static('Client'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send("Hello World")
})

app.post('/recording', (req, res) => {
   // res.send("Hello World")
  
   fs.appendFile('test.mp3', req.body, function(err){
       console.log(err)
   })
//    fs.writeFile('Test.mp3', req.body, function(err) {
//        console.log(err)
//    })
   //res.send(req.body)
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})