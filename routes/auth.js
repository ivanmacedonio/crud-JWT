const express = require('express')
const app = express()
const router = express.Router()
const { User } = require('../database/models')

//auth management
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

//config
const dotenv = require('dotenv')
dotenv.config()

//middlewares
function verifyToken(req,res,next){
    const header = req.header("Authorization") || ""
    if(header === ""){
        return res.status(400).send("You must need to send a valid authorization header")
    }
    const token = header.split(" ")[1] //get the token from the header
    if(!token){
        return res.status(401).send("Token not provided")
    }
    try{
        const payload = jwt.verify(token, process.env.TOKEN_SECRET)
        req.username = payload.username
        next()
    } catch(error){
        console.error(error)
        return res.status(401).send("Not authorizated")
    }
}

//register view
router.post("/register", async (req, res, _next) => {
    const { username, password } = req.body
    console.log(username, password)
    if (!username || !password) {
        return res.status(400).send("You must need to send a valid username or password")
    }
    try {
        const userInstance = await User.create({ Username: username, Password: password })
        return res.status(201).send(`User created succesfully! Your token is ${token}`)
    } catch (error) {
        console.error(error)
        return res.status(500).send("INTERNAL SERVER ERROR")
    }
})

//login view
router.post("/login", async (req, res, _next) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).send("You must need to send a valid username or password")
    }
    try {
        const userInstance = await User.findOne({ where: { Username: username } })
        if (!userInstance) {
            return res.status(404).send("User not found")
        }
        const passwordIsValid = await bcrypt.compare(password, userInstance.Password)
        if(passwordIsValid){
            const token = jwt.sign({username}, process.env.TOKEN_SECRET, {expiresIn: "1h"})
            return res.status(200).send(token)
        }
        return res.status(400).send("Invalid password")
    } catch (error) {
        console.error(error)
        return res.status(500).send("INTERNAL SERVER ERROR")
    }
})

//delete account view
router.delete("/delete/:id", verifyToken, async (req, res, _next) => {
    const pk = req.params.id
    if (!pk) {
        return res.status(400).send("You must need to send a valid PK")
    }
    try {
        const userInstance = await User.findByPk(pk)
        if (!userInstance) {
            return res.status(404).send("User not found!")
        }
        await userInstance.destroy()
        return res.status(200).send("Account deleted succesfully!")
    } catch (error) {
        console.error(error)
        return res.status(500).send("INTERNAL SERVER ERROR")
    }
})

//secret generator view
const getSecret = () => {
    const secret  =crypto.randomBytes(64).toString("hex")
    console.log(`YOUR SECRET => ${secret}`)
}


module.exports = router