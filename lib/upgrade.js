const fetch = require('node-fetch').default

async function upgrade() {
  // Resolve latest version and replace ~/.nvmx/bin/nvmx
  const res = await fetch(
    `https://developer.github.com/v3/repos/pd4d10/nvmx/releases`,
  )
  const json = await res.json()
  console.log(json)
}

module.exports = {
  upgrade,
}
