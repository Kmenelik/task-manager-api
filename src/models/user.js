const mongoose = require('mongoose')
const validator = require('validator')
const bycript = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sharp = require('sharp')

const Task = require('./task')


const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
        trim:true
    },
    password: {
        type: String,
        required: true,
        trim:true,
        minlength:7,
        validate(value) {           
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contains word password')
            }
        }
    },
    email: {
        type: String,
        unique:true,
        required: true,
        trim:true,
        lowercase:true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }

    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }

},{
    timestamps: true
})

userSchema.virtual('userstasks',{
    ref: 'Task',
    localField: '_id',
    foreignField : 'owner'
})



userSchema.methods.getPublicProfile =  function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar


    return userObject
}




//Instance method 
userSchema.methods.generateAuthToken = async function () {
    const user = this

    const token = jwt.sign({_id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token})
    await user.save()

    return token

}

//Static methos called on the model
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email: email})

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bycript.compare(password,user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//hash de password before saving 
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bycript.hash(user.password,8)

    }

    next()

})

//delete users tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({owner: user._id})

    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User

