const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const admin = require("firebase-admin");
const { MongoClient } = require('mongodb');
const fileupload = require('express-fileupload')
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000

// use middleware and parse data
app.use(cors());
app.use(express.json());
app.use(fileupload());

// apartment-firebase-adminsdk.json

const serviceAccount = require('./apartment-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vxcvn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
// const uri = `mongodb+srv://apartment:sai1eFqglF3FEUoL@cluster0.swu9d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];

      try {
          const decodedUser = await admin.auth().verifyIdToken(token);
          req.decodedEmail = decodedUser.email;
      }
      catch {

      }

  }
  next();
}

// 
async function run() {
    try {
      await client.connect();
      const database = client.db("apartment");
      const scheduleCollection = database.collection("schedule");
      const usersCollection = database.collection("user");
      const contactInfoCollection = database.collection("contactInfo");
      const apartmentInfoCollection = database.collection("apartmentInfo");

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
        // console.log(query)
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
    app.put('/users/admin', verifyToken, async (req, res) => {
      const user = req.body;
      // console.log(req.headers.authorization)
      const requester = req.decodedEmail;
      if (requester) {
          const requesterAccount = await usersCollection.findOne({ email: requester });
          if (requesterAccount.role === 'admin') {
              const filter = { email: user.email };
              const updateDoc = { $set: { role: 'admin' } };
              const result = await usersCollection.updateOne(filter, updateDoc);
              res.json(result);
          }
      }
      else {
          res.status(403).json({ message: 'you do not have access to make admin' })
      }
  });
 
  //     
  app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
          isAdmin = true;
        }
        res.json({admin: isAdmin});
  });

  // contacts Info post
  app.post('/contacts', async (req, res) => {
    const contacts = req.body;
    const result = await contactInfoCollection.insertOne(contacts);
    console.log(result);
    res.json(result)
})

// insert apartments Info
app.post('/apartments', async (req, res) => {
  // const apartment = req.body;
  // const image = req.files;
  const description = req.body.description;
  const title = req.body.title;
  const subtextarea = req.body.subtextarea;
  const image = req.files.image;
  const imageData = image.data;
  const encodedimage = imageData.toString('base64');
  const imageBuffer = Buffer.from(encodedimage, 'base64');
  const apartment = {
      title,
      description,
      subtextarea,
      image: imageBuffer
  }
  const result = await apartmentInfoCollection.insertOne(apartment);
  res.json(result);
})

  // fetch all apartments data
  app.get('/apartments', async (req, res) => {
    const cursor = apartmentInfoCollection.find({});
    const apartments = await cursor.toArray();
    res.send(apartments);
  })
  // get a single apartment data 
  app.get('/apartments/:id', async (req, res) => {
    const id = req.params.id;
    // console.log(id)
    const query = { _id: ObjectId(id) };
    const apartment = await apartmentInfoCollection.findOne(query);
    res.send(apartment);
  });


    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

// 
app.get('/', (req, res) => {
  res.send("Alright the backend apartment server");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})