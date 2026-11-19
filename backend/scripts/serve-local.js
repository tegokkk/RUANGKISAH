import { createApplication } from '../src/app.js';
if (process.env.NODE_ENV === 'production')
  throw new Error('Gunakan npm start dengan konfigurasi produksi.');
const port = Number(process.env.PORT || 4000);
const service = await createApplication({
  publicUrl: 'http://localhost:' + port,
  serveFrontend: true,
});
const server = service.app.listen(port, '127.0.0.1', () =>
  console.log('RUANGKISAH tersedia di http://localhost:' + port),
);
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () =>
    server.close(async () => {
      await service.close();
      process.exit(0);
    }),
  );
}
