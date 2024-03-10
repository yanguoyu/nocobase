import { createMockServer } from '@nocobase/test';

export default async function createApp() {
  const app = await createMockServer({
    plugins: ['nocobase', 'collection-sql'],
  });
  return app;
}
