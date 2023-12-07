const puppeteer = require("puppeteer");

async function scrapeLinks() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const linksArray = [];
    // results array
    const results = [];
    // Navigate to a website
    for (let i = 0; i < 2; i++) {
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

        // Concatenate pageLinks with linksArray
        //linksArray.push(...pageLinks);

        // Loop through the links
        for (const link of pageLinks) {
            console.log(link);
            // You can perform any actions with each link here

            // Open a new page for each link
            const newPage = await browser.newPage();

            // Navigate to the link
            await newPage.goto(link);

            // Perform actions with child nodes on the new page
            const childNodes = await newPage.evaluate(() => {
                // grab the adjacent text content of the address pictogram

                // Note: This part is commented out for now as it may not work directly
                // You can adjust this part based on your actual HTML structure
                const addressPictogram =
                    document.getElementsByClassName("contact")[2].textContent;
                // return addressPictogram;
                // const contactNode = addressPictogram.parentNode;
                const addressString = addressPictogram.split(", ");
                const reserveName = addressString[0];
                const postcode = addressString.slice(-1)[0];
                return reserveName + ": " + postcode;
            });

            // Push the results to the array
            results.push(childNodes);

            // Close the new page
            await newPage.close();
        }
    }

    console.log(results);
    // Close the browser
    await browser.close();
}

// Run the function
scrapeLinks();
