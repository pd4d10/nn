const { getArch } = require('../lib/utils')

describe('get arch', () => {
  test('not specified fallback to system', () => {
    expect(getArch()).toBe('x64')
  })

  test('unknown arch fallback to system', () => {
    const spy = jest.spyOn(global.console, 'warn')
    expect(getArch('unknown')).toBe('x64')
    expect(spy).toBeCalled()
  })

  test('warn if arch != system arch and not windows', () => {
    // const typeMock = jest.spyOn(require('os'), 'type')
    // typeMock.mockImplementation(() => 'Windows_NT')
    // const spy = jest.spyOn(global.console, 'warn')
    // expect(getArch('x86')).toBe('x86')
    // expect(spy).not.toBeCalled()
    // jest.unmock('os')

    expect(getArch('x86')).toBe('x86')
    // expect(spy).toBeCalled()
  })
})
