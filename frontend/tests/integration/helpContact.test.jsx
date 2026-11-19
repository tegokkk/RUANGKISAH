import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { appRoutes } from '@/app/router';
import { AppProviders } from '@/app/AppProviders';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
it('AT-10/11: kontak terkonfigurasi membuka O05; batal tidak membuka kanal dan lanjut tidak melampirkan jurnal', async () => {
  vi.stubEnv('VITE_HELP_EMAIL', 'pendamping@example.invalid');
  vi.stubEnv('VITE_HELP_CONTACT_LABEL', 'Pendamping Uji Fiktif');
  vi.stubEnv('VITE_HELP_SERVICE_HOURS', 'Jam uji fiktif');
  vi.stubEnv('VITE_HELP_VERIFIED_AT', '2026-11-19');
  const open = vi.spyOn(window, 'open').mockImplementation(() => null);
  render(
    <AppProviders>
      <RouterProvider
        router={createMemoryRouter(appRoutes, { initialEntries: ['/pusat-bantuan'] })}
      />
    </AppProviders>
  );
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: /Lanjut ke email/i }));
  expect(screen.getByRole('dialog')).toHaveTextContent(/alamat email/i);
  await user.click(screen.getByRole('button', { name: /Tetap di RUANGKISAH/i }));
  expect(open).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await user.click(await screen.findByRole('button', { name: /Lanjut ke email/i }));
  const dialog = screen.getByRole('dialog');
  const confirm = within(dialog).getByRole('button', { name: /Lanjut ke email/i });
  await user.click(confirm);
  expect(open).toHaveBeenCalledWith(
    expect.stringContaining('mailto:pendamping@example.invalid'),
    '_blank',
    'noopener,noreferrer'
  );
  expect(open.mock.calls[0][0]).not.toContain('ruangkisah:data');
});
