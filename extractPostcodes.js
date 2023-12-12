const reserves = require("./wildlife-trust-reserves.json");
const fs = require("fs");
let postcodes = [];

reserves.forEach((reserve) => {
    let postcode = reserve.split(", ")[1];
    postcodes.push(postcode);
});

fs.appendFile(
    "extractedPostcodes.json",
    JSON.stringify(postcodes),
    function (err) {
        if (err) throw err;
        console.log("data written to json file");
    }
);
