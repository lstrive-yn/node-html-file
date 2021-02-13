使用puppeteer，简单封装html转文件的功能；缓存浏览器以及多页面，减少每次转换初始化无头浏览器的性能开销，加快转换效率；模拟简单队列，利用缓存的多页面，保证任务的页面分配，来高效完成转换任务；

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
    // 创建转换实例，并且传递需要缓存的页面数量，根据实际并发情况缓存，不考虑并发缓存一个页面即可；默认情况下会缓存四个页面
    const transform = new TransformToTile(4)

start to transform:

    const html = "<div>this is test html content<div>"

    // will add to tasks queue，and will consumer queue until no task added
    // path是转存服务器本地的路径；
    transform.transformToFile({
        html,
        type: "jpeg", // png/pdf
        path: "./transform.jpeg",
        isBuffer: true,
        callback: (buffer) => {
            console.log("transform file finished")
        }
    })