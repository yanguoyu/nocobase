export function resourcerSelectorMiddleware(app) {
  return async (ctx, next) => {
    await next();
  };
}
