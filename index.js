const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "200mb" }));

//env file
dotenv.config();
const PORT = process.env.PORT || 3001;
const MONGOURL = process.env.MONGO_URL;

//connect mongodb server
const client = new MongoClient(MONGOURL);

// app.use(bodyParser.json({ limit: "50mb", extended: true }));
// app.use(
//   bodyParser.urlencoded({
//     limit: "50mb",
//     extended: true,
//     parameterLimit: 50000,
//   })
// );
app.use(express.json());

const insertData = async (id, part, content, path, pos) => {
  const database = client.db("DataBase");
  const insertContent = database.collection("data"); // i don't know why i cant call it outside

  //I dont know how to do it more cleaner so my code so dirty. But it works
  //handle which data will insert to which array
  switch (part) {
    case "story":
      insertContent.updateOne(
        { _id: 1 },
        {
          $push: {
            data: {
              $each: [{ _id: id, content: content, img: path }],
              $position: pos,
            },
          },
        }
      );
      break;
    case "description":
      insertContent.updateOne(
        { _id: 2 },
        {
          $push: {
            data: {
              $each: [{ _id: id, content: content, img: path }],
              $position: pos,
            },
          },
        }
      );
      break;
    case "character":
      insertContent.updateOne(
        { _id: 3 },
        {
          $push: {
            data: {
              $each: [{ _id: id, content: content, img: path }],
              $position: pos,
            },
          },
        }
      );
      break;
    case "guild":
      insertContent.updateOne(
        { _id: 4 },
        {
          $push: {
            data: {
              $each: [{ _id: id, content: content, img: path }],
              $position: pos,
            },
          },
        }
      );
      break;
  }
};

app.post("/upload", async (req, res) => {
  const newObjectId = new ObjectId();
  insertData(
    newObjectId,
    req.body.part,
    req.body.content,
    req.body.image,
    Number(req.body.position) - 1 //convert string to number
  ).catch(console.dir);
  console.log("done");
});

app.get("/getdata/:id", async (req, res) => {
  const reqId = req.params.id;

  const database = client.db("DataBase");
  const content = database.collection("data");

  const userData = await content.find({ _id: parseInt(reqId) });

  if ((await content.countDocuments()) === 0) {
    console.log("No documents found!");
  }
  // // Print returned documents
  let data = {};

  for await (const doc of userData) {
    data = doc;
  }
  res.send(data);
});

app.get("/getdetail/:partId/:id", async (req, res) => {
  const database = client.db("DataBase");
  const content = database.collection("data");
  const reqPartId = req.params.partId;
  const reqId = req.params.id;

  const matchData = await content.aggregate([
    { $match: { _id: parseInt(reqPartId) } },
    { $unwind: "$data" },
    { $match: { "data._id": new ObjectId(reqId) } },
  ]);
  let data = {};

  for await (const doc of matchData) {
    data = doc;
  }

  res.send(data);
});

//DELETE

app.delete("/delete", async (req, res) => {
  const database = client.db("DataBase");
  const deleteContent = database.collection("data");
  // const part = req.body.part;
  // const string = toString(req.body.part) + "." + toString(req.body.pos);

  await deleteContent.updateOne({ _id: 1 }, { $unset: { "description.0": 1 } });
  await deleteContent.updateOne({ _id: 1 }, { $pull: { description: null } });
  console.log("done");
});

// EDIT

// app.put("/update", async (req, res) => {
//   const database = client.db("DataBase");
//   const updateContent = database.collection("data");

//   await updateContent.updateOne(
//     { _id: 1 },
//     {
//       $set: { "character.1": { content: "hello mop[", img: "img" } },
//     }
//   );
// });

app.listen(PORT, function (err) {
  if (err) console.log("Error in server setup");
  console.log("Server listening on Port", PORT);
});
