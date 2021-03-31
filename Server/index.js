require('dotenv').config()

const fetch = require('node-fetch');
const express = require('express')
const multer = require('multer')
const fs = require('fs')
const db = require('./mongodb')
const FormData = require('form-data');
const { Readable } = require('stream');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('recording')


const app = express()
const port = process.env.PORT || 8080


app.post('/api/v0/recording', (req, res) => {
    upload(req, res, (err) => { 
        
        if (err instanceof multer.MulterError) {
            res.json({
                status: "error",
                message: "Multer Error, check server logs"
            })
            console.log(err)
        } else if (err) {
            console.log(err)
            res.json({
                status: "error",
                message: "Non Multer Error, check server logs"
            })
        }
        try {
            // Write file to temp folder
            // fs.writeFile(`./${Date.now()}-${req.file.originalname}`, req.file.buffer, (err) => {
            //     if (err) throw err;
            //     console.log
            // })

            // Save a recording to DB
            //db.store_recording(`${req.file.originalname}`, req.file.buffer, new Date().toISOString())

            // Send recording to discord
            discord_webhook(req);

            res.json({
                file: req.file.originalname,
                status: "success",
                message: `${req.file.originalname} has been recieved by the server`
            })            
            
        }
        catch(err){
            res.json({
                file: req.file.originalname,
                status: "failure",
                message: `${req.file.originalname} could not be processed`
            })
            console.log(err)
        }
    })

})

const discord_webhook = (req) => {

    console.log(`Recieved ${req.file.originalname} from ${req.ip}`)
    const audio = Readable.from(req.file.buffer, {
        highWaterMark: 1024
    })
    //const file = fs.createReadStream('test.webm')

    const fd = new FormData()
    fd.append("file", audio, {
        filename: req.file.originalname
    })
    fd.append("content", `Recieved ${req.file.originalname} from ${req.ip}`)

    fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_ENDPOINT}`,
    {
        method: "POST",
        body: fd,
    })
    .then( res => {
        console.log(res.status)
    })
}


app.use('/', express.static('Client'))

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});