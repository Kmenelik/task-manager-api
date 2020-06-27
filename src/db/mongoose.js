const mongoose = require('mongoose')

mongoose.connect(process.env.CONNECTION_DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})







