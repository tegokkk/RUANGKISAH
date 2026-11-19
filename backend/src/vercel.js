import { createApplication } from './app.js';

export function createVercelHandler(factory = createApplication) {
  let application;
  return async (req, res) => {
    try {
      // Reuse one initialization and pool per warm instance, including concurrent requests.
      if (!application)
        application = factory({ serveFrontend: false, autoMigrate: false }).catch((error) => {
          application = undefined;
          throw error;
        });
      const service = await application;
      await new Promise((resolve, reject) => {
        const complete = () => {
          res.removeListener('finish', complete);
          res.removeListener('close', complete);
          resolve();
        };
        res.once('finish', complete);
        res.once('close', complete);
        try {
          service.app(req, res);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      const code = typeof error?.code === 'string' ? error.code : error?.name || 'INIT_ERROR';
      const safeHint =
        typeof error?.message === 'string' &&
        !/postgres(ql)?:\/\/|password|secret/i.test(error.message)
          ? error.message.slice(0, 140)
          : '';
      console.error(
        'RUANGKISAH API initialization failed [' + code + ']' + (safeHint ? ': ' + safeHint : ''),
      );
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ ok: false, message: 'Layanan belum siap. Coba sebentar lagi.' }));
    }
  };
}

export default createVercelHandler();
