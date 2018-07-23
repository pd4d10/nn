const { getMirrorUrl, mirrorMapper } = require('../lib/utils')

const nodejsVersions = [
  '10',
  '8',
  '4',
  '0',
  '10.7',
  '8.9',
  '4.0',
  '0.12',
  '10.7.0',
  '8.9.4',
  '4.0.0',
  '0.12.18',
]
const iojsVersions = ['3', '1', '3.3', '1.0', '3.3.1', '1.0.0']
const rcVersion = ['v10.0.0-rc.1']
const nightlyVersion = ['v10.0.0-nightly2017110118df171307']

describe('get mirror URL', () => {
  test('nodejs', () => {
    nodejsVersions.forEach(version => {
      expect(getMirrorUrl(version)).toBe(mirrorMapper.default.nodejs)
    })
  })
  test('iojs', () => {
    iojsVersions.forEach(version => {
      expect(getMirrorUrl(version)).toBe(mirrorMapper.default.iojs)
    })
  })
  test('rc', () => {
    rcVersion.forEach(version => {
      expect(getMirrorUrl(version)).toBe(mirrorMapper.default.rc)
    })
  })
  test('nightly', () => {
    nightlyVersion.forEach(version => {
      expect(getMirrorUrl(version)).toBe(mirrorMapper.default.nightly)
    })
  })
  test('custom mirror', () => {
    expect(getMirrorUrl('10', 'taobao')).toBe(mirrorMapper.taobao.nodejs)
  })
  test('mirror fallback to default', () => {
    expect(getMirrorUrl('3', 'tsinghua')).toBe(mirrorMapper.default.iojs)
  })
  test('invalid mirror', () => {
    const spy = jest.spyOn(global.console, 'warn')
    expect(getMirrorUrl('10', 'unknown')).toBe(mirrorMapper.default.nodejs)
    expect(spy).toBeCalled()
  })
  test('chakracore', () => {
    expect(getMirrorUrl('10', undefined, true)).toBe(
      mirrorMapper.default.chakracore,
    )
  })
  test('chakracore nightly', () => {
    expect(
      getMirrorUrl('v10.0.0-nightly201712053a6b048fb5', undefined, true),
    ).toBe(mirrorMapper.default.chakracore_nightly)
  })
})
