require('dotenv').config()

const fetch = require('node-fetch');
const express = require('express')
const multer = require('multer')
const fs = require('fs')
// const db = require('./mongodb')
const FormData = require('form-data');
const { Readable } = require('stream');
const { Storage } = require('@google-cloud/storage');

const password_required = process.env.TURINGTEST
const secret_password = process.env.TURINGTEST2
let access_secret

const upload = multer({ storage: multer.memoryStorage() }).single('recording')


const gstorage = new Storage();

const app = express()
app.use(express.json())
const port = process.env.PORT || 8080

app.post('/api/v0/files', async (req, res) => {
    if (req.body.password == password_required || req.body.password == secret_password) {
        if (req.body.password == secret_password){
            access_secret = true
        }
        else{
            access_secret = false
        }
        const songs = await listFiles()
        res.json({
            songs: songs,
            status: "success",
            message: "Sending song names..."
        })
    } else {
        res.json({
            status: "failure",
            message: "Wrong password, how did you get in?"
        })
    }
})

app.post('/api/v0/authenticate', (req, res) => {
    if (req.body.password == password_required || req.body.password == secret_password) {
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
    // Multer handles the formData
    upload(req, res, async (err) => {
        if (req.body.password == password_required || req.body.password == secret_password) {
            if (err instanceof multer.MulterError) {
                console.log(err)
                res.json({
                    status: "failure",
                    message: "Multer Error, check server logs"
                })
            } else if (err) {
                console.log(err)
                res.json({
                    status: "failure",
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
                    res.json({
                        status: "success",
                        message: "Sent recording"
                    })

                }
                catch (err) {
                    res.json({
                        status: "failure",
                        message: "Webhook error"
                    })
                    console.log(err)
                }
            }
        }
        else {
            res.json({
                status: "failure",
                message: "Wrong password, how did you get in?"
            })
        }
    })
})

const discord_webhook = (req) => {

    console.log(`Recieved ${req.file.originalname} from ${req.ip}`)
    const audio = Readable.from(req.file.buffer, {
        highWaterMark: 1024
    })

    const fd = new FormData()
    fd.append("file", audio, {
        filename: req.file.originalname
    })
    if (req.body.message == "") {
        fd.append("content", `${req.body.singer_name} didn't add a comment`)
    }
    else{
        fd.append("content", `${req.body.singer_name} said: "${req.body.message}"`)
    }

    fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_ENDPOINT}`,
        {
            method: "POST",
            body: fd,
        })
        // .then(res => {
        //     console.log(res.status)
        // })
}


app.use('/', express.static('Client'))

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});


async function listFiles() {
    // Lists files in the bucket
    const [files] = await gstorage.bucket("choirsync.appspot.com").getFiles()

    const songs = []

    files.forEach((file, i) => {
        if (file.name.slice(-4) != ".mp3") {
            delete files[i]
        }
        if (!access_secret && file.name.includes("SECRET ")){
            delete files[i]
        }
    })


    files.forEach(file => {
        let split_path = file.name.split("/")
        let song = split_path[split_path.length - 1]
        let part = song.split("_")[1].replace(".mp3","")
        let folder = split_path[split_path.length - 2]
        let recordable = true
        let secret = false

        if (folder.includes("NOREC ") ){
            recordable = false
            folder = folder.replace("NOREC ","")
        }

        if (folder.includes("SECRET ") ){
            secret = true
            folder = folder.replace("SECRET ","")
        }

        songs.push({
            song: folder,
            part: part,
            recordable: recordable,
            secret: secret
        })
    })

    return songs
}