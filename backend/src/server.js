import { createApplication } from './app.js';

const service = await createApplication();
const server = service.app.listen(service.config.port, service.config.host, () => {
  console.log('RUANGKISAH API aktif di port ' + service.config.port);
});
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () =>
    server.close(async () => {
      await service.close();
      process.exit(0);
    }),
  );
}
