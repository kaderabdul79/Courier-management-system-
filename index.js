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
      const userCollection = database.collection("user");

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
    const result = await userCollection.insertOne(user);
    // console.log(result);
    res.json(result)
    })
  
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})