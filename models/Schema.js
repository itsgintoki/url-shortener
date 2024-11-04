const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({
    OriginalURL:{
        type:String,
        required:true,
        trim:true,
        validate:{
            validator: (v) => /^https?:\/\/\S+$/.test(v),
            message: 'Invalid URL format'
        }
    },
    shortCode:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    createdAt:{
        type:Date,
        default:Date.now()

    },
    expirationDate:{
        type:Date,
        default:null

    },
    clickCount:{
        type:Number,
        default:0

    }

})

module.exports = mongoose.model('Url',UserSchema)