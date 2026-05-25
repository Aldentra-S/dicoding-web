import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [healthHistory, setHealthHistory] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [akumulasi, setAkumulasi] = useState(null);
  const [healthPrefill, setHealthPrefill] = useState(null);
  const [busy, setBusy] = useState({
    init: false,
    hc: false,
    bk: false,
    ak: false,
  });
  const [zoomLinks, setZoomLinks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('zoom_links') || '{}');
    } catch {
      return {};
    }
  });
  const ready = useRef(false);

  const tok = () => localStorage.getItem('token');
  const hdr = () => ({
    Authorization: `Bearer ${tok()}`,
    'Content-Type': 'application/json',
  });

  const saveZoomLink = useCallback((bookingId, link) => {
    setZoomLinks((prev) => {
      const next = { ...prev, [bookingId]: link };
      try {
        localStorage.setItem('zoom_links', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const loadHealth = useCallback(async () => {
    if (!tok()) return;
    try {
      const r = await fetch(`${API}/health-check/history?limit=50`, {
        headers: hdr(),
      });
      const d = await r.json();
      if (d.status === 'success')
        setHealthHistory(d.data?.history || d.history || []);
    } catch {}
  }, []);

  const loadBookings = useCallback(async () => {
    if (!tok()) return;
    try {
      const r = await fetch(`${API}/bookings`, { headers: hdr() });
      const d = await r.json();
      if (d.status === 'success')
        setBookings(d.data?.bookings || d.bookings || []);
    } catch {}
  }, []);

  const loadConsultants = useCallback(async () => {
    try {
      const r = await fetch(`${API}/consultants`);
      const d = await r.json();
      if (d.status === 'success')
        setConsultants(d.data?.consultants || d.consultants || []);
    } catch {}
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!tok()) return;
    try {
      const r = await fetch(`${API}/dashboard`, { headers: hdr() });
      const d = await r.json();
      if (d.status === 'success') setDashboard(d.data);
    } catch {}
  }, []);

  const loadMe = useCallback(async () => {
    if (!tok()) return;
    try {
      const r = await fetch(`${API}/auth/profile`, { headers: hdr() });
      const d = await r.json();
      if (d.status === 'success') {
        const usr = d.data?.user || d.user;
        setUser(usr);
        localStorage.setItem('user', JSON.stringify(usr));
      }
    } catch {}
  }, []);

  const loadAkumulasi = useCallback(async () => {
    if (!tok()) return;
    setBusy((p) => ({ ...p, ak: true }));
    try {
      const r = await fetch(`${API}/finance/akumulasi-bulanan`, {
        headers: hdr(),
      });
      const d = await r.json();
      if (d.status === 'success') {
        setAkumulasi(d.data);
      }
    } catch {
    } finally {
      setBusy((p) => ({ ...p, ak: false }));
    }
  }, []);

  const addDailyLog = useCallback(
    async (payload) => {
      if (!tok()) return;
      const r = await fetch(`${API}/finance/daily-log`, {
        method: 'POST',
        headers: hdr(),
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (d.status === 'success') {
        await loadAkumulasi();
      }
      return d;
    },
    [loadAkumulasi],
  );

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      loadHealth(),
      loadBookings(),
      loadConsultants(),
      loadDashboard(),
      loadMe(),
      loadAkumulasi(),
    ]);
  }, [
    loadHealth,
    loadBookings,
    loadConsultants,
    loadDashboard,
    loadMe,
    loadAkumulasi,
  ]);

  useEffect(() => {
    if (tok() && !ready.current) {
      ready.current = true;
      setBusy((p) => ({ ...p, init: true }));
      refreshAll().finally(() => setBusy((p) => ({ ...p, init: false })));
    }
    loadConsultants();
  }, [loadConsultants, refreshAll]);

  const login = useCallback(
    async (email, password) => {
      const r = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (d.status === 'success') {
        const tk = d.data?.token || d.token;
        const usr = d.data?.user || d.user;
        localStorage.setItem('token', tk);
        localStorage.setItem('user', JSON.stringify(usr));
        setUser(usr);
        ready.current = true;
        await refreshAll();
      }
      return d;
    },
    [refreshAll],
  );

  const register = useCallback(async (form) => {
    const r = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    return r.json();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setHealthHistory([]);
    setBookings([]);
    setDashboard(null);
    setAkumulasi(null);
    setHealthPrefill(null);
    ready.current = false;
  }, []);

  const doHealthCheck = useCallback(
    async (form) => {
      setBusy((p) => ({ ...p, hc: true }));
      try {
        const payload = {
          monthly_income: Number(
            form.monthly_income ||
              form.monthlyIncome ||
              form.total_pendapatan ||
              form.pendapatan ||
              0,
          ),
          monthly_expenses: Number(
            form.monthly_expenses ||
              form.monthlyExpenses ||
              form.total_pengeluaran ||
              form.pengeluaran ||
              0,
          ),
          monthly_debt_payment: Number(
            form.monthly_debt_payment ||
              form.monthlyDebtPayment ||
              form.total_cicilan ||
              form.cicilan ||
              0,
          ),
          emergency_fund: Number(
            form.emergency_fund ||
              form.emergencyFund ||
              form.total_dana_darurat ||
              form.dana_darurat ||
              form.danaDarurat ||
              0,
          ),
          score: Number(form.score || 0),
          status: form.status || 'Good',
        };

        const r = await fetch(`${API}/health-check`, {
          method: 'POST',
          headers: hdr(),
          body: JSON.stringify(payload),
        });
        const d = await r.json();
        if (d.status === 'success') {
          await Promise.allSettled([
            loadHealth(),
            loadDashboard(),
            loadAkumulasi(),
          ]);
        }
        return d;
      } finally {
        setBusy((p) => ({ ...p, hc: false }));
      }
    },
    [loadHealth, loadDashboard, loadAkumulasi],
  );

  const doBooking = useCallback(
    async (form) => {
      setBusy((p) => ({ ...p, bk: true }));
      try {
        const r = await fetch(`${API}/bookings`, {
          method: 'POST',
          headers: hdr(),
          body: JSON.stringify(form),
        });
        const d = await r.json();
        if (d.status === 'success') {
          await Promise.allSettled([loadBookings(), loadDashboard()]);
        }
        return d;
      } finally {
        setBusy((p) => ({ ...p, bk: false }));
      }
    },
    [loadBookings, loadDashboard],
  );

  const cancelBooking = useCallback(
    async (id) => {
      const r = await fetch(`${API}/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: hdr(),
      });
      const d = await r.json();
      if (d.status === 'success')
        await Promise.allSettled([loadBookings(), loadDashboard()]);
      return d;
    },
    [loadBookings, loadDashboard],
  );

  const updateProfile = useCallback(async (form) => {
    const r = await fetch(`${API}/auth/profile`, {
      method: 'PATCH',
      headers: hdr(),
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (d.status === 'success') {
      const usr = d.data?.user || d.user;
      setUser(usr);
      localStorage.setItem('user', JSON.stringify(usr));
    }
    return d;
  }, []);

  const changePass = useCallback(async (form) => {
    const r = await fetch(`${API}/auth/change-password`, {
      method: 'PATCH',
      headers: hdr(),
      body: JSON.stringify(form),
    });
    return r.json();
  }, []);

  const getSlots = useCallback(async (consultantId, date) => {
    const r = await fetch(
      `${API}/consultants/${consultantId}/available-slots?date=${date}`,
    );
    return r.json();
  }, []);

  const prefillHealthFromAkumulasi = useCallback((data) => {
    setHealthPrefill(data);
  }, []);

  const clearHealthPrefill = useCallback(() => {
    setHealthPrefill(null);
  }, []);

  const lastHC = healthHistory[0] || null;

  return (
    <Ctx.Provider
      value={{
        user,
        healthHistory,
        bookings,
        consultants,
        dashboard,
        akumulasi,
        healthPrefill,
        busy,
        lastHC,
        zoomLinks,
        saveZoomLink,
        login,
        register,
        logout,
        doHealthCheck,
        doBooking,
        cancelBooking,
        updateProfile,
        changePass,
        getSlots,
        refreshAll,
        loadAkumulasi,
        addDailyLog,
        prefillHealthFromAkumulasi,
        clearHealthPrefill,
        API,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp outside AppProvider');
  return c;
};
