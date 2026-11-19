import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import {
  ACCOUNT_STATUSES,
  ACCOUNT_STATUS_LABELS,
  authStore,
  ROLE_LABELS,
  ROLES,
} from '@/data/authStore';
import {
  ApproveAccountDialog,
  ChangeRoleDialog,
  DeleteAccountDialog,
  ToggleStatusDialog,
} from '@/features/admin/components/AccountActionDialogs';
import { useAuth } from '@/features/auth/AuthContext';
import { formatIndonesianDate } from '@/utils/date';
import styles from './AdminPanel.module.css';

const PAGE_SIZE = 5;

function getStatusPillClass(status) {
  if (status === ACCOUNT_STATUSES.ACTIVE) return styles.statusActive;
  if (status === ACCOUNT_STATUSES.DISABLED) return styles.statusDisabled;
  return styles.statusPending;
}

export function AdminPanelPage({ mode = 'admin' }) {
  const { user, logout, refreshSession } = useAuth();
  const navigate = useNavigate();
  const isSuperadminMode = mode === 'superadmin' && user?.role === ROLES.SUPERADMIN;

  const [approvalTarget, setApprovalTarget] = useState(null);
  const [approvalSearch, setApprovalSearch] = useState('');
  const [approvalPage, setApprovalPage] = useState(1);
  const [tab, setTab] = useState('overview'); // 'overview' | 'students' | 'admins' | 'audit'
  const [accounts, setAccounts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [detailAccount, setDetailAccount] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null); // { account, nextRole }
  const [actionFeedback, setActionFeedback] = useState(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await authStore.listAccounts();
    if (result.ok) setAccounts(result.accounts);
    else {
      setAccounts([]);
      setActionFeedback({ variant: 'danger', message: result.message });
    }
    if (isSuperadminMode) {
      const audit = await authStore.listAuditLogs();
      if (audit.ok) setAuditLogs(audit.logs);
    }
    setLoading(false);
  }, [isSuperadminMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const studentAccounts = useMemo(() => accounts.filter((a) => a.role === ROLES.SISWA), [accounts]);

  const managerAccounts = useMemo(
    () => accounts.filter((a) => a.role === ROLES.ADMIN || a.role === ROLES.SUPERADMIN),
    [accounts]
  );

  const approvalQueue = useMemo(
    () => accounts.filter((account) => account.approvalStatus === 'pending'),
    [accounts]
  );
  const approvalMatches = approvalQueue.filter((account) =>
    (account.displayName + ' ' + account.email)
      .toLowerCase()
      .includes(approvalSearch.trim().toLowerCase())
  );
  const approvalPages = Math.max(1, Math.ceil(approvalMatches.length / PAGE_SIZE));
  const currentApprovalPage = Math.min(approvalPage, approvalPages);
  const approvalRows = approvalMatches.slice(
    (currentApprovalPage - 1) * PAGE_SIZE,
    currentApprovalPage * PAGE_SIZE
  );
  const handleConfirmApproval = async () => {
    if (!approvalTarget || !user) return;
    setPending(true);
    const result = await authStore.approveAccount(user, approvalTarget.id);
    setPending(false);
    setApprovalTarget(null);
    setActionFeedback({
      variant: result.ok ? 'success' : 'danger',
      message: result.ok
        ? 'Pendaftaran ' + result.account.displayName + ' disetujui. Pengguna sekarang dapat masuk.'
        : result.message,
    });
    if (result.ok && detailAccount?.id === result.account.id) setDetailAccount(result.account);
    await loadData();
  };

  const renderStatusAction = (account) =>
    account.status === ACCOUNT_STATUSES.PENDING_APPROVAL ? (
      <button type="button" className={styles.smallBtn} onClick={() => setApprovalTarget(account)}>
        Setujui akun
      </button>
    ) : (
      <button
        type="button"
        className={styles.smallBtn}
        disabled={account.status === ACCOUNT_STATUSES.PENDING_VERIFICATION}
        onClick={() => setStatusTarget(account)}
      >
        {account.status === ACCOUNT_STATUSES.PENDING_VERIFICATION
          ? 'Menunggu verifikasi email'
          : account.status === ACCOUNT_STATUSES.ACTIVE
            ? 'Nonaktifkan'
            : 'Aktifkan'}
      </button>
    );

  const stats = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return {
      totalStudents: studentAccounts.length,
      activeStudents: studentAccounts.filter((a) => a.status === ACCOUNT_STATUSES.ACTIVE).length,
      disabledStudents: studentAccounts.filter((a) => a.status === ACCOUNT_STATUSES.DISABLED)
        .length,
      recentStudents: studentAccounts.filter(
        (a) => now - new Date(a.createdAt).getTime() <= sevenDaysMs
      ).length,
    };
  }, [studentAccounts]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();

    return studentAccounts.filter((acc) => {
      if (q && !acc.displayName.toLowerCase().includes(q) && !acc.email.toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== 'all' && acc.status !== statusFilter) {
        return false;
      }
      if (dateFilter === '7d') {
        if (now - new Date(acc.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000) return false;
      } else if (dateFilter === '30d') {
        if (now - new Date(acc.createdAt).getTime() > 30 * 24 * 60 * 60 * 1000) return false;
      }
      return true;
    });
  }, [studentAccounts, search, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !user) return;
    setPending(true);
    const res = await authStore.deleteAccount(user, deleteTarget.id);
    setPending(false);
    setDeleteTarget(null);
    if (res.ok) {
      setActionFeedback({ variant: 'success', message: 'Akun berhasil dihapus.' });
      if (detailAccount?.id === deleteTarget.id) setDetailAccount(null);
      loadData();
      refreshSession();
    } else {
      setActionFeedback({ variant: 'danger', message: res.message });
      loadData();
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusTarget || !user) return;
    const nextStatus =
      statusTarget.status === ACCOUNT_STATUSES.ACTIVE
        ? ACCOUNT_STATUSES.DISABLED
        : ACCOUNT_STATUSES.ACTIVE;
    setPending(true);
    const res = await authStore.setAccountStatus(user, statusTarget.id, nextStatus);
    setPending(false);
    setStatusTarget(null);
    if (res.ok) {
      setActionFeedback({
        variant: 'success',
        message: `Status akun ${res.account.displayName} diperbarui menjadi ${ACCOUNT_STATUS_LABELS[res.account.status]}.`,
      });
      if (detailAccount?.id === res.account.id) setDetailAccount(res.account);
      loadData();
    } else {
      setActionFeedback({ variant: 'danger', message: res.message });
      loadData();
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!roleTarget || !user) return;
    setPending(true);
    const res = await authStore.setAccountRole(user, roleTarget.account.id, roleTarget.nextRole);
    setPending(false);
    setRoleTarget(null);
    if (res.ok) {
      setActionFeedback({
        variant: 'success',
        message: `Peran ${res.account.displayName} diperbarui menjadi ${ROLE_LABELS[res.account.role]}.`,
      });
      loadData();
    } else {
      setActionFeedback({ variant: 'danger', message: res.message });
      loadData();
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.ok) navigate('/');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="Menu panel pengelola">
        <div className={styles.sidebarHeader}>
          <span className={styles.roleTag}>
            {isSuperadminMode ? 'Panel Superadmin' : 'Panel Admin'}
          </span>
          <p className={styles.sidebarName}>{user?.displayName}</p>
        </div>

        <nav className={styles.navList}>
          <button
            type="button"
            className={`${styles.navButton} ${tab === 'overview' ? styles.navButtonActive : ''}`}
            onClick={() => setTab('overview')}
          >
            Ringkasan
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${tab === 'students' ? styles.navButtonActive : ''}`}
            onClick={() => setTab('students')}
          >
            Kelola Akun Siswa
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${tab === 'approvals' ? styles.navButtonActive : ''}`}
            onClick={() => setTab('approvals')}
          >
            Persetujuan Akun ({approvalQueue.length})
          </button>
          {isSuperadminMode && (
            <>
              <button
                type="button"
                className={`${styles.navButton} ${tab === 'admins' ? styles.navButtonActive : ''}`}
                onClick={() => setTab('admins')}
              >
                Kelola Admin
              </button>
              <button
                type="button"
                className={`${styles.navButton} ${tab === 'audit' ? styles.navButtonActive : ''}`}
                onClick={() => setTab('audit')}
              >
                Riwayat Tindakan
              </button>
            </>
          )}
          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            Keluar
          </button>
        </nav>
      </aside>

      <div className={styles.content}>
        <details className={styles.adminDisclosure}>
          <summary>Privasi catatan siswa</summary>
          <p>
            Panel ini mengelola akun. Isi jurnal tetap berada pada perangkat siswa dan tidak dapat
            dibaca melalui panel.
          </p>
        </details>

        {actionFeedback && (
          <Notice variant={actionFeedback.variant}>{actionFeedback.message}</Notice>
        )}
        {loading && <p role="status">Memuat akun dari server...</p>}

        {tab === 'overview' && (
          <div key="overview" className={styles.tabPane}>
            <header className={styles.pageHeader}>
              <h1 className={styles.title}>
                {isSuperadminMode ? 'Ringkasan Superadmin' : 'Ringkasan Admin'}
              </h1>
              <p className={styles.lead}>
                Jumlah akun siswa lintas sekolah dihitung dari data akun platform di server.
              </p>
            </header>

            <Notice
              actions={
                <Button variant="secondary" onClick={() => setTab('approvals')}>
                  Tinjau persetujuan akun ({approvalQueue.length})
                </Button>
              }
            >
              {approvalQueue.length} pendaftaran menunggu persetujuan pengelola.
            </Notice>
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statCardPistachio}`}>
                <p className={styles.statLabel}>Total siswa</p>
                <p className={styles.statValue}>{stats.totalStudents}</p>
              </div>
              <div className={`${styles.statCard} ${styles.statCardFrost}`}>
                <p className={styles.statLabel}>Akun aktif</p>
                <p className={styles.statValue}>{stats.activeStudents}</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>Akun dinonaktifkan</p>
                <p className={styles.statValue}>{stats.disabledStudents}</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>Pendaftaran terbaru (7h)</p>
                <p className={styles.statValue}>{stats.recentStudents}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'approvals' && (
          <section className={styles.panel} aria-labelledby="approvals-heading">
            <header className={styles.pageHeader}>
              <h1 id="approvals-heading" className={styles.title}>
                Persetujuan Akun
              </h1>
              <p className={styles.lead}>
                Tinjau pendaftaran siswa. Persetujuan hanya dapat diberikan setelah email
                terverifikasi dan akun tidak dinonaktifkan.
              </p>
            </header>
            <div className={styles.rowActions}>
              <Button variant="secondary" onClick={loadData} disabled={loading}>
                Muat ulang permintaan
              </Button>
              <span>{approvalQueue.length} akun menunggu persetujuan</span>
            </div>
            <Field
              label="Cari permintaan akun"
              value={approvalSearch}
              onChange={(event) => {
                setApprovalSearch(event.target.value);
                setApprovalPage(1);
              }}
              placeholder="Nama atau email pendaftar"
            />
            {approvalMatches.length === 0 ? (
              <Notice>Tidak ada permintaan akun yang sesuai.</Notice>
            ) : (
              <div className={styles.approvalList}>
                {approvalRows.map((account) => (
                  <article
                    key={account.id}
                    className={styles.mobileCard}
                    aria-label={'Permintaan ' + account.email}
                  >
                    <strong>{account.displayName}</strong>
                    <span>{account.email}</span>
                    <span>Daftar: {formatIndonesianDate(account.createdAt)}</span>
                    <span className={`${styles.statusPill} ${getStatusPillClass(account.status)}`}>
                      {ACCOUNT_STATUS_LABELS[account.status]}
                    </span>
                    <span>
                      Email: {account.emailVerified ? 'Terverifikasi' : 'Belum terverifikasi'}
                    </span>
                    <div className={styles.rowActions}>
                      <Button
                        onClick={() => setApprovalTarget(account)}
                        disabled={
                          !account.emailVerified || account.status === ACCOUNT_STATUSES.DISABLED
                        }
                      >
                        Setujui akun
                      </Button>
                      <Button variant="secondary" onClick={() => setDetailAccount(account)}>
                        Detail
                      </Button>
                      <Button variant="dangerOutline" onClick={() => setDeleteTarget(account)}>
                        Hapus akun
                      </Button>
                    </div>
                    {!account.emailVerified && (
                      <p className={styles.statusHint}>
                        Pengguna perlu membuka tautan verifikasi email terlebih dahulu.
                      </p>
                    )}
                    {account.status === ACCOUNT_STATUSES.DISABLED && (
                      <p className={styles.statusHint}>
                        Aktifkan kembali akun melalui Kelola Akun Siswa sebelum menyetujui.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
            <div className={styles.pagination}>
              <span>
                Halaman {currentApprovalPage} dari {approvalPages}
              </span>
              <div className={styles.rowActions}>
                <Button
                  variant="secondary"
                  disabled={currentApprovalPage <= 1}
                  onClick={() => setApprovalPage(currentApprovalPage - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="secondary"
                  disabled={currentApprovalPage >= approvalPages}
                  onClick={() => setApprovalPage(currentApprovalPage + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          </section>
        )}

        {tab === 'students' && (
          <section className={styles.panel} aria-labelledby="students-heading">
            <header className={styles.pageHeader}>
              <h1 id="students-heading" className={styles.title}>
                Kelola Akun Siswa
              </h1>
              <p className={styles.lead}>
                Cari, filter, tinjau detail akun, nonaktifkan/aktifkan kembali, atau hapus akun
                siswa.
              </p>
            </header>

            <div className={styles.filtersGrid}>
              <Field
                label="Cari nama atau email"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Ketik nama atau email..."
              />

              <div className={styles.selectField}>
                <label htmlFor="status-filter" className={styles.selectLabel}>
                  Status akun
                </label>
                <select
                  id="status-filter"
                  className={styles.selectControl}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Semua status</option>
                  <option value={ACCOUNT_STATUSES.ACTIVE}>Aktif</option>
                  <option value={ACCOUNT_STATUSES.DISABLED}>Dinonaktifkan</option>
                  <option value={ACCOUNT_STATUSES.PENDING_VERIFICATION}>
                    Menunggu verifikasi email
                  </option>
                  <option value={ACCOUNT_STATUSES.PENDING_APPROVAL}>
                    Menunggu persetujuan Admin
                  </option>
                </select>
              </div>

              <div className={styles.selectField}>
                <label htmlFor="date-filter" className={styles.selectLabel}>
                  Tanggal daftar
                </label>
                <select
                  id="date-filter"
                  className={styles.selectControl}
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Semua waktu</option>
                  <option value="7d">7 hari terakhir</option>
                  <option value="30d">30 hari terakhir</option>
                </select>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nama tampilan</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Tanggal daftar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5}>Tidak ada akun siswa yang sesuai filter.</td>
                    </tr>
                  ) : (
                    pagedStudents.map((acc) => (
                      <tr key={acc.id}>
                        <td>{acc.displayName}</td>
                        <td>{acc.email}</td>
                        <td>
                          <span
                            className={`${styles.statusPill} ${getStatusPillClass(acc.status)}`}
                          >
                            {ACCOUNT_STATUS_LABELS[acc.status]}
                          </span>
                        </td>
                        <td>{formatIndonesianDate(acc.createdAt)}</td>
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.smallBtn}
                              onClick={() => setDetailAccount(acc)}
                            >
                              Detail
                            </button>
                            {renderStatusAction(acc)}
                            {isSuperadminMode && (
                              <button
                                type="button"
                                className={styles.smallBtn}
                                disabled={acc.status !== ACCOUNT_STATUSES.ACTIVE}
                                onClick={() =>
                                  setRoleTarget({ account: acc, nextRole: ROLES.ADMIN })
                                }
                              >
                                Jadikan Admin
                              </button>
                            )}
                            <button
                              type="button"
                              className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                              onClick={() => setDeleteTarget(acc)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {pagedStudents.length === 0 ? (
                <p className={styles.lead}>Tidak ada akun siswa yang sesuai filter.</p>
              ) : (
                pagedStudents.map((acc) => (
                  <article key={acc.id} className={styles.mobileCard}>
                    <strong>{acc.displayName}</strong>
                    <span>{acc.email}</span>
                    <span>
                      {ACCOUNT_STATUS_LABELS[acc.status]} · {formatIndonesianDate(acc.createdAt)}
                    </span>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.smallBtn}
                        onClick={() => setDetailAccount(acc)}
                      >
                        Detail
                      </button>
                      {renderStatusAction(acc)}
                      <button
                        type="button"
                        className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                        onClick={() => setDeleteTarget(acc)}
                      >
                        Hapus
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className={styles.pagination}>
              <span className={styles.lead}>
                Halaman {currentPage} dari {totalPages} ({filteredStudents.length} akun)
              </span>
              <div className={styles.rowActions}>
                <Button
                  variant="secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="secondary"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          </section>
        )}

        {isSuperadminMode && tab === 'admins' && (
          <section className={styles.panel} aria-labelledby="admins-heading">
            <header className={styles.pageHeader}>
              <h1 id="admins-heading" className={styles.title}>
                Kelola Admin &amp; Pengaturan Peran
              </h1>
              <p className={styles.lead}>
                Tetapkan atau cabut peran Admin. Superadmin terakhir tidak dapat dinonaktifkan atau
                dihapus.
              </p>
            </header>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nama tampilan</th>
                    <th>Email</th>
                    <th>Peran</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {managerAccounts.map((acc) => (
                    <tr key={acc.id}>
                      <td>{acc.displayName}</td>
                      <td>{acc.email}</td>
                      <td>{ROLE_LABELS[acc.role]}</td>
                      <td>
                        <span className={`${styles.statusPill} ${getStatusPillClass(acc.status)}`}>
                          {ACCOUNT_STATUS_LABELS[acc.status]}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.smallBtn}
                            onClick={() => setDetailAccount(acc)}
                          >
                            Detail
                          </button>
                          {acc.role === ROLES.ADMIN && (
                            <button
                              type="button"
                              className={styles.smallBtn}
                              onClick={() => setRoleTarget({ account: acc, nextRole: ROLES.SISWA })}
                            >
                              Cabut Admin
                            </button>
                          )}
                          {renderStatusAction(acc)}
                          <button
                            type="button"
                            className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                            onClick={() => setDeleteTarget(acc)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {managerAccounts.map((acc) => (
                <article key={acc.id} className={styles.mobileCard}>
                  <strong>{acc.displayName}</strong>
                  <span>
                    {acc.email} · {ROLE_LABELS[acc.role]}
                  </span>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.smallBtn}
                      onClick={() => setDetailAccount(acc)}
                    >
                      Detail
                    </button>
                    {acc.role === ROLES.ADMIN && (
                      <button
                        type="button"
                        className={styles.smallBtn}
                        onClick={() => setRoleTarget({ account: acc, nextRole: ROLES.SISWA })}
                      >
                        Cabut Admin
                      </button>
                    )}
                    <button
                      type="button"
                      className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                      onClick={() => setDeleteTarget(acc)}
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {isSuperadminMode && tab === 'audit' && (
          <section className={styles.panel} aria-labelledby="audit-heading">
            <header className={styles.pageHeader}>
              <h1 id="audit-heading" className={styles.title}>
                Riwayat Tindakan Pengelola
              </h1>
              <p className={styles.lead}>
                Mencatat pelaku, tindakan, akun sasaran, waktu, dan hasil operasi tanpa isi jurnal
                atau kata sandi.
              </p>
            </header>

            {auditLogs.length === 0 ? (
              <p className={styles.lead}>Belum ada tindakan pengelola yang tercatat.</p>
            ) : (
              <>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>Pelaku</th>
                        <th>Tindakan</th>
                        <th>Akun sasaran</th>
                        <th>Hasil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{formatIndonesianDate(log.timestamp)}</td>
                          <td>
                            {log.actorEmail} ({ROLE_LABELS[log.actorRole]})
                          </td>
                          <td>{log.action}</td>
                          <td>{log.targetEmail}</td>
                          <td>{log.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.mobileCards}>
                  {auditLogs.map((log) => (
                    <article key={log.id} className={styles.mobileCard}>
                      <dl className={styles.auditCard}>
                        <dt>Waktu</dt>
                        <dd>{formatIndonesianDate(log.timestamp)}</dd>
                        <dt>Pelaku</dt>
                        <dd>
                          {log.actorEmail} ({ROLE_LABELS[log.actorRole]})
                        </dd>
                        <dt>Tindakan</dt>
                        <dd>{log.action}</dd>
                        <dt>Akun sasaran</dt>
                        <dd>{log.targetEmail}</dd>
                        <dt>Hasil</dt>
                        <dd>{log.result}</dd>
                      </dl>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </div>

      <Dialog
        open={Boolean(detailAccount)}
        title="Detail Akun"
        onClose={() => setDetailAccount(null)}
        actions={
          <Button variant="primary" onClick={() => setDetailAccount(null)}>
            Tutup
          </Button>
        }
      >
        {detailAccount && (
          <>
            <p>
              <strong>Nama tampilan:</strong> {detailAccount.displayName}
            </p>
            <p>
              <strong>Email:</strong> {detailAccount.email}
            </p>
            <p>
              <strong>Peran:</strong> {ROLE_LABELS[detailAccount.role]}
            </p>
            <p>
              <strong>Status:</strong> {ACCOUNT_STATUS_LABELS[detailAccount.status]}
            </p>
            <p>
              <strong>Persetujuan:</strong>{' '}
              {detailAccount.approvalStatus === 'approved' ? 'Disetujui' : 'Menunggu Admin'}
            </p>
            <p>
              <strong>Tanggal pendaftaran:</strong> {formatIndonesianDate(detailAccount.createdAt)}
            </p>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Kata sandi dan catatan refleksi pribadi tidak pernah ditampilkan pada panel pengelola.
            </p>
          </>
        )}
      </Dialog>

      <ApproveAccountDialog
        open={Boolean(approvalTarget)}
        account={approvalTarget}
        pending={pending}
        onCancel={() => setApprovalTarget(null)}
        onConfirm={handleConfirmApproval}
      />

      <DeleteAccountDialog
        pending={pending}
        open={Boolean(deleteTarget)}
        account={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <ToggleStatusDialog
        pending={pending}
        open={Boolean(statusTarget)}
        account={statusTarget}
        onCancel={() => setStatusTarget(null)}
        onConfirm={handleConfirmToggleStatus}
      />

      <ChangeRoleDialog
        pending={pending}
        open={Boolean(roleTarget)}
        account={roleTarget?.account}
        targetRole={roleTarget?.nextRole}
        onCancel={() => setRoleTarget(null)}
        onConfirm={handleConfirmRoleChange}
      />
    </div>
  );
}
