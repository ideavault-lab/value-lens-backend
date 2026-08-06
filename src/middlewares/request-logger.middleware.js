export async function requestLogger(app) {

  app.addHook("onRequest", async (request) => {
    request.log.info({
      method: request.method,
      url: request.url,
    });
  });
}