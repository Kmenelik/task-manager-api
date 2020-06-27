const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required:true,
        trim:true
    }, 
    completed: {
        type: Boolean,
        default:false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    }
},{
    timestamps:true
}) 

taskSchema.pre('save', async function (next) {
    const task = this
    if (task.isModified('completed')) {
        console.log('alterou estado')
    }
    next()
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task

//module.exports =  mongoose.model('Task', taskSchema)
