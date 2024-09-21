const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();
app.use(cors());
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

const insertData = async (part, content, path, pos) => {
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
            story: { $each: [{ content: content, img: path }], $position: pos },
          },
        }
      );
      break;
    case "description":
      insertContent.updateOne(
        { _id: 1 },
        {
          $push: {
            description: {
              $each: [{ content: content, img: path }],
              $position: pos,
            },
          },
        }
      );
      break;
    case "character":
      insertContent.updateOne(
        { _id: 1 },
        {
          $push: {
            character: {
              $each: [{ content: content, img: path }],
              $position: pos,
            },
          },
        }
      );
      break;
    case "guild":
      insertContent.updateOne(
        { _id: 1 },
        {
          $push: {
            guild: { $each: [{ content: content, img: path }], $position: pos },
          },
        }
      );
      break;
  }
};

app.post("/upload", async (req, res) => {
  insertData(
    req.body.part,
    req.body.content,
    req.body.image,
    Number(req.body.position) - 1 //convert string to number
  ).catch(console.dir);
  console.log("done");
});

app.get("/getdata", async (req, res) => {
  const database = client.db("DataBase");
  const content = database.collection("data");

  const userData = await content.find({});
  if ((await content.countDocuments()) === 0) {
    console.log("No documents found!");
  }
  // Print returned documents
  let data = {};

  for await (const doc of userData) {
    data = doc;
  }

  res.send(data);
});

//DELETE

// app.delete("/delete", async (req, res) => {
//   const database = client.db("DataBase");
//   const deleteContent = database.collection("data");
//   const part = req.body.part;
//   const string = toString(req.body.part) + "." + toString(req.body.pos);

//   await deleteContent.updateOne({ _id: 1 }, { $unset: { string: 1 } });
//   await deleteContent.updateOne({ _id: 1 }, { $pull: { part: null } });
// });

//EDIT

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
