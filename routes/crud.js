const express = require('express')
const { Sequelize } = require('sequelize')
const app = express()
const router = express.Router()

//model instance
const Tasks = require('../database/models')
//db connection
const DB = "crud"

app.use(express.json())

//get tasks
router.get("/tasks", async (_req, res) => {
    try {
        // const data = await sequelize.query(`SELECT * FROM ${TABLE};`)
        const data = await Tasks.findAll()
        if (data) {
            return res.status(200).json(data)
        }
    } catch (error) {
        return res.status(500).send("INTERNAL SERVER ERROR")
    }
})

//post task
router.post("/tasks", async (req, res) => {
    try {
        const data = req.body
        console.log(data)
        const taskInstance = await Tasks.create({ Title: data.title, Description: data.description })
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
router.patch("/tasks/:id", async(req, res) => {
    const pk = req.params.id
    if(!pk){
        return res.status(404).send("Resource not found")
    }
    try{
        const taskInstance = await Tasks.findByPk(pk)
        const {title, description} = req.body
        if(!title && !description){
            return res.status(400).send("You must send a title and description")
        }
        if (title !== null) {
            taskInstance.Title = title
        }
        if (description !== null) {
            taskInstance.Description = description
        }
        await taskInstance.save()
    } catch (error){
        console.error(error)
        return res.status(500).send("INTERNAL SERVER ERROR")
    }
})

module.exports = router
