const {MongoClient, ObjectID} = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'


MongoClient.connect(connectionURL, { useNewUrlParser: true}, (error, client) => {
    if (error) {
        return console.log('unable to connect to database!')
    }

    const db = client.db(databaseName)

    // // db.collection('users').findOne({_id: new ObjectID("5eef35d3701f7872c8d8cb1e")}, (error, user) => {
    // //     if (error) {
    // //         return console.log('error')
    // //     }
    // //     console.log(user)

    // // } )


    // // db.collection('users').find({ age: 48 }).toArray((error, users) => {
    // //     console.log(users)
    // // })

    // // db.collection('users').find({ age: 48 }).count((error, count) => {
    // //     console.log(count)
    // // })

    // // db.collection('tasks').findOne( {_id: new ObjectID("5eef374fed0155734d9914fa")},(error, user) => {
    // //     if (error) {
    // //         return console.log('error')
    // //     }
    // //     console.log(user)

    // // } )

    // db.collection('tasks').find({completed: false}).toArray((error, tasksNC) => {
    //     console.log(tasksNC)
    // })

    // db.collection('users').updateOne({
    //     _id: new ObjectID("5eef35d3701f7872c8d8cb1e")
    // },{
    //    $inc: {
    //        age: 1
    //    } 
    // } ).then( (result) => {
    //     console.log(result)

    // }).catch( (error) => {
    //     console.log(error)
    // })

   // update 
    // db.collection('tasks').updateMany({
    //     completed: false
    // }, {
    //   $set: {
    //       completed: true
    //   }  
    // }).then( (result) => {
    //     console.log(result.modifiedCount)
    // } ).catch( (error) => {
    //     console.log(error)

    // })

    // db.collection('users').insertMany([
    //     {
    //         name: 'titio',
    //         age: 88
    //     }, 
    //     {
    //         name: 'dinha',
    //         age: 88
    //     }
    // ])

    // db.collection('users').deleteMany({
    //     age: 88
    // }).then((result) => {
    //     console.log(result)

    // }).catch((error) => {  
    //     console.log(error) 

    // })

    db.collection('tasks').deleteOne({
        description: "Lavar pratos"
    }).then((result ) => {
        console.log(result)
    }).catch((error) => {
        console.log(error)
    })

})

