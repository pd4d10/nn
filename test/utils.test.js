const os = require('os')
const path = require('path')
const { ensureArchCorrect, getNodeDirByMeta, getMetaByNodeDir, systemArch } = require('../lib/utils')

describe('get arch', () => {
  test('not specified fallback to system', () => {
    expect(ensureArchCorrect()).toBe(systemArch)
  })

  test('unknown arch fallback to system', () => {
    const spy = jest.spyOn(global.console, 'warn')
    expect(ensureArchCorrect('unknown')).toBe(systemArch)
    expect(spy).toBeCalled()
  })

  // test('warn if arch != system arch and not windows', () => {
  //   // const typeMock = jest.spyOn(require('os'), 'type')
  //   // typeMock.mockImplementation(() => 'Windows_NT')
  //   // const spy = jest.spyOn(global.console, 'warn')
  //   // expect(ensureArchCorrect('x86')).toBe('x86')
  //   // expect(spy).not.toBeCalled()
  //   // jest.unmock('os')

  //   expect(ensureArchCorrect('x86')).toBe('x86')
  //   // expect(spy).toBeCalled()
  // })
})

describe('get node dir by meta', () => {
  const home = os.homedir() + '/.nn'
  test('full version', () => {
    expect(getNodeDirByMeta('v10.7.0', false, 'x64')).toBe(path.resolve(home, 'node', 'v10.7.0-x64'))
  })
  test('no leading v', () => {
    expect(getNodeDirByMeta('10.7.0', false, 'x64')).toBe(path.resolve(home, 'node', 'v10.7.0-x64'))
  })
})

describe('get meta by node dir', () => {
  const home = os.homedir() + '/.nn'
  test('node', () => {
    expect(getMetaByNodeDir(home + '/node/v10.7.0-x64')).toEqual({ version: 'v10.7.0', arch: 'x64', isChakraCore: false })
  })
  test('chakracore', () => {
    expect(getMetaByNodeDir(home + '/chakracore/v10.6.0-x64')).toEqual({ version: 'v10.6.0', arch: 'x64', isChakraCore: true })
  })
})
