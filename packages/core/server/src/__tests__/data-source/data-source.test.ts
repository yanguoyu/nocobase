import { mockServer, MockServer } from '@nocobase/test';
import { DataSourceInterface } from '../../data-source/interface';
import { CollectionOptions } from '../../data-source/collection-interface';
import { Resourcer } from '@nocobase/resourcer';
import { ACL } from '@nocobase/acl';

class TestDataSource implements DataSourceInterface {
  resourcer: Resourcer;
  acl: ACL;

  constructor() {
    this.resourcer = new Resourcer();
    this.acl = new ACL();
  }

  getCollections() {
    return [] as Array<CollectionOptions>;
  }

  getResourcer() {
    return this.resourcer;
  }

  getACL() {
    return this.acl;
  }
}

describe('dataSource', () => {
  let app: MockServer;
  afterEach(async () => {
    if (app) {
      await app.destroy();
    }
  });

  it('should add datasource into application', async () => {
    app = mockServer();

    const testDataSource = new TestDataSource();
    const testResourcer = new Resourcer({
      prefix: '/test-resourcer',
    });

    testResourcer.define({
      name: 'test',
      actions: {
        async list(ctx, next) {
          ctx.body = 'hello world';
          await next();
        },
      },
    });

    testDataSource.resourcer = testResourcer;

    app.dataSourceManager.add('test', testDataSource);

    await app.agent().get('/test-resourcer/test:list').expect(200).expect('hello world');
  });
});
