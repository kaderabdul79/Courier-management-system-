const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const port = 5000


const uri = "mongodb+srv://apartment:sai1eFqglF3FEUoL@cluster0.vxcvn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})