const puppeteer = require("puppeteer");
var fs = require("fs");
async function scrapeLinks() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // results array
    const results = [];
    // Navigate to website and loop through pagination
    for (let i = 0; i < 20; i++) {
        await page.goto("https://www.rspb.org.uk/days-out/reserves?page=" + i);

        // Use page.evaluate to fetch links and return them
        const pageLinks = await page.evaluate((query) => {
            const anchorElements = document.querySelectorAll(
                `a[href*="${query}"]`
            );
            const linksArray = [];
            anchorElements.forEach((anchor) => {
                linksArray.push(anchor.href);
            });
            return linksArray;
        }, "/days-out/reserves/");

        // Loop through the links
        for (const link of pageLinks) {
            console.log(link);

            // Open a new page for each nature reserve link
            const newPage = await browser.newPage();

            // Navigate to the link
            await newPage.goto(link);

            // fetch data from new page
            const childNodes = await newPage.evaluate(() => {
                // grab the reserve name and address info
                const reserveName =
                    document.getElementsByTagName("h1")[0].textContent;
                const addressPictogram =
                    document.querySelector("[name=address]").parentNode
                        .textContent;
                //tidy address data
                const addressString = addressPictogram.split(", ");
                const postcode = addressString.slice(-1)[0].trimEnd();
                // return reserve name and postcode
                return reserveName + ", " + postcode;
            });

            // Push the array to the results along with link
            results.push(childNodes + ", " + link);

            // Close the new page
            await newPage.close();
        }
    }

    console.log(results);
    // write output to json file
    fs.writeFile(
        "nature-reserves.json",
        JSON.stringify(results),
        function (err) {
            if (err) throw err;
            console.log("data written to json file");
        }
    );
    // Close the browser
    await browser.close();
}

// Run the function
scrapeLinks();
