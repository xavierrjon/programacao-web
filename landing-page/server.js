const express = require("express");
const path = require("path");
const config = require("./config");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.listen(config.port, () => {
  console.log(`Server is running on port https://localhost:${config.port}`);
});
