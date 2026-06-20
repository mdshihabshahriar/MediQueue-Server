// const dns = require("node:dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
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

const JWKS = createRemoteJWKSet(
  new URL("http://localhost:3000/api/auth/jwks")
)

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if(!authHeader)
    {
        return res.status(401).json({ message : "Unauthorized" })
    }
    const token = authHeader.split(" ")[1]
    if(!token)
    {
      return res.status(401).json({ message : "Unauthorized" })
    }
 
    try{
      const {payload} = await jwtVerify(token, JWKS)
      console.log(payload)
      next()
    }
    catch(error){
        return res.status(403).json({message: "Forbidden"})
    }
}

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

    app.get("/my-tutors", async (req, res) => {
      try {
        const { userId } = req.query;

        const result = await tutorCollection
          .find({ createdBy: userId })
          .toArray();

        res.json(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get('/featured', async (req, res) => {
        const result = await tutorCollection.find().limit(6).toArray();
        res.json(result)
    })

    app.get('/tutors/:id', verifyToken, async (req, res) => {
       const {id} = req.params
       const result = await tutorCollection.findOne({_id: new ObjectId(id)})

       res.json(result)
    })

    app.get("/my-bookings", async (req, res) => {
        const { userId } = req.query;

        const result = await bookingCollection
          .find({ userId })
          .toArray();

        res.json(result);
    });

    app.post('/tutors', async (req, res) => {
        const tutorData = req.body
        // console.log(tutorData)
        const result = await tutorCollection.insertOne(tutorData)

        res.json(result)
    })

   app.post("/bookings", verifyToken, async (req, res) => {
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

    app.patch("/tutors/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = req.body;

        const filter = { _id: new ObjectId(id) };

        const updateDoc = {
          $set: {
            tutorName: updateData.tutorName,
            subjects: updateData.subjects,
            availability: updateData.availability,
            totalSlot: updateData.totalSlot,
            hourlyFee: updateData.hourlyFee,
            sessionDate: updateData.sessionDate,
          },
        };

        const result = await tutorCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Tutor not found" });
        }

        const updatedTutor = await tutorCollection.findOne(filter);

        res.json(updatedTutor);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.delete("/bookings/:id", verifyToken, async (req, res) => {
          const { id } = req.params;

          const booking = await bookingCollection.findOne({
            _id: new ObjectId(id),
          });

          await tutorCollection.updateOne(
            {
              _id: new ObjectId(booking.tutorId),
            },
            {
              $inc: {
                totalSlot: 1,
              },
            }
          );

          await bookingCollection.deleteOne({
            _id: new ObjectId(id),
          });

          res.json({
            success: true,
            message: "Booking cancelled successfully",
          });
      });

    app.delete("/tutors/:id", async (req, res) => {
      try {
        const { id } = req.params;

        const result = await tutorCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            message: "Tutor not found",
          });
        }

        res.json({
          success: true,
          message: "Tutor deleted successfully",
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
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