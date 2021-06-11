const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const ObjectId=require('mongodb').ObjectId
require('dotenv').config();


const app = express()
const port = 4500
app.use(cors())
app.use(express.json())
app.use(express.static('doctors'));
app.use(fileUpload());





const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wxd1m.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("doctrosProtal").collection("data");
  const doctorCollection = client.db("doctrosProtal").collection("doctor");

  app.post('/addAppoinment',(req,res)=>{
      const infoData=req.body
      collection.insertOne(infoData)
      .then(result=>{
          res.send(result.insertedCount > 0);
      })
  })
  app.post('/appoinmentsBuydate',(req,res)=>{
    const date=req.body
    const email=req.body.email
    doctorCollection.find({email:email.email})
    .toArray((error,doctors)=>{
      const filter={date:date.time}
      if (doctors.length === 0) {
        filter.email=email
      }
      collection.find(filter)
      .toArray((error,document)=>{
        res.send(document)
      })
    })
    
    
  })

  app.post('/addDoctor',(req,res)=>{
    const file=req.files.file

    const name=req.body.name
    const email=req.body.email

    file.mv(`${__dirname}/doctors/${file.name}`,error=>{
      if (error) {
        console.log(error);
        return res.status(500).send({mess:'Image file not uplooded....'})
      }
      return res.send({name:file.name,path:`/${file.name}`})
    })
    doctorCollection.insertOne({name,email,file:file.name})
    .then(result=>{
      res.send(result.insertedCount > 0);
    })
  })

  app.get('/doctor', (req, res) => {
    doctorCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})
  
app.listen(process.env.PORT || port)