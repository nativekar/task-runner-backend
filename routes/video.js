var express = require("express");
var router = express.Router();
const { generateMockVideoData } = require("../utils");

router.get("/", (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");

	const id = req.query.id;
	const batch = req.query.batch;

	if (!id) {
		res
			.status(400)
			.json({ error: "Invalid session id! Please provide a valid id" });
	}
	const videoArray = generateMockVideoData(id, batch, "video");
	if (videoArray?.length === 0) {
		res.status(404).json({ error: "No video data found" });
	}
	res.status(200);
	res.send(videoArray);
});

module.exports = router;
