import Application from '../application';

export function resourcerSelectorMiddleware(app: Application) {
  return async (ctx, next) => {
    const datasources = ctx.app.dataSourceManager.dataSources.values();

    for (const datasource of datasources) {
      const resourcer = datasource.getResourcer();

      const params = resourcer.parseRequestFromRequest(ctx);
      if (params) {
        // request should handle by this resourcer
        const restMiddleware = resourcer.restApiMiddleware();
        await restMiddleware(ctx, next);
        return;
      }
    }

    await next();
  };
}
