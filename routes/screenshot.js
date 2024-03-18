var express = require("express");
var router = express.Router();
const { fetchDataInBatchesConcurrently } = require("../utils");

async function getScreenshotData(id, batch) {
	const TOTAL_SCREENSHOTS = 1000;
	const imageBatch = await fetchDataInBatchesConcurrently(
		id,
		TOTAL_SCREENSHOTS,
		batch ?? 10,
		"screenshot"
	);
	return imageBatch;
}

router.get("/", async (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");

	const id = req.query.id;
	const batch = parseInt(req.query.batch);

	if (!id) {
		res
			.status(400)
			.json({ error: "Invalid session id! Please provide a valid id" });
	}

	const screenshots = await getScreenshotData(id, batch);
	if (screenshots.length === 0) {
		res.status(404).json({ error: "No images found for this batch" });
	} else {
		res.status(200).json({
			message: "Images generated successfully",
			data: screenshots,
		});
	}
});

module.exports = router;
