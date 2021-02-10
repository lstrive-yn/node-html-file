Simple encapsulation uses Puppeteer to convert HTML to files.

Added headless browser cache and page cache.

Use simple task queues to improve the conversion request performance and the ability to merge

## install

    npm install node-html-file --save
    yarn add node-html-file --save
## Usage

The initial creation instance ensures that the browser and page are not completely cached

    const TransformToTile = require("node-html-file");

    // create transform instance and  pass the number of pages  parameters，4 by default;
    const transform = new TransformToTile(4)

start to transform:

    const html = "<div>this is test html content<div>"

    // will add to tasks queue，and will consumer queue until no task added

    transform.transformToFile({
        html,
        type: "jpeg", // png
        path: "./transform.jpeg",
        isBuffer: true,
        callback: (buffer) => {
            console.log("transform file finished")
        }
    })