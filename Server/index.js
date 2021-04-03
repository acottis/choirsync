require('dotenv').config()

const fetch = require('node-fetch');
const express = require('express')
const multer = require('multer')
const fs = require('fs')
const db = require('./mongodb')
const FormData = require('form-data');
const { Readable } = require('stream');
const { equal } = require('assert');

const password_required = "hello"

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('recording')


const app = express()
app.use(express.json())
const port = process.env.PORT || 8080

app.post('/api/v0/authenticate', (req, res) => {
    if (req.body.password == password_required) {
        res.json({
            status: "success",
            message: "Correct password"
        })
    }
    else {
        res.json({
            status: "failure",
            message: "Wrong password"
        })
    }
})

app.post('/api/v0/recording', (req, res) => {
    upload(req, res, async (err) => {
        if (req.body.password == password_required) {
            console.log(req.body)
            if (err instanceof multer.MulterError) {
                console.log(err)
                res.json({
                    status: "error",
                    message: "Multer Error, check server logs"
                })
            } else if (err) {
                console.log(err)
                res.json({
                    status: "error",
                    message: "Non Multer Error, check server logs"
                })
            } else {
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

                }
                catch (err) {
                    res.json({
                        status: "failure",
                        message: "Recording could not be processed"
                    })
                    console.log(err)
                }
            }
        }
        else{
            res.json({
                status: "failure",
                message: "Go away"
            })
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