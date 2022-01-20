// HttpsRequest

const https = require('https');

function sendNodeHttpsRequest(opts, callback) {

  const request = https.request(opts, response => {
    const data = [];

    response.on('data', (chunk) => {
      data.push(chunk);
    });

    response.on('end', () => {
      const parsedData = JSON.parse(Buffer.concat(data).toString());
      callback(parsedData);
    });

  });

  request.on('error', error => {
    console.error(error);
  });

  request.end();
};

exports.sendNodeHttpsRequest = sendNodeHttpsRequest;