// @ts-check
const Bluebird = require('bluebird');
const Fsp = require('fs/promises');
const fetch = require('node-fetch').default;

const run = async () => {
  let i = 1;
  const result = await Bluebird.map(
    Array.from({ length: 2579 }, (_, idx) => idx + 1),
    async (idx) => {
      try {
        const res = await fetch(`https://xkcd.com/${idx}/info.0.json`);
        const json = await res.json();
        console.log(`${i++} / 2579`);
        return [idx, json];
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    { concurrency: 20 },
  );

  const result2 = result.reduce((acc, [idx, json]) => {
    if (!json) {
      return acc;
    }
    acc[idx] = json;
    return acc;
  }, {});

  const result3 = {
    lastUpdatedAt: new Date().toISOString(),
    data: result2,
  };

  await Fsp.writeFile(
    `${__dirname}/src/commands/xkcd.cache.json`,
    JSON.stringify(result3),
    'utf-8',
  );
  await Fsp.writeFile(
    `${__dirname}/dist/src/commands/xkcd.cache.json`,
    JSON.stringify(result3),
    'utf-8',
  );
};

run();
