const express = require("express");
const lib = require("./model");
const app = express();
const cors = require("cors");

app.use(cors());
const bodyParser = require("body-parser");

app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

app.get("/test", (req, res) => {
  res.send({ status: "200", message: "hello! Test is a success" });
});

app.post("/handle", async (req, res) => {
  let value = await lib.parseAsString(req.body.data);
  value =
    JSON.stringify(value) === JSON.stringify({})
      ? { status: "204" }
      : value?.error
      ? { status: "206", value }
      : { status: "200", value };
  res.send(value);
});

app.listen(PORT, (req, res) => {
  console.log("Listening to the port 8080", PORT);
});
