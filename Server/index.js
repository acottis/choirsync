const express = require('express')
const multer = require('multer')
const fs = require('fs')

const upload = multer({ dest: 'temp/' }).single('recording')


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
        console.log(req.body)
        console.log(req.file)
        res.json({
            file: req.file.originalname, 
            status: "success"
        })
    })

})

app.use('/', express.static('Client'))

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});