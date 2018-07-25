// const fetch = require('node-fetch').default
const cache = {}

exports.default = async function mockedFetch(url) {
  require('fs').appendFileSync('./test.txt', url + '\n')
  if (!cache[url]) {
    // const res = await fetch(url)
    // cache[url] = await res.json()
    cache[url] = []
  }
  return {
    json: () => Promise.resolve(cache[url]),
  }
}
