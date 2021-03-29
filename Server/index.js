require('dotenv').config()

const express = require('express')
const multer = require('multer')
const fs = require('fs')
const db = require('./mongodb')

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
        
        // Write file to temp folder
        fs.writeFile(`temp\\${Date.now()}-${req.file.originalname}`, req.file.buffer, (err) => {
            if (err) throw err;
            console.log
        })

        // Save a recording to DB
        db.store_recording("${uniqueSuffix}-${req.file.originalname}", req.file.buffer, new Date().toISOString())

        res.json({
            file: req.file.originalname, 
            status: "success",
            message: `${req.file.originalname} has been recieved by the server`
        })
    })

})

app.use('/', express.static('Client'))

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});