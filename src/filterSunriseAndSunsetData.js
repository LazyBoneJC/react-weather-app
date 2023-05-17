// const fs = require("fs");
import fs from "fs";

// 載入從氣象局下載的日出日落檔 A-B0062-001.json
const fileContent = fs.readFileSync("A-B0062-001.json", "utf-8");
const dataset = JSON.parse(fileContent);
// console.log(dataset);

const locations = dataset.cwbopendata.dataset.location;
const nowTimeStamp = new Date("2023-05-09").getTime(); // 今天的 timestamp

const newData = locations.map((location) => {
  const time = location.time
    .filter((time) => new Date(time.Date).getTime() > nowTimeStamp)
    .map((time) => {
      const sunrise = time.SunRiseTime;
      const sunset = time.SunSetTime;
      return {
        dataTime: time.Date,
        sunrise,
        sunset,
      };
    });
  return {
    locationName: location.CountyName,
    time,
  };
});

fs.writeFile("sunrise-sunset.json", JSON.stringify(newData, null, 2), (err) => {
  if (err) throw err;
  console.log("The file has been saved.");
});
