// const express = require('express');
// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const app = express();
// const port = 3000;
// app.use(express.json({ limit: '50mb', extended: true }));
// app.get('/', (req, res) => {
//   res.send('Server is running!');
// });

// app.post("/generate-pdf", async (req, res) => {
//   const { kitcode } = req.body; // Get kitcode from the request body
//   const dates = Date.now();
//   console.log(req.body);
//   try {
//     // const url = "https://spacegutlatest.web.app/" + kitcode; // Target URL
//     const url = "https://spacegutlatest.web.app/SGDEMO"; // Target URL

//     // Launch Puppeteer
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         '--no-sandbox', // Disable sandboxing (required for Heroku)
//         '--disable-setuid-sandbox', // Further disables privilege escalation
//         '--disable-dev-shm-usage', // Avoids shared memory issues
//         '--headless', // Run Chrome in headless mode
//         '--disable-gpu', // Disable GPU (not necessary for headless mode)
//       ],
//     });

//     // Introduce a delay (if needed)
//     await new Promise((resolve) => setTimeout(resolve, 20000));

//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "networkidle2" });

//     // Generate PDF as a Buffer
//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       margin: { top: 0, right: 0, bottom: 0, left: 0 }, // Remove margins
//     });

//     const tempFilePath = `${kitcode}-microbiome-analysis-report-${dates}.pdf`;

//     await fs.writeFileSync(tempFilePath, pdfBuffer);

//     // const FormData = require("form-data");
//     // const data = new FormData();
//     // data.append("slug", "microbiome-analysis-report");
//     // // data.append("file", pdfBuffer, { filename: "report.pdf", contentType: "application/pdf" });
//     // data.append('file', fs.createReadStream(tempFilePath));        // Axios configuration for the upload
//     // const config = {
//     //     method: "post",
//     //     maxBodyLength: Infinity,
//     //     url: https://api-staging.enbiosis.com/v1/kits/${kitcode}/uploadReport,
//     //     headers: {
//     //         ...data.getHeaders(), 
//     //         "Authorization": Bearer ${token2222},
//     //     },
//     //     data: data,
//     // };

//     // await axios.request(config)
//     //     .then((response) => {
//     //         res.status(200).json(response.data);
//     //     })
//     //     .catch((error) => {
//     //         res.status(500).json(error);
//     //     });

//     // fs.unlinkSync(tempFilePath);

//     await browser.close();

//   } catch (error) {
//     console.error("Error generating or uploading PDF:", error.message);
//     res.status(500).json({
//       error: "Failed to generate or upload PDF.",
//       details: error,
//     });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is listening on port ${port}`);
// });


const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb', extended: true }));

// Ensure Puppeteer cache directory exists
const puppeteerCacheDir = '/app/.cache/puppeteer';
if (!fs.existsSync(puppeteerCacheDir)) {
  fs.mkdirSync(puppeteerCacheDir, { recursive: true });
}

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/generate-pdf', async (req, res) => {
  const { kitcode } = req.body; // Get kitcode from the request body
  const dates = Date.now();
  console.log(req.body);

  try {
    // Define target URL
    const url = `https://spacegutlatest.web.app/${kitcode || 'SGDEMO'}`;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', // Disable sandboxing (required for Railway)
        '--disable-setuid-sandbox', // Further disables privilege escalation
        '--disable-dev-shm-usage', // Avoids shared memory issues
      ],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Generate PDF as a Buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }, // Remove margins
    });

    const tempFilePath = path.join(
      __dirname,
      `${kitcode || 'report'}-microbiome-analysis-report-${dates}.pdf`
    );

    // Write PDF to the filesystem
    fs.writeFileSync(tempFilePath, pdfBuffer);

    // Send the PDF back to the client
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${kitcode || 'report'}-microbiome-analysis-report-${dates}.pdf"`,
    });
    res.send(pdfBuffer);

    // Optional: Cleanup temporary file after sending response
    fs.unlink(tempFilePath, (err) => {
      if (err) console.error('Error deleting temporary file:', err.message);
    });

    await browser.close();
  } catch (error) {
    console.error('Error generating or uploading PDF:', error.message);
    res.status(500).json({
      error: 'Failed to generate or upload PDF.',
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
