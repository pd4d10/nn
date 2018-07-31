const mirrorMapper = {
  default: {
    node: 'https://nodejs.org/dist',
    iojs: 'https://iojs.org/dist',
    rc: 'https://nodejs.org/download/rc',
    nightly: 'https://nodejs.org/download/nightly',
    'v8-canary': 'https://nodejs.org/download/v8-canary',
    chakracore: 'https://nodejs.org/download/chakracore-release',
    'chakracore-rc': 'https://nodejs.org/download/chakracore-rc',
    'chakracore-nightly': 'https://nodejs.org/download/chakracore-nightly',
  },
  taobao: {
    node: 'https://npm.taobao.org/mirrors/node',
    iojs: 'https://npm.taobao.org/mirrors/iojs',
    rc: 'https://npm.taobao.org/mirrors/node-rc',
    nightly: 'https://npm.taobao.org/mirrors/node-nightly',
    // https://github.com/cnpm/cnpmjs.org/issues/1364
    // chakracore: 'https://npm.taobao.org/mirrors/node-chakracore',
  },
  tsinghua: {
    node: 'https://mirrors.tuna.tsinghua.edu.cn/nodejs-release',
  },
}

module.exports = {
  mirrorMapper,
}
