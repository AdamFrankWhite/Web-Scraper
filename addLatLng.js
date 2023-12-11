const data = require("./natureReserves.json");
const latLngs = require("./latLngs.json");
const fs = require("fs");
let reserves = data;

latLngs.forEach((item) => {
    // find matching reserve for latlng data
    let reserve = reserves.filter(
        (reserve) => reserve.split(", ")[1] == item.postcode
    )[0];
    // find matching reserve index
    let reserveIndex = reserves.indexOf(reserve);
    // update reserve entry with lat and lng
    reserves[reserveIndex] += ", " + item.latitude + ", " + item.longitude;
});

// write updated reserve data with lat/lng to file
fs.writeFile(
    "nature-reserves-v2.json",
    JSON.stringify(reserves),
    function (err) {
        if (err) throw err;
        console.log("data written to json file");
    }
);
