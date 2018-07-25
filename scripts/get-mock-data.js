const fs = require('fs-extra')
const path = require('path')
const fetch = require('node-fetch').default
const { mirrorMapper } = require('../lib/utils')

Object.values(mirrorMapper).forEach(v => {
  Object.values(v).forEach(async url => {
    const res = await fetch(url + '/index.json')
    const filePath = path.resolve(
      __dirname,
      '../test/__mocks__',
      url.replace(/^https?:\/\//, ''),
      'index.json',
    )
    fs.ensureFileSync(filePath)
    const stream = fs.createWriteStream(filePath).on('finish', () => {
      console.log('Finish:', url)
    })
    res.body.pipe(stream)
  })
})
