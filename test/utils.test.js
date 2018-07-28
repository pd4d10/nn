const { getMirrorAndVersion } = require('../lib/utils')

jest.mock('node-fetch')

describe('get download URL', () => {
  test('nodejs', async () => {
    const { mirror, version } = await getMirrorAndVersion('10.7.0')
    expect(mirror).toBe('https://nodejs.org/dist')
    expect(version).toBe('v10.7.0')
  })
  test('iojs', async () => {
    const { mirror, version } = await getMirrorAndVersion('3.3.1')
    expect(mirror).toBe('https://iojs.org/dist')
    expect(version).toBe('v3.3.1')
  })
  test('rc', async () => {
    const { mirror, version } = await getMirrorAndVersion('10.2.1-rc.1')
    expect(mirror).toBe('https://nodejs.org/download/rc')
    expect(version).toBe('v10.2.1-rc.1')
  })
  test('nightly', async () => {
    const { mirror, version } = await getMirrorAndVersion('11.0.0-nightly201807245384570486')
    expect(mirror).toBe('https://nodejs.org/download/nightly')
    expect(version).toBe('v11.0.0-nightly201807245384570486')
  })
  test('v8-canary', async () => {
    const { mirror, version } = await getMirrorAndVersion('11.0.0-v8-canary201807247c08774a29')
    expect(mirror).toBe('https://nodejs.org/download/v8-canary')
    expect(version).toBe('v11.0.0-v8-canary201807247c08774a29')
  })

  test('only major', async () => {
    const { mirror, version } = await getMirrorAndVersion('10')
    expect(mirror).toBe('https://nodejs.org/dist')
    expect(version).toBe('v10.7.0')
  })
  test('only major and minor', async () => {
    const { mirror, version } = await getMirrorAndVersion('10.7')
    expect(mirror).toBe('https://nodejs.org/dist')
    expect(version).toBe('v10.7.0')
  })
  test('only major for iojs', async () => {
    const { mirror, version } = await getMirrorAndVersion('3')
    expect(mirror).toBe('https://iojs.org/dist')
    expect(version).toBe('v3.3.1')
  })
  test('only major and minor for iojs', async () => {
    const { mirror, version } = await getMirrorAndVersion('3.3')
    expect(mirror).toBe('https://iojs.org/dist')
    expect(version).toBe('v3.3.1')
  })

  test('latest', async () => {
    const { mirror, version } = await getMirrorAndVersion('latest')
    expect(mirror).toBe('https://nodejs.org/dist')
    expect(version).toBe('v10.7.0')
  })
  test('latest nodejs', async () => {
    const { mirror, version } = await getMirrorAndVersion('node')
    expect(mirror).toBe('https://nodejs.org/dist')
    expect(version).toBe('v10.7.0')
  })
  test('latest lts', async () => {
    const { mirror, version } = await getMirrorAndVersion('lts')
    expect(mirror).toBe('https://nodejs.org/dist')
    expect(version).toBe('v8.11.3')
  })
  test('latest iojs', async () => {
    const { mirror, version } = await getMirrorAndVersion('iojs')
    expect(mirror).toBe('https://iojs.org/dist')
    expect(version).toBe('v3.3.1')
  })
  test('latest rc', async () => {
    const { mirror, version } = await getMirrorAndVersion('rc')
    expect(mirror).toBe('https://nodejs.org/download/rc')
    expect(version).toBe('v10.2.1-rc.1')
  })
  test('latest nightly', async () => {
    const { mirror, version } = await getMirrorAndVersion('nightly')
    expect(mirror).toBe('https://nodejs.org/download/nightly')
    expect(version).toBe('v11.0.0-nightly201807245384570486')
  })
  test('latest v8-canary', async () => {
    const { mirror, version } = await getMirrorAndVersion('v8-canary')
    expect(mirror).toBe('https://nodejs.org/download/v8-canary')
    expect(version).toBe('v11.0.0-v8-canary201807247c08774a29')
  })

  test('node-chakracore', async () => {
    const { mirror, version } = await getMirrorAndVersion('chakracore-node')
    expect(mirror).toBe('https://nodejs.org/download/chakracore-release')
    expect(version).toBe('v10.6.0')
  })
  test('node-chakracore', async () => {
    const { mirror, version } = await getMirrorAndVersion('cc-node')
    expect(mirror).toBe('https://nodejs.org/download/chakracore-release')
    expect(version).toBe('v10.6.0')
  })
  test('node-chakracore rc', async () => {
    const { mirror, version } = await getMirrorAndVersion('cc-rc')
    expect(mirror).toBe('https://nodejs.org/download/chakracore-rc')
    expect(version).toBe('v10.1.0-rc.0')
  })
  test('node-chakracore nightly', async () => {
    const { mirror, version } = await getMirrorAndVersion('cc-nightly')
    expect(mirror).toBe('https://nodejs.org/download/chakracore-nightly')
    expect(version).toBe('v11.0.0-nightly2018072567ec50df9e')
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
