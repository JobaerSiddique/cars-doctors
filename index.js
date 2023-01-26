const express = require('express')
const cors = require('cors')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');
const SslCommerzPayment = require('sslcommerz');
const port = process.env.PORT || 5000;


// middlware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tksj5rf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri)
console.log('database Connected')

const serviceCollection = client.db('cars').collection("services")
const ordersCollection = client.db('cars').collection('orders')

async function run() {
    try {
      app.get('/services', async(req,res)=>{
        const query ={}
        const curser = serviceCollection.find(query)
        const result = await curser.toArray()
        res.send(result)
      })

      app.get('/services/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)}
        const find = await serviceCollection.findOne(query)
        res.send(find)
      })
      app.get('/orders', async(req,res)=>{
        const email = req.query.email;
        const filter = {email:email}
        const query = ordersCollection.find(filter)
        const result = await query.toArray()
        res.send(result)

      })

      // orders deletes 
      app.delete('/orders/:id', async(req,res)=>{
        const id= req.params.id
        const query = {_id: ObjectId(id)}
        const result = await ordersCollection.deleteOne(query)
        res.send(result)
      })
      app.get('/orders/:id', async(req,res)=>{
        const id= req.params.id
        const query = {_id: ObjectId(id)}
        const result = await ordersCollection.findOne(query)
        res.send(result)
      })
      app.post('/orders', async(req,res)=>{
        const query = req.body;
        const result= await ordersCollection.insertOne(query)
        res.send(result)

      })
      app.post('/init', (req, res) => {
        console.log('hitting')
        const productInfo = {
            total_amount: 100,
            currency: 'EUR',
            tran_id: 'REF123',
            success_url: 'http://localhost:5000/success',
            fail_url: 'http://localhost:5000/fail',
            cancel_url: 'http://localhost:5000/cancel',
            ipn_url: 'http://localhost:5000/ipn',
            shipping_method: 'Courier',
            product_name: 'Computer.',
            product_category: 'Electronic',
            product_profile: 'general',
            cus_name: req.body.cus_name,
            cus_email: 'cust@yahoo.com',
            cus_add1: 'Dhaka',
            cus_add2: 'Dhaka',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01711111111',
            cus_fax: '01711111111',
            ship_name: 'Customer Name',
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
            multi_card_name: 'mastercard',
            value_a: 'ref001_A',
            value_b: 'ref002_B',
            value_c: 'ref003_C',
            value_d: 'ref004_D'
        };
        const sslcommer = new SslCommerzPayment(process.env.STORE_ID, process.env.STORE_PASSWORD,false) //true for live default false for sandbox
        sslcommer.init(productInfo).then(data => {
          const info = { ...productInfo, ...data }
          if (info.GatewayPageURL) {
            res.json(info.GatewayPageURL)
        }
        else {
            return res.status(400).json({
                message: "SSL session was not successful"
            })
        }
        });
    })

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Welcome to Car Doctor')
})

app.listen(port, () => {
  console.log(`Car Doctors Listening ${port}`)
})