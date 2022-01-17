// XMLHttpRequest using Promise
// Can handle GET and POST requests with json data.

// TODO: Add support for additional methods and data types.

function sendXMLHttpRequest({ method='GET', url, headers, data, resType }) {

  const promise = new Promise((resolve, reject) => {
    const requester = new XMLHttpRequest();
    requester.open(method, url);

    if (headers) headers.forEach(header => {
      requester.setRequestHeader(header.name, header.value);
    });

    if (method === 'POST') requester.setRequestHeader('Content-Type', data.type);

    if (resType) requester.responseType = resType;

    // Set up the listener.
    requester.onload = () => {
      // Handle errors of the API. Reject the promise, but forward the API's response.
      if (requester.status >= 400) {
        reject(requester.response);
      } else {
        resolve(requester.response);
      };
    };

    // Handle errors of the XMLHttpRequest (e.g. target API could not be reached), NOT of the API.
    requester.onerror = () => {
      reject('XMLHttpRequest failed successfully: API could not be reached.');
    };

    if (!data) {
      requester.send();
    } else if (data.type === 'application/json') {
      requester.send(JSON.stringify(data.value));
    } else {
      requester.send(data);
    };

  });

  return promise;
};

exports.sendXMLHttpRequest = sendXMLHttpRequest;