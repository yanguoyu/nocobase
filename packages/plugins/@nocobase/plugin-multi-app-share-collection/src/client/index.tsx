import { Plugin } from '@nocobase/client';
import { MultiAppShareCollectionProvider } from './MultiAppShareCollectionProvider';

export class PluginMultiAppShareCollectionClient extends Plugin {
  async load() {
    this.app.use(MultiAppShareCollectionProvider);
  }
}

export default PluginMultiAppShareCollectionClient;
