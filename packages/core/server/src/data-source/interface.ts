import { Resourcer } from '@nocobase/resourcer';
import { ACL } from '@nocobase/acl';
import { CollectionOptions } from './collection-interface';

export interface DataSourceInterface {
  getCollections(): Array<CollectionOptions>;

  getResourcer(): Resourcer;

  getACL(): ACL;
}
