const globalScreenshotCache = {};
const globalLogCache = {};
const globalVideoCache = {};

/**
 *
 * @param {*} id - unique id for the session
 * @param {*} total - total number of logs or screenshots
 * @param {*} batch - batch size/no of concurrent requests
 * @param {*} type - type of data to fetch {screenshots, logs, video}
 * @returns
 */
async function fetchDataInBatchesConcurrently(id, total, batch, type) {
  if (existsInCache(id, type)) {
    console.log("no");
    return lookUpCache(id, type);
  }
  let urls = [];
  let i = 0;
  while (i < total) {
    urls.push({ offset: i, limit: batch });
    i += batch;
  }
  const response = await Promise.allSettled(
    urls.map((url) =>
      type === "screenshot"
        ? mockScreenshotData(url.offset, url.limit)
        : type === "log"
        ? mockLogData(url.offset, url.limit, type)
        : null
    )
  );
  // some promises might fail (although in this case, they won't), but we only want to return the successful ones
  const filteredResponse = response.filter(
    (result) => result.status === "fulfilled" && result.value !== null
  );
  const data = filteredResponse.map((batch) => batch.value);
  const flat = data.flat();
  updateCache(id, type, flat);
  console.log("after update", globalScreenshotCache, globalLogCache);
  return flat;
}

/**
 *
 * @param {*} offset
 * @param {*} limit
 * @returns an array of objects with a dummy timestamp and a screenshot property
 */
function mockScreenshotData(offset, limit) {
  const screenshotsArray = [];
  return new Promise((resolve, reject) => {
    for (let i = offset; i < offset + limit; i++) {
      const obj = {
        timestamp: i,
        screenshot: `screenshot-${i}`,
      };
      screenshotsArray.push(obj);
    }
    resolve(screenshotsArray);
  });
}

/**
 *
 * @param {*} offset
 * @param {*} limit
 * @returns an array of objects with a dummy timestamp and a log property
 */
function mockLogData(offset, limit) {
  const logsArray = [];
  return new Promise((resolve, reject) => {
    for (let i = offset; i < offset + limit; i++) {
      const obj = {
        timestamp: i,
        log: `log-${i}`,
      };
      logsArray.push(obj);
    }
    resolve(logsArray);
  });
}

/**
 *
 * @param {*} id
 * @param {*} batch
 * @returns collection of logs and screenshots that appear at the same time frame
 */
function generateMockVideoData(id, batch) {
  //Todo: Currently batch is 1, meaning this just one process. Can look at handling batch processing.
  console.log(batch);

  const type = "video";
  if (existsInCache(id, type)) {
    return lookUpCache(id, type);
  }

  const screenshotsArray = globalScreenshotCache[id];
  const logsArray = globalLogCache[id];

  console.log(screenshotsArray);
  console.log(logsArray);

  if (screenshotsArray?.length === 0 || logsArray?.length === 0) {
    return [];
  }

  const videos = [];
  const screenMap = new Map();
  let currentScreen;

  for (const screen of screenshotsArray) {
    screenMap.set(screen.timeStamp, screen);
  }

  for (const log of logsArray) {
    const logTimestamp = log.timeStamp;
    currentScreen = screenMap.get(logTimestamp);

    if (currentScreen) {
      if (
        !videos.find(
          (v) =>
            v.timestamp === logTimestamp &&
            v.screenshot === currentScreen.screenshot
        )
      ) {
        videos.push({
          timestamp: logTimestamp,
          screenshot: currentScreen.screenshot,
          log: log.log,
        });
      }
    }
  }

  videos.sort((a, b) => a.timestamp - b.timestamp);

  return videos;
}

/**
 *
 * @param {*} id
 * @param {*} type
 * @param {*} data
 * @returns null - is used to update the global cache
 */
function updateCache(id, type, data) {
  if (type === "screenshot") {
    console.log("setting screenshot cache");
    globalScreenshotCache[id] = data;
  } else if (type === "log") {
    console.log("setting log cache");
    globalLogCache[id] = data;
  } else if (type === "video") {
    globalVideoCache[id] = data;
  }
}

/**
 *
 * @param {*} id
 * @param {*} type
 * @returns the data from the global cache corresponding to the id and type
 */
function lookUpCache(id, type) {
  if (type === "screenshot") {
    return globalScreenshotCache[id];
  } else if (type === "log") {
    return globalLogCache[id];
  } else if (type === "video") {
    return globalVideoCache[id];
  }
}

/**
 *
 * @param {*} id
 * @param {*} type
 * @returns boolean - checks if the data exists in the global cache
 */
function existsInCache(id, type) {
  return type === "screenshot"
    ? globalScreenshotCache[id]
    : type === "log"
    ? globalLogCache[id]
    : globalVideoCache[id];
}

module.exports = {
  mockScreenshotData,
  mockLogData,
  fetchDataInBatchesConcurrently,
  generateMockVideoData,
};
