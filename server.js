const express = require('express')
const app = express()
const port = 3000
const crud = require('./routes/crud')


//middlewares
app.use(express.json())

//views
app.get("/", (req,res) => { //health check
    return res.send("Hello world")
})

app.use('/', crud)

app.listen(port, () => {
    console.log(`Server listen on ${port}`)
})