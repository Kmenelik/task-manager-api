const express = require('express')
const multer = require('multer')

const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')


const router = new express.Router()

router.post('/users', async (req,res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user:user.getPublicProfile(), token:token})

    } catch (error) {
        res.status(400).send(error)
    }    
})

router.post('/user/login', async (req,res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({user:user.getPublicProfile(), token: token})
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter( (token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()

    }catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()

    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000

    },
    fileFilter(req,file,cb) {
        //if (file.originalname.match(/\.(jpg|jpeg|png)$/))
        if (! (file.originalname.endsWith('.jpg'))  || (file.originalname.endsWith('.jpeg')) 
                || (file.originalname.endsWith('.png'))  )  {
                    return cb(new Error('Please upload a JPG, JPEG or PNG image'))
        }
        cb(undefined,true)

    }
})

router.post('/users/me/avatar',auth, upload.single('avatar'), async (req,res) => {

    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next) => {
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar ) {
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)

    }catch (e) {
        res.status(400).send()
    }
})

router.get('/users/me', auth ,async (req,res) => {
    res.send({user: req.user.getPublicProfile()})
})

// router.get('/users/:id', async (req,res) => {
//     const _id = req.params.id
  
//     try {
//         const user = await  User.findById(_id)
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.status(201).send({user: user.getPublicProfile()})
//     } catch (e) {
//         res.status(500).send(e)

//     }
// })

router.patch('/users/me',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']

    const isValidOperation = updates.every( (update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {
       
        updates.forEach( (update) => {
            req.user[update] = req.body[update]

        })
        await  req.user.save()
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        // if (!user) {
        //     return res.status(404).send()
        // }
        res.send({user:req.user.getPublicProfile()})

    } catch (e) {
        res.status(400).send()

    }

})

router.delete('/users/me', auth, async (req,res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        await user.remove()
        res.send(req.user.getPublicProfile())

    } catch (e) {
        res.status(500).send()

    }
})

module.exports = router