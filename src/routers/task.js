const express = require('express')
const Task = require('../models/task')
const User = require('../models/user')
const { update } = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()


router.post('/tasks', auth, async (req,res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body, 
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch(e)  {
        res.status(400).send(e)
    }
})
//GET /tasks?completed=false ou true
// GET /tasks?limit=10&skip=10 - paginação 
// GET /tasks?sortBy=createdAt_asc

router.get('/tasks/', auth, async (req,res) => {

    const match = {}
    const sort = {}

    if (req.query.completed)  {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1: 1
    }

    try {        
        const tasks = await Task.find({owner: req.user._id})
       // const muser = await User.findById(req.user._id)
    
        await req.user.populate({
            path: 'userstasks',
            match,
            //match: match
            options: {
                limit:parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }

        }).execPopulate()
        console.log(req.user.userstasks)

        res.send(req.user.userstasks)
    } catch(e) {
        res.status(500).send(e) 
        console.log(e)
    } 
 })
 

router.get('/tasks/:tid', auth, async (req, res) => {
    const _tid = req.params.tid

    try {
        const task = await Task.findOne({_id:_tid, owner: req.user._id })
        
        if (!task) {
            return res.status(404).send()
        }
        res.status(201).send(task)

    } catch(e)  {
        res.status(500).send(e)
    }
})



router.delete('/tasks/:id', auth, async (req,res) => {
    try {
    //    const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOne({_id:req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(400).send()
        }
        await task.remove()
        res.send(task)

    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id',auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every( (update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
      
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        
       // const task = await Task.findById(req.params.id)
       const task = await Task.findOne({_id:req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
       })
        await task.save()
        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

module.exports = router
