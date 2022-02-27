const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const port = 5000

// use middleware and parse data
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://apartment:sai1eFqglF3FEUoL@cluster0.vxcvn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
// const uri = `mongodb+srv://apartment:sai1eFqglF3FEUoL@cluster0.swu9d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// 
async function run() {
    try {
      await client.connect();
      const database = client.db("apartment");
      const scheduleCollection = database.collection("schedule");
      const usersCollection = database.collection("user");

    // collect data from body and create post api to insert data for schedule
    app.post('/schedules', async (req, res) => {
        const schedule = req.body;
        const result = await scheduleCollection.insertOne(schedule);
        // console.log(result);
        res.json(result)
    })
    
    // fetch data
    app.get('/schedules', async (req, res) => {
        const email = req.query.email;
        const query = {email: email}
        console.log(query)
        const cursor = scheduleCollection.find(query);
        const schedules = await cursor.toArray();
        res.json(schedules);
    })

    // insert data for user it'll called from useFirebase under userRegistration function
    app.post('/users', async (req, res) => {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    // console.log(result);
    res.json(result)
    })

    // this api'll call under the usingGoogleSignin function, if user are new try to login then insert data if exists just he'll login
    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });

    // add role when admin will make someone admin
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: {role: 'admin'} };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
  });
  
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})