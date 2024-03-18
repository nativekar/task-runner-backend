var express = require("express");
var router = express.Router();
const { fetchDataInBatchesConcurrently } = require("../utils");

async function getLogData(id, batch) {
	const TOTAL_LOGS = 500;
	const logBatch = await fetchDataInBatchesConcurrently(
		id,
		TOTAL_LOGS,
		batch ?? 5,
		"log"
	);
	return logBatch;
}

router.get("/", async (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");

	const id = req.query.id;
	const batch = req.query.batch;

	if (!id) {
		res
			.status(400)
			.json({ error: "Invalid session id! Please provide a valid id" });
	}

	const logs = await getLogData(id, batch);
	if (logs?.length === 0) {
		res.status(404).json({ error: "No logs found for this batch" });
	} else {
		res.status(200).json({
			message: "Logs generated successfully",
			data: logs,
		});
	}
});

module.exports = router;
