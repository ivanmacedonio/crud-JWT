const express = require('express')
const { Sequelize } = require('sequelize')
const app = express()
const router = express.Router()
const jwt = require('jsonwebtoken')

//pagination management
const paginate = require('express-paginate')

//model instance
const {Tasks} = require('../database/models')
//db connection
const DB = "crud"

app.use(express.json())

//auth middleware
function verifyToken(req,res,next){
    const header = req.header("Authorization") || ""
    if(header === ""){
        return res.status(400).send("Need to provide a valid header")
    }
    const token = header.split(" ")[1]
    if(!token){
        return res.status(401).send("Need to provide a valid token")
    }
    try{
        const payload = jwt.verify(token, process.env.TOKEN_SECRET)
        console.log(payload.username)
        next()
    } catch(error){
        console.error(error)
        res.status(401).send("Not authorizated")
    }
}

//get tasks
router.get("/tasks", paginate.middleware(3, 50), async (req, res) => { //minimo 3 objetos maximo 50
    try {
        const [ results, itemCount ] = await Promise.all([
            Tasks.findAll({ limit: req.query.limit, offset: req.skip }), //req.query.limit == elementos per page (3)
            //req.skip almacena la cantidad de elementos que ya fueron mostrados por paginas anteriores, y lo usa para no mostrar repetidos. Offset
            //indica cuantos elementos saltear
            Tasks.count()
        ]);
        const pageCount = Math.ceil(itemCount / req.query.limit); //cantidad  de elementos en la tabla / limite (3). Sirve para saber cuantas paginas
        //debe crear y retorna el numero para tener un contador
        
        return res.status(200).json({
            object: 'list',
            has_more: paginate.hasNextPages(req)(pageCount), //si pagecount es <0 retorna true
            data: results
        });
    } catch (error) {
        return res.status(500).send("INTERNAL SERVER ERROR");
    }
});
//post task
router.post("/tasks", verifyToken,  async (req, res) => {
    try {
        const {title, description} = req.body
        if(!title || !description){
            res.status(400).send("You need to provide a valid title or description")
        }
        const taskInstance = await Tasks.create({ Title: title, Description: description })
        if (taskInstance) {
            return res.status(201).send("Task created succesfully!")
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send("INTERNAL SERVER ERROR")
    }
})

//delete task
router.delete("/tasks", async (req, res) => {
    const pk = req.body.pk
    if (!pk) {
        return res.status(404).send("Resource not found")
    }
    try {
        const taskInstance = await Tasks.findByPk(pk)
        await taskInstance.destroy()
    } catch (error) {
        console.log(error)
        return res.status(500).send("INTERNAL SERVER ERROR")
    }
})

//read view
router.get('/tasks/:id', async (req, res) => {
    const pk = req.params.id
    if (!pk) {
        return res.status(400).send("You must send a primary key")
    }
    const tasksInstance = await Tasks.findByPk(pk)
    if (!tasksInstance) {
        return res.status(404).send("Resource not found")
    }
    try {
        return res.status(200).json(tasksInstance)
    } catch (error) {
        console.error(error)
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})

//update view
router.put("/tasks/:id", async (req, res) => {
    const pk = req.params.id
    if (!pk) {
        return res.status(404).send("Resource not found")
    }
    try {
        const taskInstance = await Tasks.findByPk(pk)
        const { title, description } = req.body
        if (!title && !description) {
            return res.status(400).send("You must send a title and description")
        }
        taskInstance.Title = title
        taskInstance.Description = description
        await taskInstance.save()
    } catch (error) {
        console.error(error)
        return res.status(500).send("INTERNAL SERVER ERROR")
    }
})

//set complete task view
router.put("/tasks/complete/:id", async (req, res) => {
    const pk = req.params.id
    if (!pk) {
        return res.status(400).send("You must need to send a valid PK")
    }
    try {
        const taskInstance = await Tasks.findByPk(pk)
        if (!taskInstance) {
            return res.status(404).send("Resource not found!")
        }
        taskInstance.Completed = true
        await taskInstance.save()
        return res.status(200).send("Task Completed succesfully!")
    } catch (error) {
        console.error(error)
        return res.status(500).send("INTERNAL SERVER ERROR")
    }
})

module.exports = router
