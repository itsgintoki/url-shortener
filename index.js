const express = require('express')
const dotenv = require('dotenv').config()
const mongoose = require('mongoose')
const urlRoutes = require('./routes/UrlRoutes')
const bodyParser = require('body-parser')
const port = process.env.PORT||8080
const app = express()

app.use(bodyParser.json());


mongoose.connect(process.env.MONGO_URI,)
.then(()=>console.log('MongoDB connected'))
.catch(err=>console.log(err))

app.use('/', urlRoutes); 



app.listen(port,()=>{
    console.log(`Server listening on ${port}`);
    
})
