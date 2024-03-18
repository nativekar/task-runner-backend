const express = require("express");
const router = express.Router();
const screenshots = require("./routes/screenshot");
const logs = require("./routes/logs");
const video = require("./routes/video");
const app = express();
const port = 3000;

app.use("/screenshots", screenshots);
app.use("/logs", logs);
app.use("/video", video);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
