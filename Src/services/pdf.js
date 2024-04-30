import pdf from "pdf-creator-node";
import fs from "fs";

import { options } from "./options.js";

export const createPdf = (data, htmlPath, fileName, req, res) => {
  // Read HTML file
  const html = fs.readFileSync(htmlPath, "utf8");

  // Create PDF document
  let document = {
    html: html,
    data: { data },
    path: `./${fileName}`,
  };
  pdf.create(document, options).then(() => {
    return res.send(
      `<a download href="${req.protocol}://${req.headers.host}/PDF/${fileName}">download</a>`
    );
  });
};
