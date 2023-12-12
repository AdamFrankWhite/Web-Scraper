const puppeteer = require("puppeteer");
var fs = require("fs");
async function scrapeLinks() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // results array
    const results = [];
    // Navigate to website and loop through pagination
    // for (let i = 0; i < 110; i++) {
    for (let i = 110; i < 120; i++) {
        await page.goto(
            "https://www.wildlifetrusts.org/nature-reserves?selector=.js-view-dom-id-de2e7ebe65dedc64ec1fe4855ece5f343aa673a6736ec2b88144bb688705fce4&page=" +
                i
        ),
            { timeout: 0 };

        // Use page.evaluate to fetch links and return them
        const pageLinks = await page.evaluate(() => {
            const anchorElements =
                document.querySelectorAll(`a[rel="bookmark"]`);
            const linksArray = [];
            anchorElements.forEach((anchor) => {
                linksArray.push(anchor.href);
            });
            return linksArray;
        });
        console.log(pageLinks);
        // Loop through the links
        for (const link of pageLinks) {
            console.log(link);

            // Open a new page for each nature reserve link
            const newPage = await browser.newPage();

            // Navigate to the link
            await newPage.goto(link, { timeout: 0 });

            // fetch data from new page
            const childNodes = await newPage.evaluate(() => {
                // get reserve name
                let reserveName = "";
                if (document.querySelector(`h1`)) {
                    reserveName = document
                        .querySelector("h1")
                        .textContent.replace("\n", "");
                }

                // grab the reserve name and address info
                let postcode = "";
                if (document.querySelector(`[itemprop="postalCode"]`)) {
                    postcode = document.querySelector(`[itemprop="postalCode"]`)
                        .childNodes[0].textContent;
                }

                // if successful with name and postcode, return reserve name and postcode
                if (reserveName && postcode) {
                    return reserveName + ", " + postcode;
                } else {
                    return null;
                }
            });

            // if successful, push item to the results along with link
            if (childNodes) results.push(childNodes + ", " + link);

            // Close the new page
            await newPage.close();
        }
    }

    console.log(results);
    // write output to json file
    fs.appendFile(
        "wildlife-trust-reserves.json",
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
