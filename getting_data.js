let fs = require('fs');
let request = require('request');

request(
  { url : "https://api.coindesk.com/v1/bpi/historical/close.json" },
  (error, response, body) => {
    fs.writeFile("test.json", response.body, function(err) {
      if (err) { console.log(err) }
    });
  }
);