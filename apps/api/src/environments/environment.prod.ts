import { DEFAULT_HOST, DEFAULT_PORT } from '@dexfolio/common/config';

export const environment = {
  production: true,
  rootUrl: `http://${DEFAULT_HOST}:${DEFAULT_PORT}`,
  version: `${require('../../../../package.json').version}`
};
