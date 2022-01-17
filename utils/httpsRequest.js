// HttpsRequest

const https = require('https');

function httpsGet(options, res) {
  https.get(options, (response) => {
    let dat = [];

    response.on('data', chunk => {
      dat.push(chunk);
    });

    response.on('end', () => {
      const data = JSON.parse(Buffer.concat(dat).toString())
      data ? console.log(data.metadata) : console.log(data);
      res.json({ data });
    });

  }).on('error', (err) => {
    console.log('ERR!', err.message);
  });
};

exports.httpsGet = httpsGet;