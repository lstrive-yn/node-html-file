const puppeteer = require("puppeteer");

const debounce = function (fn, duration) {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(null, arguments);
    }, duration)
  }
}

class HtmlTranToFile {
  constructor(pagesCount = 4) {
    let self = this;
    // add task to queue
    this.queue = [];
    // save page instances
    this.pages = [];

    this.defaultImgOptions = {
      type: "jpeg",
      quality: 50,
      fullPage: true,
      encoding: "binary"
    };
    this.defaultPdfOptions = {
      scale: 2,
      displayHeaderFooter: false,
      headerTemplate: "",
      footerTemplate: "",
      printBackground: true,
      pageRanges: "1-100",
      format: "A4"
    };

    // create page
    this.pagesCount = pagesCount;
    this.createPage(pagesCount);

    // page ready count
    this.pageReadyCount = 0;

    // consumer tasks queue with debounce
    this.deboundTransform = debounce(async function transform() {
      console.log("consumer", self.pages.length, self.queue.length);
      const { queue, pagesCount } = self;
      if (queue.length > 0) {
        let sliceTasks = queue.splice(-pagesCount);
        for (let i = 0; i < sliceTasks.length; i++) {
          if (sliceTasks[i].type === 'pdf') {
            self.transformToPdf(sliceTasks[i], i);
          } else {
            self.transformToImg(sliceTasks[i], i);
          }
        }
      }
    }, 50);
  }

  // create pages
  async createPage() {
    const pages = [];
    let count = 0;
    (async (self) => {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      while (count < self.pagesCount) {
        pages[count] = await browser.newPage()
        count++;
      }
      self.pages = pages;
      if (self.queue.length > 0) {
        self.deboundTransform()
      }
    })(this);
  }

  /**
   * @param {options}
   * html
   * type：pdf/jpeg|png
   */
  transformToFile(options) {
    console.log("add to queue");
    this.queue.push(options);
    if (this.pages.length > 0) {
      this.deboundTransform();
    }
  }

  // transform
  async transformToImg({ isBuffer, html, callback, ...options }, paegIndex) {
    try {
      const page = this.pages[paegIndex];
      // will not save to disk if path not provide
      if (isBuffer && options.path) {
        delete options.path;
      }

      await page.setViewport({
        // size A4 with pixel 72
        width: 796 / 2,
        height: 1118 / 2,
        deviceScaleFactor: 2,
      });

      await page.setContent(html);

      const imgBinary = await page.screenshot({
        ...this.defaultImgOptions,
        ...options
      });

      if (typeof callback !== 'function') {
        throw new Error("callback must be provided")
      } else {
        callback(imgBinary)
      }

      // if the slice tasks finished, re-consumer
      this.pageReadyCount += 1;
      if(this.pageReadyCount == this.pagesCount) {
        this.pageReadyCount = 0;
        this.deboundTransform();
      }
      return imgBinary;
    } catch (error) {
      throw new Error("trans-img-error:" + error)
    }
  }

  // transform to pdf file
  async transformToPdf({ isBuffer, html, callback, style, ...options }, pageIndex) {
    try {
      const page = this.pages[pageIndex];
      // will not save to disk if path not provide
      if (isBuffer && options.path) {
        delete options.path;
      }

      // 解决首页页眉也会显示的问题；
      await page.addStyleTag({
        content: style || `
          @page:first {
              margin-top: 0;
          }
          body {
              margin-top: 1cm;
          }
          @media print {
              h1 {page-break-before: always;}
          }
        `
      });

      await page.setContent(html);

      const pdfBuffer = await page.pdf({
        ...this.defaultPdfOptions,
        ...options
      });

      if (typeof callback !== 'function') {
        throw new Error("callback must be provided")
      } else {
        callback(pdfBuffer)
      }

      // if the slice tasks finished, re-consumer
      this.pageReadyCount += 1;
      if (this.pageReadyCount == this.pagesCount) {
        this.pageReadyCount = 0;
        this.deboundTransform();
      }

      return pdfBuffer;
    } catch (error) {
      throw new Error("trans-pdf-error:" + error)
    }
  }
}
module.exports = HtmlTranToFile;
