const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pmhdc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const partCollection = client.db('connectors').collection('parts');
        const reviewCollection = client.db('connectors').collection('reviews');
        const orderCollection = client.db('connectors').collection('orders');
        const userCollection = client.db('connectors').collection('users');

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        //load all parts
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        })

        //load all reviews
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        //load single part details
        app.get("/parts/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const part = await partCollection.findOne(query);
            res.send(part);
        });

        //accumulate all orders
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        //load orders placed by specific user
        app.get('/order', async (req, res) => {
            const customer = req.query.customer;
            const query = { customer: customer };
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);
        })


    }
    finally {

    }


}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hey connectors people!')
})

app.listen(port, () => {
    console.log(`connectors is listening on port ${port}`)
})
