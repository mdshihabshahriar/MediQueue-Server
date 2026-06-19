// const dns = require("node:dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()

const uri = process.env.MONGODB_URI;

const app = express()
const PORT = process.env.PORT;

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db("mediqueue")
    const tutorCollection = db.collection("tutors")
    const bookingCollection = db.collection("bookings")

    app.get('/tutors', async (req, res) => {
        const result = await tutorCollection.find().toArray();
        res.json(result)
    })

    app.get('/featured', async (req, res) => {
        const result = await tutorCollection.find().limit(6).toArray();
        res.json(result)
    })

    app.get('/tutors/:id', async (req, res) => {
       const {id} = req.params
       const result = await tutorCollection.findOne({_id: new ObjectId(id)})

       res.json(result)
    })

    app.post('/tutors', async (req, res) => {
        const tutorData = req.body
        console.log(tutorData)
        const result = await tutorCollection.insertOne(tutorData)

        res.json(result)
    })

   app.post("/bookings", async (req, res) => {
      try {
        const bookingData = req.body;

        const tutor = await tutorCollection.findOne({
          _id: new ObjectId(bookingData.tutorId),
        });

        if (!tutor) {
          return res.status(404).json({
            message: "Tutor not found",
          });
        }

        if (Number(tutor.totalSlot) <= 0) {
          return res.status(400).json({
            message: "No slots available",
          });
        }
        const existing = await bookingCollection.findOne({
          userId: bookingData.userId,
          tutorId: bookingData.tutorId,
        });

        if (existing) {
          return res.status(400).json({
            message: "You already booked this tutor",
          });
        }

        const bookingResult = await bookingCollection.insertOne(bookingData);

        await tutorCollection.updateOne(
          { _id: new ObjectId(bookingData.tutorId) },
          {
            $inc: {
              totalSlot: -1,
            },
          }
        );

        res.status(201).json({
          success: true,
          bookingId: bookingResult.insertedId,
          message: "Booking successful",
        });
      } catch (error) {
        console.log(error);

        res.status(500).json({
          message: "Server error",
        });
      }
    });
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Server is running fine!")
})

app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`)
})