// HttpsRequest

const https = require('https');

function httpsGet(options, res) {
  https.get(options, (response) => {
    let dat = [];

    response.on('data', chunk => {
      dat.push(chunk);
    });

    response.on('end', () => {
      res.json({ data: JSON.parse(Buffer.concat(dat).toString()) });
    });

  }).on('error', (err) => {
    console.log('ERR!', err.message);
  });
};

exports.httpsGet = httpsGet;