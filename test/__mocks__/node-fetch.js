const fs = require('fs-extra')
const path = require('path')

exports.default = async function mockedFetch(url) {
  return {
    json() {
      const filePath = path.resolve(__dirname, url.replace(/^https?:\/\//, ''))
      // require('fs').writeFileSync('./test.txt', filePath + '\n')
      return fs.readJson(filePath)
    },
  }
}
