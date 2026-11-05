/* 后端客户端：有后端时走接口，没有后端时页面继续用 localStorage */
(function(){
  const DKEY = 'xyyj_device';
  let dev = null;
  try { dev = localStorage.getItem(DKEY); } catch(e){}
  if(!dev){
    dev = 'd_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    try { localStorage.setItem(DKEY, dev); } catch(e){}
  }
  const TOKEN = 'xyyj_admin_token';
  const base = () => (window.API_BASE || '');

  async function req(path, opts){
    opts = opts || {};
    const headers = Object.assign(
      { 'Content-Type': 'application/json', 'X-Device': dev },
      opts.headers || {}
    );
    let tok = null;
    try { tok = sessionStorage.getItem(TOKEN); } catch(e){}
    if(tok) headers.Authorization = 'Bearer ' + tok;
    const r = await fetch(base() + path, Object.assign({}, opts, { headers }));
    let j = null;
    try { j = await r.json(); } catch(e){}
    if(!r.ok) throw new Error((j && j.error) || ('HTTP ' + r.status));
    return j || {};
  }

  window.XYAPI = {
    on: !!window.API_ON,
    device: dev,
    hasToken(){ try { return !!sessionStorage.getItem(TOKEN); } catch(e){ return false; } },
    logout(){ try { sessionStorage.removeItem(TOKEN); } catch(e){} },
    async login(user, pass){
      const j = await req('/api/admin/login', { method:'POST', body: JSON.stringify({ user, pass }) });
      try { sessionStorage.setItem(TOKEN, j.token); } catch(e){}
      return j;
    },
    createBooking: rec => req('/api/bookings', { method:'POST', body: JSON.stringify(rec) }),
    mine: () => req('/api/bookings/mine'),
    cancel: no => req('/api/bookings/' + encodeURIComponent(no) + '/cancel', { method:'PATCH' }),
    adminBookings: () => req('/api/admin/bookings'),
    patchBooking: (no, patch) => req('/api/admin/bookings/' + encodeURIComponent(no), { method:'PATCH', body: JSON.stringify(patch) }),
    events: () => req('/api/events'),
    createEvent: ev => req('/api/admin/events', { method:'POST', body: JSON.stringify(ev) }),
    patchEvent: (id, ev) => req('/api/admin/events/' + encodeURIComponent(id), { method:'PATCH', body: JSON.stringify(ev) }),
    deleteEvent: id => req('/api/admin/events/' + encodeURIComponent(id), { method:'DELETE' })
  };
})();
