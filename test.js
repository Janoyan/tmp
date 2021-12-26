const _shuffle = require('lodash/shuffle');
const bluebird = require('bluebird');
const fetch = require('node-fetch');
let records = _shuffle(require('./data/records.json'));

const servers = [
  'https://idc-images.herokuapp.com/',
  'https://idc-images-2.herokuapp.com/',
  'https://idc-images-3.herokuapp.com/',
  'https://idc-images-4.herokuapp.com/',
  'https://idc-images-5.herokuapp.com/'
];

let count = 0;
let failed = 0;

async function oneCycle(serverUrl) {
    const record = records.pop();
    if (record.phrase.length > 10) {
      oneCycle(serverUrl);
      return;
    }

    const startTime = Date.now();
    const result = await fetch(serverUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phrase: record.phrase
      })
    }).then(res => res.json());

    const time = (Date.now() - startTime) / 1000;

    if (result.success) {
      console.log(`[${serverUrl}] ${++count}) ${record.phrase} - ${result.data['200x200']} ${time} sec`);
    } else {
      console.log(`${failed} ===> Failed phrase: ${record.phrase}`);
      failed+=1;
    }

    if (time > 1) {
      await bluebird.delay(1000);
    }

    oneCycle(serverUrl);
}


servers.forEach((s) => {
  oneCycle(s);
})
