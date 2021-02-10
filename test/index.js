const HtmlTranToFile = require("../index")

const transform = new HtmlTranToFile(4);

setTimeout(() => {
  for(let i = 0; i < 2; i++) {
    transform.transformToFile({
      html: `<span>test${i}</span>`,
      type: "jpeg",
      path: `./transform${i}.jpeg`,
      callback: async (buffer) => {
        console.log("transform succeed", i, buffer);
      }
    })
  }

  for(let j=2; j<4; j++) {
    transform.transformToFile({
      html: `<span>test${j}</span>`,
      type: "pdf",
      path: `./transform${j}.pdf`,
      callback: async (buffer) => {
        console.log("transform succeed", j, buffer);
      }
    })
  }
}, 500)



