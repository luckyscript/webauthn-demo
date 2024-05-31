import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo) => {
  return {
    // use for cookie sign key, should change to your own and keep security
    keys: appInfo.name + '_1716359378627_8033',
    egg: {
      port: 7001,
    },
    view: {
      mapping: {
        '.ejs': 'ejs',
      },
    },
    typeorm: {
      dataSource: {
        default: {
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: 'root',
          database: 'passkey_demo',
          logging: false,
          entities: ['entity'],
        },
      },
    },
    webauthn: {
      rp: {
        name: 'passkey-demo',
        id: 'localhost',
      },
      origin: 'http://localhost:7001',
      timeout: 90000,
    },
    // security: {
    //   csrf: false,
    // },
  } as MidwayConfig;
};
