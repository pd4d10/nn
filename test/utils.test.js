const { getDownloadUrl } = require('../lib/utils')

jest.mock('node-fetch')

describe('get download URL', () => {
  test('nodejs', async () => {
    expect(await getDownloadUrl('10.7.0')).toBe('https://nodejs.org/dist/v10.7.0/node-v10.7.0-linux-x64.tar.gz')
  })
  test('iojs', async () => {
    expect(await getDownloadUrl('3.3.1')).toBe('https://iojs.org/dist/v3.3.1/iojs-v3.3.1-linux-x64.tar.gz')
  })
  test('rc', async () => {
    expect(await getDownloadUrl('10.2.1-rc.1')).toBe('https://nodejs.org/download/rc/v10.2.1-rc.1/node-v10.2.1-rc.1-linux-x64.tar.gz')
  })
  test('nightly', async () => {
    expect(await getDownloadUrl('11.0.0-nightly201807245384570486')).toBe(
      'https://nodejs.org/download/nightly/v11.0.0-nightly201807245384570486/node-v11.0.0-nightly201807245384570486-linux-x64.tar.gz',
    )
  })
  test('v8-canary', async () => {
    expect(await getDownloadUrl('11.0.0-v8-canary201807247c08774a29')).toBe(
      'https://nodejs.org/download/v8-canary/v11.0.0-v8-canary201807247c08774a29/node-v11.0.0-v8-canary201807247c08774a29-linux-x64.tar.gz',
    )
  })

  test('only major', async () => {
    expect(await getDownloadUrl('10')).toBe('https://nodejs.org/dist/v10.7.0/node-v10.7.0-linux-x64.tar.gz')
  })
  test('only major and minor', async () => {
    expect(await getDownloadUrl('10.7')).toBe('https://nodejs.org/dist/v10.7.0/node-v10.7.0-linux-x64.tar.gz')
  })
  test('only major for iojs', async () => {
    expect(await getDownloadUrl('3')).toBe('https://iojs.org/dist/v3.3.1/iojs-v3.3.1-linux-x64.tar.gz')
  })
  test('only major and minor for iojs', async () => {
    expect(await getDownloadUrl('3.3')).toBe('https://iojs.org/dist/v3.3.1/iojs-v3.3.1-linux-x64.tar.gz')
  })

  test('latest', async () => {
    expect(await getDownloadUrl('latest')).toBe('https://nodejs.org/dist/v10.7.0/node-v10.7.0-linux-x64.tar.gz')
  })
  test('latest nodejs', async () => {
    expect(await getDownloadUrl('nodejs')).toBe('https://nodejs.org/dist/v10.7.0/node-v10.7.0-linux-x64.tar.gz')
  })
  test('latest iojs', async () => {
    expect(await getDownloadUrl('iojs')).toBe('https://iojs.org/dist/v3.3.1/iojs-v3.3.1-linux-x64.tar.gz')
  })
  test('latest rc', async () => {
    expect(await getDownloadUrl('rc')).toBe('https://nodejs.org/download/rc/v10.2.1-rc.1/node-v10.2.1-rc.1-linux-x64.tar.gz')
  })
  test('latest nightly', async () => {
    expect(await getDownloadUrl('nightly')).toBe(
      'https://nodejs.org/download/nightly/v11.0.0-nightly201807245384570486/node-v11.0.0-nightly201807245384570486-linux-x64.tar.gz',
    )
  })
  test('latest v8-canary', async () => {
    expect(await getDownloadUrl('v8-canary')).toBe(
      'https://nodejs.org/download/v8-canary/v11.0.0-v8-canary201807247c08774a29/node-v11.0.0-v8-canary201807247c08774a29-linux-x64.tar.gz',
    )
  })

  // test('different mirror of nodejs', () => {
  //   expect(getDownloadUrl('11.0.0-v8-canary201807140f69779e03')).toBe(
  //     'https://nodejs.org/download/v8-canary/v11.0.0-v8-canary201807140f69779e03/node-v11.0.0-v8-canary201807140f69779e03-linux-x64.tar.gz',
  //   )
  // })
  // test('different mirror of node-chakracore', () => {
  //   expect(getDownloadUrl('10.6.0')).toBe('https://nodejs.org/download/chakracore-release/v10.6.0/node-v10.6.0-linux-x64.tar.gz')
  //   expect(getDownloadUrl('11.0.0-nightly201807248c628de0f6')).toBe(
  //     'https://nodejs.org/download/chakracore-nightly/v11.0.0-nightly201807248c628de0f6/node-v11.0.0-nightly201807248c628de0f6-linux-x64.tar.gz',
  //   )
  // })
  // test('custom mirror', async () => {
  //   const url = await getDownloadUrl('10.7.0', 'taobao')
  //   expect(url).toBe('https://npm.taobao.org/mirrors/node/v10.7.0/node-v10.7.0-linux-x64.tar.gz')
  // })
  // test('mirror fallback to default', () => {
  //   const spy = jest.spyOn(global.console, 'warn')
  //   expect(getDownloadUrl('3.3.1', 'tsinghua')).toBe('https://iojs.org/dist/v3.3.1/iojs-v3.3.1-linux-x64.tar.gz')
  //   expect(spy).toBeCalled()
  // })
  // test('invalid mirror', () => {
  //   const spy = jest.spyOn(global.console, 'warn')
  //   expect(getDownloadUrl('10.7.0', 'unknown')).toBe('https://nodejs.org/dist/v10.7.0/node-v10.7.0-linux-x64.tar.gz')
  //   expect(spy).toBeCalled()
  // })
})
