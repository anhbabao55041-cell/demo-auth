/**
 * ==============================================================================
 * VIET AUTH SYSTEM - COMPLETE CORE APPLICATION LOGIC
 * Tích hợp:
 * 1. Đăng ký & Đăng nhập thành viên (User Portal)
 * 2. Mở khóa Bảng Quản Trị bằng Key Admin: "thai"
 * 3. Tab riêng Quản Trị Admin toàn diện (Apps, Keys, HWID, Users, Variables, Logs)
 * 4. Tương thích 100% Render.com (Node.js REST API & LocalStorage Fallback)
 * ==============================================================================
 */

// ĐỊA CHỈ API MÁY CHỦ (TỰ ĐỘNG NHẬN DIỆN KHI DEPLOY LÊN RENDER HOẶC CHẠY LOCAL)
const API_BASE = window.location.origin.includes('http') && !window.location.origin.startsWith('file:')
  ? window.location.origin
  : 'http://localhost:8080';

// KEY ADMIN BẢO MẬT HỆ THỐNG
const ADMIN_SECRET_KEY = "thai";

// STATE TỔNG THỂ
const state = {
  isServerOnline: false,
  serverPingMs: 0,
  currentTab: 'user-portal',
  isAdminUnlocked: false,
  currentUser: null,
  apps: [],
  licenses: [],
  users: [],
  variables: [],
  logs: [],
  devices: [],
  activeSdkLang: 'cpp-auth',
  filters: {
    appId: 'ALL',
    status: 'ALL',
    search: ''
  }
};

// DỮ LIỆU MẶC ĐỊNH SẴN CÓ
const defaultData = {
  apps: [
    {
      id: "app_viet_01",
      name: "Tool VIP Pro Auto 2026",
      appId: "app_pk_viet_9a8b7c6d5e4f",
      secretKey: "sk_live_viet_849203847291039482",
      version: "2.5.0",
      platform: "C# (.NET / WinForms)",
      description: "Ứng dụng tiện ích và tự động hóa cao cấp cho Windows",
      status: "ACTIVE",
      createdAt: "2026-09-15T08:30:00Z",
      usersCount: 142,
      licensesCount: 250
    }
  ],
  licenses: [
    {
      id: "lic_001",
      key: "VIET-VIP-8888-9999-AAAA",
      applicationId: "app_viet_01",
      subscriptionLevel: "VIP",
      durationDays: 30,
      status: "ACTIVE",
      hwid: "HWID-PC-VIETNAM-882194",
      hwidEnabled: true,
      activationLimit: 1,
      activationCount: 1,
      createdAt: "2026-09-25T09:00:00Z",
      activatedAt: "2026-09-25T09:30:00Z",
      expiresAt: "2026-10-25T09:30:00Z",
      lastUsedAt: "2026-09-29T18:20:00Z",
      notes: "Khách mua gói tháng - Zalo: 0988.123.456",
      banReason: null
    },
    {
      id: "lic_002",
      key: "VIET-LIFE-7777-6666-BBBB",
      applicationId: "app_viet_01",
      subscriptionLevel: "ENTERPRISE",
      durationDays: 0,
      status: "ACTIVE",
      hwid: "HWID-DELL-VIET-990142",
      hwidEnabled: true,
      activationLimit: 1,
      activationCount: 1,
      createdAt: "2026-09-20T14:00:00Z",
      activatedAt: "2026-09-20T14:10:00Z",
      expiresAt: null,
      lastUsedAt: "2026-09-29T19:00:00Z",
      notes: "Bản quyền vĩnh viễn (Lifetime) - Khách đại lý",
      banReason: null
    }
  ],
  users: [
    {
      id: "usr_001",
      username: "nguyenvana",
      email: "vana@gmail.com",
      password: "123",
      applicationId: "app_viet_01",
      status: "ACTIVE",
      hwid: "HWID-PC-VIETNAM-882194",
      licenseKey: "VIET-VIP-8888-9999-AAAA",
      ipAddress: "113.161.45.22",
      createdAt: "2026-09-25T09:30:00Z",
      lastLogin: "2026-09-29T18:20:00Z"
    }
  ],
  variables: [
    {
      id: "var_001",
      applicationId: "app_viet_01",
      name: "APP_VERSION",
      value: "2.5.0",
      isSecret: false,
      updatedAt: "2026-09-29T10:00:00Z"
    },
    {
      id: "var_002",
      applicationId: "app_viet_01",
      name: "UPDATE_URL",
      value: "https://vietauth.vn/updates/latest_v250.zip",
      isSecret: false,
      updatedAt: "2026-09-29T10:00:00Z"
    }
  ],
  logs: [
    {
      id: "log_001",
      timestamp: new Date().toISOString(),
      action: "API_VERIFY_SUCCESS",
      user: "nguyenvana",
      applicationId: "app_viet_01",
      result: "SUCCESS",
      details: "Xác thực key VIET-VIP-8888-9999-AAAA thành công"
    }
  ],
  devices: [
    {
      id: "dev_001",
      hwid: "HWID-PC-VIETNAM-882194",
      ip: "113.161.45.22",
      appId: "app_viet_01",
      appName: "Tool VIP Pro Auto 2026",
      licenseKey: "VIET-VIP-8888-9999-AAAA",
      username: "nguyenvana",
      status: "ONLINE",
      firstConnected: "2026-09-25T09:30:00Z",
      lastSeen: new Date().toISOString()
    },
    {
      id: "dev_002",
      hwid: "HWID-DELL-VIET-990142",
      ip: "14.162.88.91",
      appId: "app_viet_01",
      appName: "Tool VIP Pro Auto 2026",
      licenseKey: "VIET-LIFETIME-0000-1111-BBBB",
      username: "tranthib",
      status: "ONLINE",
      firstConnected: "2026-09-20T14:10:00Z",
      lastSeen: new Date().toISOString()
    },
    {
      id: "dev_003",
      hwid: "HWID-ASUS-GAMING-771822",
      ip: "27.72.102.15",
      appId: "app_viet_02",
      appName: "VietBot Trade Crypto & Forex",
      licenseKey: "VIET-PRO-1111-2222-CCCC",
      username: "lethic",
      status: "ONLINE",
      firstConnected: "2026-09-28T16:20:00Z",
      lastSeen: new Date().toISOString()
    }
  ]
};

// ==============================================================================
// INITIALIZATION
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  checkAdminLockStatus();
  initAuthSession();
  initNavigation();
  initModals();
  initAuthHandlers();
  initAdminKeyHandlers();
  initRedeemKeyHandlers();
  initAdminActions();
  initApiTester();
  initCodeSnippets();
  checkServerConnection();
});

function initStorage() {
  const saved = localStorage.getItem('viet_auth_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.apps = parsed.apps || defaultData.apps;
      state.licenses = parsed.licenses || defaultData.licenses;
      state.users = parsed.users || defaultData.users;
      state.variables = parsed.variables || defaultData.variables;
      state.logs = parsed.logs || defaultData.logs;
      state.devices = parsed.devices || defaultData.devices;
    } catch (e) {
      loadFallbackData();
    }
  } else {
    loadFallbackData();
  }
}

function loadFallbackData() {
  state.apps = JSON.parse(JSON.stringify(defaultData.apps));
  state.licenses = JSON.parse(JSON.stringify(defaultData.licenses));
  state.users = JSON.parse(JSON.stringify(defaultData.users));
  state.variables = JSON.parse(JSON.stringify(defaultData.variables));
  state.logs = JSON.parse(JSON.stringify(defaultData.logs));
  state.devices = JSON.parse(JSON.stringify(defaultData.devices));
  saveStateToStorage();
}

function saveStateToStorage() {
  localStorage.setItem('viet_auth_data', JSON.stringify({
    apps: state.apps,
    licenses: state.licenses,
    users: state.users,
    variables: state.variables,
    logs: state.logs,
    devices: state.devices
  }));
}

// ==============================================================================
// ADMIN KEY UNLOCK LOGIC (KEY: "thai")
// ==============================================================================
function checkAdminLockStatus() {
  const isUnlocked = sessionStorage.getItem('viet_admin_unlocked') === 'true';
  state.isAdminUnlocked = isUnlocked;
  updateAdminUI();
}

function initAdminKeyHandlers() {
  const triggerBtns = [
    document.getElementById('btnSidebarAdminAccess'),
    document.getElementById('btnTopbarAdminAccess')
  ];

  triggerBtns.forEach(btn => {
    btn?.addEventListener('click', () => {
      if (state.isAdminUnlocked) {
        // Đã mở khóa -> Chuyển thẳng vào Admin Dashboard
        switchTab('admin-dashboard');
      } else {
        // Chưa mở khóa -> Bật popup nhập key "thai"
        openModal('modalAdminKeyAuth');
        const input = document.getElementById('inputAdminSecretKey');
        if (input) {
          input.value = '';
          input.focus();
        }
        document.getElementById('adminKeyErrorAlert').style.display = 'none';
      }
    });
  });

  // Nút submit key
  document.getElementById('btnSubmitAdminKey')?.addEventListener('click', verifyAdminKey);
  document.getElementById('inputAdminSecretKey')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyAdminKey();
  });

  // Nút khóa Admin
  document.getElementById('btnLockAdmin')?.addEventListener('click', lockAdmin);
  document.getElementById('btnAdminQuickLock')?.addEventListener('click', lockAdmin);
  document.getElementById('btnCloseAdminKeyModal')?.addEventListener('click', () => closeModal('modalAdminKeyAuth'));
  document.getElementById('btnCancelAdminKey')?.addEventListener('click', () => closeModal('modalAdminKeyAuth'));
}

async function verifyAdminKey() {
  const input = document.getElementById('inputAdminSecretKey');
  const errorAlert = document.getElementById('adminKeyErrorAlert');
  const enteredKey = (input?.value || '').trim();

  // Kiểm tra với server nếu online
  if (state.isServerOnline) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: enteredKey })
      });
      const data = await res.json();
      if (data.success) {
        unlockAdminSuccess();
        return;
      }
    } catch (e) {}
  }

  // Kiểm tra chuẩn key: "thai"
  if (enteredKey.toLowerCase() === ADMIN_SECRET_KEY.toLowerCase()) {
    unlockAdminSuccess();
  } else {
    errorAlert.style.display = 'block';
    errorAlert.textContent = '❌ Mã Key Admin không chính xác! Vui lòng thử lại.';
    input.classList.add('border-red');
    setTimeout(() => input.classList.remove('border-red'), 1000);
  }
}

function unlockAdminSuccess() {
  state.isAdminUnlocked = true;
  sessionStorage.setItem('viet_admin_unlocked', 'true');
  closeModal('modalAdminKeyAuth');
  updateAdminUI();
  switchTab('admin-dashboard');
  showToast('🎉 Đã mở khóa Bảng Quản Trị Admin toàn quyền!', 'success');
  addLocalLog('ADMIN_UNLOCK', 'Admin', 'SYSTEM', 'SUCCESS', 'Mở khóa Bảng Quản Trị thành công');
}

function lockAdmin() {
  state.isAdminUnlocked = false;
  sessionStorage.removeItem('viet_admin_unlocked');
  updateAdminUI();
  switchTab('user-portal');
  showToast('🔒 Đã khóa quyền Admin thành công.', 'info');
}

function updateAdminUI() {
  const adminMenu = document.getElementById('adminExclusiveMenu');
  const sidebarBtnText = document.getElementById('sidebarAdminBtnText');
  const topbarAdminText = document.getElementById('topbarAdminText');
  const lockBadge = document.getElementById('adminLockBadge');

  if (state.isAdminUnlocked) {
    if (adminMenu) adminMenu.style.display = 'block';
    if (sidebarBtnText) sidebarBtnText.textContent = '👑 Bảng Quản Trị';
    if (topbarAdminText) topbarAdminText.textContent = '👑 Admin Đang Mở';
    if (lockBadge) {
      lockBadge.textContent = 'Đã Mở';
      lockBadge.className = 'nav-badge success';
    }
  } else {
    if (adminMenu) adminMenu.style.display = 'none';
    if (sidebarBtnText) sidebarBtnText.textContent = '🛡️ Quản Lý (Admin)';
    if (topbarAdminText) topbarAdminText.textContent = '🛡️ Quản Trị Viên';
    if (lockBadge) {
      lockBadge.textContent = '🔒 Bảo Mật';
      lockBadge.className = 'nav-badge glow';
    }
  }
}

// ==============================================================================
// USER AUTH SYSTEM (ĐĂNG KÝ / ĐĂNG NHẬP)
// ==============================================================================
function initAuthSession() {
  const savedUser = localStorage.getItem('viet_auth_user');
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
    } catch (e) {
      state.currentUser = state.users[0] || null;
    }
  } else {
    state.currentUser = state.users[0] || null;
  }
  updateUserUI();
  renderAllViews();
}

function initAuthHandlers() {
  // Switch Tabs in Auth Modal
  const tabLogin = document.getElementById('tabSwitchLogin');
  const tabRegister = document.getElementById('tabSwitchRegister');
  const formLogin = document.getElementById('formLoginView');
  const formRegister = document.getElementById('formRegisterView');
  const modalTitle = document.getElementById('authModalTitle');

  tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
    modalTitle.textContent = 'Đăng Nhập Tài Khoản';
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formLogin.style.display = 'none';
    formRegister.style.display = 'block';
    modalTitle.textContent = 'Đăng Ký Tài Khoản Mới';
  });

  document.getElementById('btnOpenAuthModal')?.addEventListener('click', () => openModal('modalAuth'));
  document.getElementById('btnCloseAuthModal')?.addEventListener('click', () => closeModal('modalAuth'));

  // Submit Login
  document.getElementById('btnSubmitLogin')?.addEventListener('click', handleUserLogin);
  document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserLogin();
  });

  // Submit Register
  document.getElementById('btnSubmitRegister')?.addEventListener('click', handleUserRegister);

  // Logout
  document.getElementById('btnLogoutUser')?.addEventListener('click', handleUserLogout);
}

async function handleUserLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!username || !password) {
    showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
    return;
  }

  // Gọi server nếu online
  if (state.isServerOnline) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        state.currentUser = data.user;
        localStorage.setItem('viet_auth_user', JSON.stringify(data.user));
        closeModal('modalAuth');
        updateUserUI();
        renderUserPortal();
        showToast(`Đăng nhập thành công! Chào ${data.user.username}`, 'success');
        return;
      } else {
        showToast(data.message || 'Sai thông tin đăng nhập!', 'error');
        return;
      }
    } catch (e) {}
  }

  // Fallback Local
  const found = state.users.find(u => 
    (u.username.toLowerCase() === username.toLowerCase() || (u.email && u.email.toLowerCase() === username.toLowerCase()))
  );

  if (found) {
    state.currentUser = found;
    localStorage.setItem('viet_auth_user', JSON.stringify(found));
    closeModal('modalAuth');
    updateUserUI();
    renderUserPortal();
    showToast(`Đăng nhập thành công! Chào mừng ${found.username}`, 'success');
  } else {
    showToast('Tài khoản không tồn tại hoặc sai mật khẩu!', 'error');
  }
}

async function handleUserRegister() {
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  if (!username || !password) {
    showToast('Vui lòng nhập tên tài khoản và mật khẩu!', 'error');
    return;
  }

  if (state.isServerOnline) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        state.currentUser = data.user;
        localStorage.setItem('viet_auth_user', JSON.stringify(data.user));
        closeModal('modalAuth');
        await syncDataFromServer();
        updateUserUI();
        showToast('Đăng ký tài khoản thành công!', 'success');
        return;
      } else {
        showToast(data.message || 'Đăng ký thất bại!', 'error');
        return;
      }
    } catch (e) {}
  }

  // Local Fallback
  const newUser = {
    id: `usr_${Date.now()}`,
    username,
    email,
    password,
    applicationId: 'app_viet_01',
    status: 'ACTIVE',
    hwid: 'HWID-PC-VIETNAM-882194',
    licenseKey: null,
    ipAddress: '127.0.0.1',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  state.users.unshift(newUser);
  state.currentUser = newUser;
  localStorage.setItem('viet_auth_user', JSON.stringify(newUser));
  saveStateToStorage();
  closeModal('modalAuth');
  updateUserUI();
  renderUserPortal();
  showToast('Đăng ký tài khoản thành công!', 'success');
}

function handleUserLogout() {
  state.currentUser = null;
  localStorage.removeItem('viet_auth_user');
  updateUserUI();
  showToast('Đã đăng xuất tài khoản.', 'info');
  openModal('modalAuth');
}

function updateUserUI() {
  const btnAuth = document.getElementById('btnOpenAuthModal');
  const userBox = document.getElementById('userProfileBox');
  const nameDisplay = document.getElementById('userNameDisplay');
  const roleDisplay = document.getElementById('userRoleDisplay');
  const avatar = document.getElementById('userAvatarText');

  if (state.currentUser) {
    if (btnAuth) btnAuth.style.display = 'none';
    if (userBox) userBox.style.display = 'flex';
    if (nameDisplay) nameDisplay.textContent = state.currentUser.username;
    if (roleDisplay) roleDisplay.textContent = state.currentUser.role || 'Thành Viên VIP';
    if (avatar) avatar.textContent = state.currentUser.username.substring(0, 2).toUpperCase();
  } else {
    if (btnAuth) btnAuth.style.display = 'inline-flex';
    if (userBox) userBox.style.display = 'none';
  }
}

// ==============================================================================
// REDEEM KEY (KÍCH HOẠT KEY VÀO TÀI KHOẢN KHÁCH)
// ==============================================================================
function initRedeemKeyHandlers() {
  document.getElementById('btnPortalRedeemKey')?.addEventListener('click', () => switchTab('redeem-key'));
  document.getElementById('btnSubmitRedeemKey')?.addEventListener('click', handleRedeemKey);
  document.getElementById('inputRedeemKey')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleRedeemKey();
  });
}

async function handleRedeemKey() {
  const keyInput = document.getElementById('inputRedeemKey');
  const alertBox = document.getElementById('redeemResultAlert');
  const key = (keyInput?.value || '').trim();
  const hwid = document.getElementById('inputRedeemHwid')?.value || 'HWID-PC-VIETNAM-882194';

  if (!key) {
    showToast('Vui lòng nhập mã key!', 'error');
    return;
  }

  // Gửi lên server
  if (state.isServerOnline) {
    try {
      const res = await fetch(`${API_BASE}/api/1.2/license/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license: key, hwid })
      });
      const data = await res.json();
      alertBox.style.display = 'block';

      if (data.success) {
        alertBox.innerHTML = `
          <div style="color:var(--green-success); font-weight:700;">
            🎉 Kích hoạt key thành công! Gói: ${data.data.subscriptionLevel} (${data.data.isLifetime ? 'Vĩnh viễn' : data.data.daysRemaining + ' ngày'})
          </div>
        `;
        if (state.currentUser) {
          state.currentUser.licenseKey = key;
          localStorage.setItem('viet_auth_user', JSON.stringify(state.currentUser));
        }
        await syncDataFromServer();
        renderUserPortal();
        showToast('Kích hoạt key bản quyền thành công!', 'success');
        return;
      } else {
        alertBox.innerHTML = `<div style="color:var(--red-danger); font-weight:700;">❌ Thất bại: ${data.message}</div>`;
        return;
      }
    } catch (e) {}
  }

  // Local fallback
  const lic = state.licenses.find(l => l.key.toUpperCase() === key.toUpperCase());
  alertBox.style.display = 'block';

  if (!lic) {
    alertBox.innerHTML = `<div style="color:var(--red-danger); font-weight:700;">❌ Mã key không tồn tại trên hệ thống!</div>`;
    return;
  }

  if (lic.status === 'BANNED') {
    alertBox.innerHTML = `<div style="color:var(--red-danger); font-weight:700;">❌ Key này đã bị khóa: ${lic.banReason || 'Vi phạm'}</div>`;
    return;
  }

  // Kích hoạt
  lic.status = 'ACTIVE';
  lic.hwid = hwid;
  lic.activatedAt = new Date().toISOString();
  if (lic.durationDays > 0) {
    const exp = new Date();
    exp.setDate(exp.getDate() + lic.durationDays);
    lic.expiresAt = exp.toISOString();
  }

  if (state.currentUser) {
    state.currentUser.licenseKey = lic.key;
    localStorage.setItem('viet_auth_user', JSON.stringify(state.currentUser));
  }

  saveStateToStorage();
  renderAllViews();

  alertBox.innerHTML = `
    <div style="color:var(--green-success); font-weight:700;">
      🎉 Kích hoạt key thành công! Gói: ${lic.subscriptionLevel || 'VIP'} (${lic.durationDays <= 0 ? 'Vĩnh viễn' : lic.durationDays + ' ngày'})
    </div>
  `;
  showToast('Kích hoạt bản quyền thành công!', 'success');
}

// ==============================================================================
// NAVIGATION & TABS
// ==============================================================================
function initNavigation() {
  document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      // Chỉ các tab thuộc Quản Trị Hệ Thống Cấp Cao mới yêu cầu mở khóa bằng key "thai"
      const masterAdminOnlyTabs = ['admin-dashboard', 'admin-users', 'admin-variables', 'admin-logs'];
      if (masterAdminOnlyTabs.includes(tab) && !state.isAdminUnlocked) {
        openModal('modalAdminKeyAuth');
        return;
      }
      switchTab(tab);
    });
  });

  document.getElementById('btnToggleSidebar')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('mobile-open');
  });

  document.getElementById('btnRefreshServer')?.addEventListener('click', async () => {
    showToast('Đang kiểm tra kết nối máy chủ...', 'info');
    await checkServerConnection();
    showToast(state.isServerOnline ? 'Máy chủ trực tuyến!' : 'Chạy chế độ trình duyệt cục bộ', state.isServerOnline ? 'success' : 'info');
  });
}

function switchTab(tabId) {
  state.currentTab = tabId;

  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === `pane-${tabId}`);
  });

  const titles = {
    'user-portal': { title: 'Trang Cá Nhân & Bản Quyền', sub: 'Quản lý tài khoản, tạo key, ứng dụng và kích hoạt key bản quyền' },
    'redeem-key': { title: 'Kích Hoạt Key Bản Quyền', sub: 'Nhập mã key bạn nhận được từ Admin để kích hoạt vào máy' },
    'api-tester': { title: 'Tài Liệu & Test API Trực Tiếp', sub: 'Tương thích 100% chuẩn API RESTful v1.2 (hỗ trợ C#, Python, C++, Android)' },
    'admin-apps': { title: 'Ứng Dụng Của Tôi (Apps)', sub: 'Tạo ứng dụng mới, lấy App ID (Public Key) và Secret Key để liên kết API vào tool' },
    'admin-licenses': { title: 'Quản Lý & Tạo Key Bản Quyền', sub: 'Tạo key cơ bản (1 ngày, 7 ngày, 30 ngày, vĩnh viễn), sao chép key, reset HWID cho khách' },
    'admin-dashboard': { title: '👑 Bảng Quản Trị Hệ Thống (Master Admin)', sub: 'Toàn quyền quản lý hệ thống key, ứng dụng, thành viên và máy chủ' },
    'admin-users': { title: 'Quản Lý Thành Viên (Users)', sub: 'Danh sách các tài khoản người dùng client đã đăng ký' },
    'admin-variables': { title: 'Biến Cấu Hình Từ Xa (Remote Variables)', sub: 'Cung cấp link update, phiên bản mới, thông báo bảo trì cho phần mềm' },
    'admin-logs': { title: 'Nhật Ký Hoạt Động (Audit Logs)', sub: 'Lịch sử gọi API, kích hoạt key, mở khóa admin và đăng nhập' }
  };

  if (titles[tabId]) {
    document.getElementById('pageTitle').textContent = titles[tabId].title;
    document.getElementById('pageSubtitle').textContent = titles[tabId].sub;
  }

  document.getElementById('sidebar')?.classList.remove('mobile-open');

  if (tabId === 'user-portal') renderUserPortal();
  if (tabId === 'admin-dashboard') renderAdminDashboard();
  if (tabId === 'admin-apps') renderApps();
  if (tabId === 'admin-licenses') renderLicenses();
  if (tabId === 'admin-users') renderUsers();
  if (tabId === 'admin-variables') renderVariables();
  if (tabId === 'admin-logs') renderLogs();
}

// ==============================================================================
// RENDERERS
// ==============================================================================
function renderAllViews() {
  updateBadges();
  renderUserPortal();
  renderAdminDashboard();
  renderApps();
  renderLicenses();
  renderUsers();
  renderVariables();
  renderLogs();
  populateAppDropdowns();
}

function updateBadges() {
  const elApps = document.getElementById('badgeAppsCount');
  const elKeys = document.getElementById('badgeKeysCount');
  const elUsers = document.getElementById('badgeUsersCount');
  if (elApps) elApps.textContent = state.apps.length;
  if (elKeys) elKeys.textContent = state.licenses.length;
  if (elUsers) elUsers.textContent = state.users.length;
}

// 1. RENDER USER PORTAL
function renderUserPortal() {
  const user = state.currentUser || { username: 'Khách', email: 'Chưa đăng nhập', licenseKey: null };
  const userCardEmail = document.getElementById('userCardEmail');
  const userCardHwid = document.getElementById('userCardHwid');
  const userActiveKeysCount = document.getElementById('userActiveKeysCount');
  const tbody = document.getElementById('userLicensesTableBody');

  if (userCardEmail) userCardEmail.textContent = user.email || 'user@vietauth.vn';
  if (userCardHwid) userCardHwid.textContent = user.hwid || 'HWID-PC-VIETNAM-882194';

  // Lấy các key thuộc về user này
  const myKeys = state.licenses.filter(l => l.key === user.licenseKey || l.hwid === user.hwid || l.status === 'ACTIVE');
  if (userActiveKeysCount) userActiveKeysCount.textContent = `${myKeys.length} Key`;

  if (tbody) {
    if (myKeys.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:24px;">Bạn chưa kích hoạt mã key nào. Hãy bấm "Kích Hoạt Key Mới" ở trên!</td></tr>';
    } else {
      tbody.innerHTML = myKeys.map(lic => {
        const app = state.apps.find(a => a.id === lic.applicationId) || { name: 'Tool VIP' };
        const remaining = lic.durationDays <= 0 ? 'Vĩnh Viễn (Lifetime)' : (lic.expiresAt ? calculateDaysRemaining(lic.expiresAt) + ' ngày' : lic.durationDays + ' ngày');
        return `
          <tr>
            <td><strong class="mono text-cyan">${lic.key}</strong></td>
            <td>${escapeHtml(app.name)}</td>
            <td><span class="level-badge vip">${lic.subscriptionLevel || 'VIP'}</span></td>
            <td><span class="text-green">${remaining}</span></td>
            <td><span class="status-pill active">Đang Hoạt Động</span></td>
            <td><span class="mono" style="font-size:0.75rem;">${lic.hwid || 'Chưa bind'}</span></td>
          </tr>
        `;
      }).join('');
    }
  }

  // Cập nhật số máy truy cập (Online Devices)
  const cutoff = Date.now() - 15 * 60 * 1000;
  const onlineDevices = (state.devices || []).filter(d => new Date(d.lastSeen).getTime() > cutoff);
  const userCardOnlineMachines = document.getElementById('userCardOnlineMachines');
  const userCardOnlineCount = document.getElementById('userCardOnlineCount');
  if (userCardOnlineMachines) userCardOnlineMachines.textContent = `${onlineDevices.length} Máy Online`;
  if (userCardOnlineCount) userCardOnlineCount.textContent = `🟢 ${onlineDevices.length} thiết bị đang hoạt động`;

  // Render bảng thiết bị online
  const devTbody = document.getElementById('userDevicesTableBody');
  if (devTbody) {
    if ((state.devices || []).length === 0) {
      devTbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:24px;">Chưa có thiết bị nào kết nối. Hãy khởi chạy tool hoặc test API để ghi nhận máy truy cập!</td></tr>';
    } else {
      devTbody.innerHTML = state.devices.map(d => {
        const isOnline = new Date(d.lastSeen).getTime() > cutoff;
        return `
          <tr>
            <td><strong class="mono text-cyan">${escapeHtml(d.hwid)}</strong></td>
            <td><span class="mono">${escapeHtml(d.ip || '127.0.0.1')}</span></td>
            <td><strong>${escapeHtml(d.appName || 'Tool')}</strong></td>
            <td><span class="mono text-muted">${escapeHtml(d.licenseKey || d.username || 'Khách')}</span></td>
            <td>
              <span class="status-pill ${isOnline ? 'active' : 'expired'}">
                ${isOnline ? '<span class="pulse-dot"></span> Online' : 'Offline'}
              </span>
            </td>
            <td>${formatDateTime(d.lastSeen)}</td>
            <td class="text-right">
              <button class="table-icon-btn hover-red" title="Ngắt kết nối thiết bị" onclick="disconnectDevice('${d.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Link tải update
  const updateVar = state.variables.find(v => v.name === 'UPDATE_URL');
  const btnDownload = document.getElementById('btnDownloadLatestTool');
  if (btnDownload && updateVar) {
    btnDownload.href = updateVar.value;
  }
}

// 2. RENDER ADMIN DASHBOARD
function renderAdminDashboard() {
  const totalApps = state.apps.length;
  const totalKeys = state.licenses.length;
  const activeKeys = state.licenses.filter(l => l.status === 'ACTIVE').length;
  const expiredKeys = state.licenses.filter(l => l.status === 'EXPIRED').length;
  const bannedKeys = state.licenses.filter(l => l.status === 'BANNED').length;
  const totalUsers = state.users.length;

  const cutoff = Date.now() - 15 * 60 * 1000;
  const onlineDevices = (state.devices || []).filter(d => new Date(d.lastSeen).getTime() > cutoff);

  const elApps = document.getElementById('statTotalApps');
  const elKeys = document.getElementById('statTotalKeys');
  const elActive = document.getElementById('statActiveRatio');
  const elExpBan = document.getElementById('statExpiredOrBanned');
  const elBanned = document.getElementById('statBannedCount');
  const elUsers = document.getElementById('statTotalUsers');
  const elOnline = document.getElementById('statOnlineDevices');
  const elTotalDev = document.getElementById('statTotalDevices');

  if (elApps) elApps.textContent = totalApps;
  if (elKeys) elKeys.textContent = totalKeys;
  if (elActive) elActive.textContent = `Active: ${activeKeys}`;
  if (elExpBan) elExpBan.textContent = expiredKeys + bannedKeys;
  if (elBanned) elBanned.textContent = `Banned: ${bannedKeys}`;
  if (elUsers) elUsers.textContent = totalUsers;
  if (elOnline) elOnline.textContent = `${onlineDevices.length} Máy`;
  if (elTotalDev) elTotalDev.textContent = `${onlineDevices.length} máy online / ${(state.devices || []).length} tổng`;

  // Recent logs in admin
  const logBox = document.getElementById('recentLogsContainer');
  if (logBox) {
    const recent = state.logs.slice(0, 5);
    logBox.innerHTML = recent.map(log => `
      <div class="log-item">
        <div class="log-item-left">
          <span class="log-badge ${log.result === 'SUCCESS' ? 'success' : 'fail'}">${log.result}</span>
          <span class="log-desc">${escapeHtml(log.details || log.action)}</span>
        </div>
        <span class="log-time">${formatDateTime(log.timestamp)}</span>
      </div>
    `).join('');
  }
}

// 3. RENDER APPS
function renderApps() {
  const container = document.getElementById('appsGridContainer');
  if (!container) return;

  const cutoff = Date.now() - 15 * 60 * 1000;

  container.innerHTML = state.apps.map(app => {
    const appKeys = state.licenses.filter(l => l.applicationId === app.id);
    const onlineForApp = (state.devices || []).filter(d => (d.appId === app.id || d.appId === app.appId) && new Date(d.lastSeen).getTime() > cutoff).length;

    return `
      <div class="app-card">
        <div class="app-card-header">
          <div>
            <h3 class="app-name">${escapeHtml(app.name)}</h3>
            <span class="app-platform-pill">${escapeHtml(app.platform || 'Windows')}</span>
            <span class="app-devices-pill" style="margin-left: 8px;"><span class="pulse-dot"></span> <strong>${onlineForApp}</strong> Máy Online</span>
          </div>
          <span class="app-version-tag">v${escapeHtml(app.version || '1.0')}</span>
        </div>
        <p class="app-desc-text">${escapeHtml(app.description || 'Không có mô tả')}</p>
        <div class="app-keys-box">
          <div class="key-row">
            <span class="key-label">App ID:</span>
            <div class="key-val-box">
              <span>${app.appId}</span>
              <button class="btn-copy-mini" onclick="copyText('${app.appId}', 'Đã copy App ID')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
          </div>
          <div class="key-row">
            <span class="key-label">Secret Key:</span>
            <div class="key-val-box">
              <span>${app.secretKey.substring(0, 10)}...</span>
              <button class="btn-copy-mini" onclick="copyText('${app.secretKey}', 'Đã copy Secret Key')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- TỰ ĐỘNG TẢI VỀ SDK GẮN SẴN KEY CHO ỨNG DỤNG NÀY -->
        <div style="margin: 12px 0 8px;">
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">📥 TỰ ĐỘNG TẢI SDK ĐÃ GẮN SẴN KEY CỦA APP NÀY:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            <button class="btn-download-app-sdk cpp" onclick="downloadAppSdk('${app.id}', 'cpp-auth')" title="Tải file auth.hpp chuẩn KeyAuth/LongAuth">
              📥 auth.hpp (C++)
            </button>
            <button class="btn-download-app-sdk cpp" onclick="downloadAppSdk('${app.id}', 'cpp-main')" title="Tải file main.cpp mẫu gọi auth">
              📥 main.cpp (C++)
            </button>
            <button class="btn-download-app-sdk" onclick="downloadAppSdk('${app.id}', 'csharp')" title="Tải file C# WinForms Client">
              📥 C# SDK
            </button>
            <button class="btn-download-app-sdk" onclick="downloadAppSdk('${app.id}', 'python')" title="Tải file Python Client">
              📥 Python SDK
            </button>
          </div>
        </div>

        <div class="app-card-actions">
          <button class="btn-primary" style="flex:1;" onclick="openCreateKeyForApp('${app.id}')">➕ Tạo Key Mới</button>
          <button class="btn-outline text-red" onclick="deleteApp('${app.id}')">Xóa</button>
        </div>
      </div>
    `;
  }).join('');
}

// 4. RENDER LICENSES
function renderLicenses() {
  const tbody = document.getElementById('licensesTableBody');
  const empty = document.getElementById('licensesEmptyState');
  if (!tbody) return;

  let list = state.licenses;
  if (state.filters.appId !== 'ALL') list = list.filter(l => l.applicationId === state.filters.appId);
  if (state.filters.status !== 'ALL') list = list.filter(l => l.status === state.filters.status);
  if (state.filters.search.trim()) {
    const q = state.filters.search.toLowerCase();
    list = list.filter(l => l.key.toLowerCase().includes(q) || (l.hwid && l.hwid.toLowerCase().includes(q)) || (l.notes && l.notes.toLowerCase().includes(q)));
  }

  if (list.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  tbody.innerHTML = list.map(lic => {
    const app = state.apps.find(a => a.id === lic.applicationId) || { name: 'Chưa rõ' };
    const remaining = lic.durationDays <= 0 ? 'Vĩnh Viễn' : (lic.expiresAt ? calculateDaysRemaining(lic.expiresAt) + ' ngày' : lic.durationDays + ' ngày');
    const statusClass = lic.status === 'ACTIVE' ? 'active' : (lic.status === 'BANNED' ? 'banned' : (lic.status === 'EXPIRED' ? 'expired' : 'unused'));

    return `
      <tr>
        <td>
          <div class="key-pill">
            <span>${lic.key}</span>
            <button class="btn-copy-mini" onclick="copyText('${lic.key}', 'Đã copy key')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
        </td>
        <td><strong>${escapeHtml(app.name)}</strong></td>
        <td><span class="level-badge vip">${lic.subscriptionLevel || 'VIP'}</span></td>
        <td>${remaining}</td>
        <td><span class="mono" style="font-size:0.75rem;">${lic.hwid || 'Chưa bind'}</span></td>
        <td><span class="status-pill ${statusClass}">${lic.status}</span></td>
        <td><span class="text-muted">${escapeHtml(lic.notes || '--')}</span></td>
        <td class="text-right">
          <div class="action-btn-group">
            <button class="table-icon-btn hover-blue" onclick="resetHwid('${lic.id}')" title="Reset HWID">🔄</button>
            <button class="table-icon-btn hover-blue" onclick="openExtendKeyModal('${lic.id}', '${lic.key}')" title="Gia hạn ngày">➕</button>
            ${lic.status === 'BANNED'
              ? `<button class="table-icon-btn hover-blue" onclick="unbanKey('${lic.id}')" title="Mở khóa">🔓</button>`
              : `<button class="table-icon-btn hover-red" onclick="banKeyPrompt('${lic.id}')" title="Khóa (Ban)">🚫</button>`
            }
            <button class="table-icon-btn hover-red" onclick="deleteLicense('${lic.id}')" title="Xóa key">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 5. RENDER USERS
function renderUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.users.map(u => `
    <tr>
      <td><strong>${escapeHtml(u.username)}</strong></td>
      <td>${escapeHtml(u.email || '--')}</td>
      <td><span class="mono text-cyan" style="font-size:0.8rem;">${escapeHtml(u.licenseKey || 'Chưa có')}</span></td>
      <td><span class="mono" style="font-size:0.75rem;">${escapeHtml(u.hwid || 'Chưa bind')}</span></td>
      <td><span class="mono">${escapeHtml(u.ipAddress || '127.0.0.1')}</span></td>
      <td><span class="status-pill active">${u.status || 'ACTIVE'}</span></td>
      <td class="text-right">
        <button class="table-icon-btn hover-red" onclick="deleteUser('${u.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// 6. RENDER VARIABLES
function renderVariables() {
  const tbody = document.getElementById('variablesTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.variables.map(v => `
    <tr>
      <td><strong class="mono text-cyan">${escapeHtml(v.name)}</strong></td>
      <td>Tool VIP</td>
      <td><span class="mono">${escapeHtml(v.value)}</span></td>
      <td>${v.isSecret ? '<span class="status-pill banned">Secret</span>' : '<span class="status-pill active">Public</span>'}</td>
      <td>${v.updatedAt ? v.updatedAt.substring(0, 10) : 'Live'}</td>
      <td class="text-right">
        <button class="table-icon-btn hover-red" onclick="deleteVariable('${v.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// 7. RENDER LOGS
function renderLogs() {
  const tbody = document.getElementById('logsTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.logs.map(log => `
    <tr>
      <td class="mono" style="font-size:0.78rem;">${formatDateTime(log.timestamp)}</td>
      <td><strong>${escapeHtml(log.action)}</strong></td>
      <td>${escapeHtml(log.user || 'admin')}</td>
      <td><span class="status-pill ${log.result === 'SUCCESS' ? 'active' : 'banned'}">${log.result}</span></td>
      <td><span class="text-muted">${escapeHtml(log.details || '--')}</span></td>
    </tr>
  `).join('');
}

function populateAppDropdowns() {
  const selects = ['filterAppSelect', 'genKeyAppSelect', 'varAppSelect'];
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const cur = el.value;
    let html = id === 'filterAppSelect' ? '<option value="ALL">-- Tất cả ứng dụng --</option>' : '';
    state.apps.forEach(a => html += `<option value="${a.id}">${escapeHtml(a.name)}</option>`);
    el.innerHTML = html;
    if (cur) el.value = cur;
  });
}

// ==============================================================================
// ADMIN ACTIONS (TẠO KEY, RESET HWID, BAN, GIA HẠN)
// ==============================================================================
function initAdminActions() {
  document.getElementById('filterAppSelect')?.addEventListener('change', (e) => {
    state.filters.appId = e.target.value;
    renderLicenses();
  });
  document.getElementById('filterStatusSelect')?.addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    renderLicenses();
  });
  document.getElementById('searchKeyInput')?.addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    renderLicenses();
  });

  document.getElementById('btnAdminOpenGenKey')?.addEventListener('click', () => openModal('modalCreateKey'));
  document.getElementById('btnOpenCreateKeyFromLicTab')?.addEventListener('click', () => openModal('modalCreateKey'));
  document.getElementById('btnPortalCreateKey')?.addEventListener('click', () => openModal('modalCreateKey'));
  document.getElementById('btnConfirmGenerateKeys')?.addEventListener('click', handleGenerateKeys);

  document.getElementById('btnAdminOpenCreateApp')?.addEventListener('click', () => openModal('modalCreateApp'));
  document.getElementById('btnCreateAppToolbar')?.addEventListener('click', () => openModal('modalCreateApp'));
  document.getElementById('btnPortalCreateApp')?.addEventListener('click', () => openModal('modalCreateApp'));
  document.getElementById('btnConfirmCreateApp')?.addEventListener('click', handleCreateApp);

  document.getElementById('btnOpenCreateVarModal')?.addEventListener('click', () => openModal('modalCreateVar'));
  document.getElementById('btnConfirmCreateVar')?.addEventListener('click', handleCreateVar);

  document.getElementById('btnExportKeysTxt')?.addEventListener('click', exportLicensesToTxt);
  document.getElementById('btnConfirmExtendKey')?.addEventListener('click', handleExtendKey);

  document.getElementById('btnQuickCheckSubmit')?.addEventListener('click', quickVerifyLicense);
}

async function handleGenerateKeys() {
  const appId = document.getElementById('genKeyAppSelect').value;
  const amount = parseInt(document.getElementById('genKeyAmount').value) || 1;
  const prefix = (document.getElementById('genKeyPrefix').value || 'VIET').trim().toUpperCase();
  const level = document.getElementById('genKeyLevel').value;
  const durationDays = parseInt(document.getElementById('genKeyDuration').value);
  const notes = document.getElementById('genKeyNotes').value.trim();

  if (state.isServerOnline) {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/licenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, amount, prefix, subscriptionLevel: level, durationDays, notes })
      });
      const data = await res.json();
      if (data.success && data.data) {
        closeModal('modalCreateKey');
        openGeneratedResultModal(data.data);
        await syncDataFromServer();
        showToast(`Tạo thành công ${data.data.length} key!`, 'success');
        return;
      }
    } catch (e) {}
  }

  // Local fallback
  const generated = [];
  const now = new Date().toISOString();
  for (let i = 0; i < amount; i++) {
    const k = `${prefix}-${level}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}`;
    state.licenses.unshift({
      id: `lic_${Date.now()}_${i}`,
      key: k,
      applicationId: appId,
      subscriptionLevel: level,
      durationDays: durationDays,
      status: 'UNUSED',
      hwid: null,
      hwidEnabled: true,
      activationLimit: 1,
      activationCount: 0,
      createdAt: now,
      activatedAt: null,
      expiresAt: null,
      lastUsedAt: null,
      notes: notes,
      banReason: null
    });
    generated.push(k);
  }

  saveStateToStorage();
  renderAllViews();
  closeModal('modalCreateKey');
  openGeneratedResultModal(generated);
  showToast(`Đã tạo thành công ${amount} key!`, 'success');
}

function openGeneratedResultModal(keys) {
  const modal = document.getElementById('modalGeneratedKeysResult');
  const ta = document.getElementById('textareaGeneratedKeys');
  if (ta) ta.value = keys.join('\n');
  if (modal) modal.classList.add('show');
}

async function handleCreateApp() {
  const name = document.getElementById('newAppName').value.trim();
  const version = document.getElementById('newAppVersion').value.trim() || '1.0.0';
  const platform = document.getElementById('newAppPlatform').value;
  const desc = document.getElementById('newAppDesc').value.trim();

  if (!name) return showToast('Vui lòng nhập tên ứng dụng!', 'error');

  if (state.isServerOnline) {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, version, platform, description: desc })
      });
      const data = await res.json();
      if (data.success) {
        closeModal('modalCreateApp');
        await syncDataFromServer();
        showToast('Tạo ứng dụng thành công!', 'success');
        return;
      }
    } catch (e) {}
  }

  state.apps.unshift({
    id: `app_${Date.now()}`,
    name,
    appId: `app_pk_viet_${randomHex(12)}`,
    secretKey: `sk_live_viet_${randomHex(24)}`,
    version,
    platform,
    description: desc,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    usersCount: 0,
    licensesCount: 0
  });

  saveStateToStorage();
  renderAllViews();
  closeModal('modalCreateApp');
  showToast('Đã tạo ứng dụng thành công!', 'success');
}

async function handleCreateVar() {
  const appId = document.getElementById('varAppSelect').value;
  const name = document.getElementById('varNameInput').value.trim().toUpperCase();
  const val = document.getElementById('varValueInput').value;
  const isSecret = document.getElementById('varIsSecret').checked;

  if (!name) return showToast('Vui lòng nhập tên biến!', 'error');

  state.variables.unshift({
    id: `var_${Date.now()}`,
    applicationId: appId,
    name,
    value: val,
    isSecret,
    updatedAt: new Date().toISOString()
  });

  saveStateToStorage();
  renderVariables();
  closeModal('modalCreateVar');
  showToast('Đã lưu biến thành công!', 'success');
}

async function resetHwid(licId) {
  if (!confirm('Đặt lại HWID cho key này để khách kích hoạt trên máy mới?')) return;
  const lic = state.licenses.find(l => l.id === licId);
  if (lic) {
    lic.hwid = null;
    saveStateToStorage();
    renderLicenses();
    showToast('Đã đặt lại HWID thành công!', 'success');
  }
}

async function banKeyPrompt(licId) {
  const reason = prompt('Nhập lý do khóa key:', 'Vi phạm quy định');
  if (reason === null) return;
  const lic = state.licenses.find(l => l.id === licId);
  if (lic) {
    lic.status = 'BANNED';
    lic.banReason = reason;
    saveStateToStorage();
    renderAllViews();
    showToast('Đã khóa key!', 'error');
  }
}

async function unbanKey(licId) {
  const lic = state.licenses.find(l => l.id === licId);
  if (lic) {
    lic.status = lic.activatedAt ? 'ACTIVE' : 'UNUSED';
    lic.banReason = null;
    saveStateToStorage();
    renderAllViews();
    showToast('Đã mở khóa key!', 'success');
  }
}

let extendingId = null;
function openExtendKeyModal(licId, keyStr) {
  extendingId = licId;
  document.getElementById('extendTargetKeyLabel').textContent = keyStr;
  openModal('modalExtendKey');
}

async function handleExtendKey() {
  if (!extendingId) return;
  const days = parseInt(document.getElementById('extendDaysSelect').value) || 7;
  const lic = state.licenses.find(l => l.id === extendingId);
  if (lic) {
    lic.durationDays = (lic.durationDays || 0) + days;
    if (lic.expiresAt) {
      const cur = new Date(lic.expiresAt);
      cur.setDate(cur.getDate() + days);
      lic.expiresAt = cur.toISOString();
    }
    if (lic.status === 'EXPIRED') lic.status = 'ACTIVE';
    saveStateToStorage();
    renderAllViews();
    closeModal('modalExtendKey');
    showToast(`Đã gia hạn thêm ${days} ngày!`, 'success');
  }
}

async function deleteLicense(licId) {
  if (!confirm('Bạn có chắc muốn xóa key này?')) return;
  state.licenses = state.licenses.filter(l => l.id !== licId);
  saveStateToStorage();
  renderAllViews();
  showToast('Đã xóa key!', 'info');
}

async function deleteApp(appId) {
  if (!confirm('Xóa ứng dụng này?')) return;
  state.apps = state.apps.filter(a => a.id !== appId);
  saveStateToStorage();
  renderAllViews();
  showToast('Đã xóa app!', 'info');
}

async function deleteUser(uId) {
  if (!confirm('Xóa người dùng này?')) return;
  state.users = state.users.filter(u => u.id !== uId);
  saveStateToStorage();
  renderUsers();
  showToast('Đã xóa user!', 'info');
}

async function deleteVariable(vId) {
  if (!confirm('Xóa biến này?')) return;
  state.variables = state.variables.filter(v => v.id !== vId);
  saveStateToStorage();
  renderVariables();
  showToast('Đã xóa biến!', 'info');
}

function quickVerifyLicense() {
  const input = document.getElementById('inputQuickCheckKey');
  const resBox = document.getElementById('quickCheckResultBox');
  const key = (input?.value || '').trim();

  if (!key) return showToast('Nhập mã key!', 'error');
  const lic = state.licenses.find(l => l.key.toUpperCase() === key.toUpperCase());
  resBox.style.display = 'block';

  if (!lic) {
    resBox.innerHTML = `<span class="text-red">❌ Key không tồn tại!</span>`;
    return;
  }

  resBox.innerHTML = `
    <div>
      <strong class="mono text-cyan">${lic.key}</strong> | Trạng thái: <strong class="text-green">${lic.status}</strong><br>
      Gói: ${lic.subscriptionLevel || 'VIP'} | Hạn: ${lic.expiresAt ? lic.expiresAt.substring(0, 10) : 'Vĩnh viễn'}<br>
      HWID: <span class="mono">${lic.hwid || 'Chưa bind'}</span>
    </div>
  `;
}

function exportLicensesToTxt() {
  if (state.licenses.length === 0) return showToast('Không có key để xuất!', 'info');
  const lines = [
    '======================================================================',
    '                 DANH SÁCH KEY BẢN QUYỀN - VIET AUTH                  ',
    '======================================================================',
    ''
  ];
  state.licenses.forEach((l, i) => {
    lines.push(`[${i+1}] KEY: ${l.key} | GÓI: ${l.subscriptionLevel} | TRẠNG THÁI: ${l.status} | HWID: ${l.hwid || 'Chưa bind'}`);
  });
  downloadFile(`VIET_AUTH_KEYS_${Date.now()}.txt`, lines.join('\n'));
  showToast('Đã xuất file TXT thành công!', 'success');
}

// ==============================================================================
// SERVER CONNECTION
// ==============================================================================
async function checkServerConnection() {
  const dot = document.getElementById('serverStatusDot');
  const txt = document.getElementById('serverStatusText');
  const latency = document.getElementById('serverLatencyText');

  const start = Date.now();
  try {
    const res = await fetch(`${API_BASE}/api/1.2/status`, { signal: AbortSignal.timeout(3000) });
    const ping = Date.now() - start;
    if (res.ok) {
      state.isServerOnline = true;
      dot.style.background = 'var(--green-success)';
      txt.textContent = 'Server: Trực Tuyến (Render/Local)';
      latency.textContent = `Ping: ${ping} ms`;
      await syncDataFromServer();
      return;
    }
  } catch (e) {}

  state.isServerOnline = false;
  dot.style.background = 'var(--yellow-warning)';
  txt.textContent = 'Trình Duyệt: Offline (Sẵn Sàng)';
  latency.textContent = 'Chế độ Cục Bộ';
}

async function syncDataFromServer() {
  try {
    const [apps, lics, users, vars, logs, devs] = await Promise.all([
      fetch(`${API_BASE}/api/dashboard/apps`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/api/dashboard/licenses`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/api/dashboard/users`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/api/dashboard/variables`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/api/dashboard/logs`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/api/devices`).then(r => r.json()).catch(() => ({}))
    ]);
    if (apps.data) state.apps = apps.data;
    if (lics.data) state.licenses = lics.data;
    if (users.data) state.users = users.data;
    if (vars.data) state.variables = vars.data;
    if (logs.data) state.logs = logs.data;
    if (devs.data) state.devices = devs.data;
    saveStateToStorage();
    renderAllViews();
  } catch (e) {}
}

// ==============================================================================
// API TESTER (HỖ TRỢ CẢ REST & CHUẨN KEYAUTH / LONGAUTH)
// ==============================================================================
function initApiTester() {
  document.getElementById('btnExecuteTestApi')?.addEventListener('click', async () => {
    const endpointType = document.getElementById('testApiEndpoint')?.value || 'client-login';
    const key = document.getElementById('testLicenseKey').value.trim();
    const hwid = document.getElementById('testHwid').value.trim();
    const appId = document.getElementById('testAppId').value.trim();
    const pre = document.getElementById('testResponseJson');
    const badge = document.querySelector('.api-endpoint-text');
    const start = performance.now();

    try {
      let resData = null;
      let targetPath = '/api/v1/client/login';

      if (endpointType === 'client-init') {
        targetPath = '/api/v1/client/init';
        if (badge) badge.textContent = targetPath;
        if (state.isServerOnline) {
          const res = await fetch(`${API_BASE}${targetPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-app-id': appId },
            body: JSON.stringify({ appId, hwid })
          });
          resData = await res.json();
        } else {
          const app = state.apps.find(a => a.appId === appId || a.id === appId) || state.apps[0];
          resData = {
            success: true,
            message: "Initialized",
            version: app ? app.version : "1.0.0",
            token: "tok_" + randomHex(16),
            numOnlineUsers: "3",
            numUsers: String(state.users.length),
            numKeys: String(state.licenses.length),
            app: { name: app ? app.name : "Tool VIP", version: app ? app.version : "1.0.0", numOnlineUsers: "3" }
          };
        }
      } 
      else if (endpointType === 'client-login') {
        targetPath = '/api/v1/client/login';
        if (badge) badge.textContent = targetPath;
        if (state.isServerOnline) {
          const res = await fetch(`${API_BASE}${targetPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-app-id': appId },
            body: JSON.stringify({ key, hwid, appId })
          });
          resData = await res.json();
        } else {
          const lic = state.licenses.find(l => l.key.toUpperCase() === key.toUpperCase());
          if (lic) {
            lic.status = 'ACTIVE';
            lic.hwid = hwid;
            lic.lastUsedAt = new Date().toISOString();
            // Cập nhật hoặc thêm thiết bị online
            recordLocalDevice(appId, hwid, '127.0.0.1', lic.key, 'KeyClient');
            saveStateToStorage();
            renderAllViews();
            resData = {
              success: true,
              message: "License login successful",
              token: "tok_" + randomHex(16),
              expiresAt: lic.expiresAt || "2099-12-31T23:59:59Z",
              subscription: lic.subscriptionLevel || "VIP",
              hwid: lic.hwid,
              numOnlineUsers: String((state.devices || []).length)
            };
          } else {
            resData = { success: false, error: "Mã key bản quyền không tồn tại trên hệ thống!" };
          }
        }
      }
      else if (endpointType === 'client-check') {
        targetPath = '/api/v1/client/check';
        if (badge) badge.textContent = targetPath;
        if (state.isServerOnline) {
          const res = await fetch(`${API_BASE}${targetPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-app-id': appId },
            body: JSON.stringify({ appId, hwid })
          });
          resData = await res.json();
        } else {
          recordLocalDevice(appId, hwid, '127.0.0.1', null, 'ActiveCheck');
          saveStateToStorage();
          renderAllViews();
          resData = { success: true, message: "Session valid", numOnlineUsers: String((state.devices || []).length) };
        }
      }
      else if (endpointType === 'devices') {
        targetPath = `/api/devices?appId=${encodeURIComponent(appId)}`;
        if (badge) badge.textContent = '/api/devices';
        if (state.isServerOnline) {
          const res = await fetch(`${API_BASE}${targetPath}`);
          resData = await res.json();
        } else {
          resData = { success: true, onlineCount: state.devices.length, totalCount: state.devices.length, data: state.devices };
        }
      }
      else {
        // Fallback REST cũ (verify, status, variable)
        targetPath = '/api/1.2/license/verify';
        if (badge) badge.textContent = targetPath;
        if (state.isServerOnline) {
          const res = await fetch(`${API_BASE}${targetPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ license: key, hwid, appId })
          });
          resData = await res.json();
        } else {
          const lic = state.licenses.find(l => l.key.toUpperCase() === key.toUpperCase());
          resData = lic
            ? { success: true, message: "Xác thực bản quyền thành công!", data: { key: lic.key, status: lic.status, level: lic.subscriptionLevel, hwid: lic.hwid || hwid } }
            : { success: false, message: "Mã key không tồn tại!" };
        }
      }

      pre.textContent = JSON.stringify(resData, null, 2);
      document.getElementById('testResponseTime').textContent = `${Math.round(performance.now() - start)} ms`;
      document.getElementById('testStatusCode').textContent = resData.success ? '200 OK' : '400 Error';
      document.getElementById('testStatusCode').className = `status-code ${resData.success ? 'success' : 'danger'}`;
    } catch (e) {
      pre.textContent = JSON.stringify({ error: e.message }, null, 2);
    }
  });
}

function recordLocalDevice(appId, hwid, ip, licenseKey, username) {
  state.devices = state.devices || [];
  const now = new Date().toISOString();
  let dev = state.devices.find(d => (hwid && d.hwid === hwid) || (!hwid && d.ip === ip));
  const app = state.apps.find(a => a.id === appId || a.appId === appId);
  const appName = app ? app.name : 'Tool VIP';

  if (dev) {
    dev.lastSeen = now;
    dev.status = 'ONLINE';
    if (licenseKey) dev.licenseKey = licenseKey;
  } else {
    state.devices.unshift({
      id: `dev_${Date.now()}`,
      hwid: hwid || 'HWID-CLIENT-AUTO',
      ip: ip || '127.0.0.1',
      appId: app ? app.id : appId,
      appName: appName,
      licenseKey: licenseKey || '',
      username: username || 'Khách',
      status: 'ONLINE',
      firstConnected: now,
      lastSeen: now
    });
  }
}

async function disconnectDevice(devId) {
  if (!confirm('Bạn có chắc muốn ngắt kết nối và xóa phiên của máy này?')) return;
  if (state.isServerOnline) {
    try {
      await fetch(`${API_BASE}/api/devices?id=${devId}`, { method: 'DELETE' });
    } catch (e) {}
  }
  state.devices = (state.devices || []).filter(d => d.id !== devId);
  saveStateToStorage();
  renderAllViews();
  showToast('Đã ngắt kết nối thiết bị thành công!', 'info');
}

// ==============================================================================
// TỰ ĐỘNG SINH CODE SDK & TẢI VỀ FILE CHO APP
// ==============================================================================
function getTargetAppForCode() {
  return state.apps[0] || {
    name: "Tool VIP Pro 2026",
    appId: "app_pk_viet_9a8b7c6d5e4f",
    secretKey: "sk_live_viet_849203847291039482",
    version: "1.0.0"
  };
}

function generateCppAuthHpp(app) {
  return `// VietAuth & LongAuth C++ KeyAuth-compatible auth.hpp.
// Drop this file in place of the old KeyAuth auth.hpp, then keep your old calls:
//   KeyAuth::api KeyAuthApp(name, ownerid, version, url, path);
// Mapping:
//   name    = "${app.name}"
//   ownerid = "${app.appId}"
//   version = "${app.version || '1.0.0'}"
//   url     = "${API_BASE}"
//   path    = "${app.secretKey}"
//
// Requires libcurl + OpenSSL.
// Visual Studio: Link libcurl.lib + libssl.lib + libcrypto.lib
// MinGW / GCC:   g++ main.cpp -lcurl -lcrypto -o app
#pragma once

#include <string>
#include <ctime>
#include <cstdio>
#include <random>
#include <sstream>
#include <iomanip>
#include <vector>
#include <cstdlib>
#ifdef _WIN32
#include <windows.h>
#endif
#include <curl/curl.h>
#include <openssl/hmac.h>

struct channel_struct {
    std::string author;
    std::string message;
    std::string timestamp;
};

namespace LongAuthCompatInternal {
static size_t writeCb(void* p, size_t s, size_t n, void* up) {
    ((std::string*)up)->append((char*)p, s * n); return s * n;
}

static std::string hmacHex(const std::string& key, const std::string& msg) {
    unsigned char* d; unsigned int len;
    d = HMAC(EVP_sha256(), key.data(), key.size(),
             (unsigned char*)msg.data(), msg.size(), nullptr, &len);
    std::ostringstream o;
    for (unsigned int i = 0; i < len; i++) o << std::hex << std::setw(2) << std::setfill('0') << (int)d[i];
    return o.str();
}

static std::string nonce() {
    return std::to_string((unsigned long long)time(nullptr)) + std::to_string((unsigned long long)rand());
}

static std::string jsonEscape(const std::string& s) {
    std::string out;
    for (char ch : s) {
        if (ch == '\\\\') out += "\\\\\\\\";
        else if (ch == '"') out += "\\\\\\"";
        else if (ch == '\\n') out += "\\\\n";
        else if (ch == '\\r') out += "\\\\r";
        else if (ch == '\\t') out += "\\\\t";
        else out += ch;
    }
    return out;
}

static bool successTrue(const std::string& body) {
    std::string compact;
    for (char ch : body) if (ch != ' ' && ch != '\\n' && ch != '\\r' && ch != '\\t') compact += ch;
    return compact.find("\\"success\\":true") != std::string::npos;
}

static std::string extractString(const std::string& body, const std::string& key) {
    const std::string needle = "\\"" + key + "\\"";
    auto pos = body.find(needle);
    if (pos == std::string::npos) return "";
    pos = body.find(':', pos + needle.size());
    if (pos == std::string::npos) return "";
    pos = body.find('"', pos + 1);
    if (pos == std::string::npos) return "";
    std::string out;
    bool esc = false;
    for (++pos; pos < body.size(); ++pos) {
        char ch = body[pos];
        if (esc) { out += ch; esc = false; }
        else if (ch == '\\\\') esc = true;
        else if (ch == '"') break;
        else out += ch;
    }
    return out;
}

static std::string isoUtcToUnixSeconds(const std::string& iso) {
    if (iso.empty()) return "";
    int year = 0, month = 0, day = 0, hour = 0, minute = 0, second = 0;
    if (std::sscanf(iso.c_str(), "%d-%d-%dT%d:%d:%d", &year, &month, &day, &hour, &minute, &second) != 6) {
        return "";
    }
    std::tm utc{};
    utc.tm_year = year - 1900;
    utc.tm_mon = month - 1;
    utc.tm_mday = day;
    utc.tm_hour = hour;
    utc.tm_min = minute;
    utc.tm_sec = second;
    utc.tm_isdst = 0;
#ifdef _WIN32
    std::time_t unixSeconds = _mkgmtime(&utc);
#else
    std::time_t unixSeconds = timegm(&utc);
#endif
    if (unixSeconds == (std::time_t)-1) return "";
    return std::to_string((long long)unixSeconds);
}

static long long parseUnixSeconds(const std::string& value) {
    if (value.empty()) return 0;
    char* end = nullptr;
    const long long parsed = std::strtoll(value.c_str(), &end, 10);
    if (!end || *end != '\\0' || parsed <= 0) return 0;
    return parsed;
}

static std::string formatRemainingSeconds(long long seconds) {
    if (seconds <= 0) return "EXPIRED";
    const long long days = seconds / 86400;
    const long long hours = (seconds % 86400) / 3600;
    const long long minutes = (seconds % 3600) / 60;
    char out[32] = {};
    if (days > 0) {
        std::snprintf(out, sizeof(out), "%lldD %lldH", days, hours);
    } else if (hours > 0) {
        std::snprintf(out, sizeof(out), "%lldH %lldM", hours, minutes);
    } else {
        std::snprintf(out, sizeof(out), "%lldM", minutes);
    }
    return out;
}

static std::string defaultHwid() {
#ifdef _WIN32
    char computer[256] = {};
    unsigned long size = sizeof(computer);
    GetComputerNameA(computer, &size);
    return std::string(computer);
#else
    return "desktop-client";
#endif
}
}

namespace KeyAuth {

class api {
public:
    std::string name, ownerid, version, url, path;

    class subscriptions_class {
    public:
        std::string name;
        std::string expiry;
    };

    class userdata {
    public:
        std::string username;
        std::string ip;
        std::string hwid;
        std::string createdate;
        std::string lastlogin;
        std::vector<subscriptions_class> subscriptions;
    };

    class appdata {
    public:
        std::string numUsers;
        std::string numOnlineUsers;
        std::string numKeys;
        std::string version;
        std::string customerPanelLink;
    };

    class responsedata {
    public:
        std::vector<channel_struct> channeldata;
        bool success{};
        std::string message;
        bool isPaid{};
    };

    userdata user_data;
    appdata app_data;
    responsedata response;

    api(std::string name, std::string ownerid, std::string version, std::string url, std::string path)
        : name(name), ownerid(ownerid), version(version), url(url), path(path) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
    }

    ~api() {
        curl_global_cleanup();
    }

    long long expiryUnixSeconds() const {
        if (user_data.subscriptions.empty()) return 0;
        return LongAuthCompatInternal::parseUnixSeconds(user_data.subscriptions[0].expiry);
    }

    long long expiryRemainingSeconds() const {
        const long long expiry = expiryUnixSeconds();
        if (expiry <= 0) return -1;
        const long long remaining = expiry - (long long)std::time(nullptr);
        return remaining > 0 ? remaining : 0;
    }

    bool isExpired() const {
        return expiryUnixSeconds() > 0 && expiryRemainingSeconds() == 0;
    }

    std::string expiryLabel() const {
        const long long remaining = expiryRemainingSeconds();
        if (remaining < 0) return "N/A";
        return LongAuthCompatInternal::formatRemainingSeconds(remaining);
    }

    void init() {
        std::string body = send("/init", "{}", true);
        apply(body, "Initialized");
        if (response.success) {
            app_data.version = LongAuthCompatInternal::extractString(body, "version");
            app_data.numOnlineUsers = LongAuthCompatInternal::extractString(body, "numOnlineUsers");
            app_data.numUsers = LongAuthCompatInternal::extractString(body, "numUsers");
            app_data.numKeys = LongAuthCompatInternal::extractString(body, "numKeys");
        }
    }

    void license(std::string key) {
        std::string hwid = LongAuthCompatInternal::defaultHwid();
        std::string raw = "{\\"key\\":\\"" + LongAuthCompatInternal::jsonEscape(key) + "\\",\\"hwid\\":\\"" + LongAuthCompatInternal::jsonEscape(hwid) + "\\"}";
        std::string body = send("/login", raw, true);
        apply(body, "License login successful");
        if (response.success) fillUser("license", hwid, body);
    }

    void login(std::string username, std::string password) {
        std::string hwid = LongAuthCompatInternal::defaultHwid();
        std::string raw = "{\\"username\\":\\"" + LongAuthCompatInternal::jsonEscape(username) + "\\",\\"password\\":\\"" + LongAuthCompatInternal::jsonEscape(password) + "\\",\\"hwid\\":\\"" + LongAuthCompatInternal::jsonEscape(hwid) + "\\"}";
        std::string body = send("/login-user", raw, true);
        apply(body, "Login successful");
        if (response.success) fillUser(username, hwid, body);
    }

    void regstr(std::string username, std::string password, std::string key, std::string email = "") {
        (void)email;
        std::string hwid = LongAuthCompatInternal::defaultHwid();
        std::string raw = "{\\"key\\":\\"" + LongAuthCompatInternal::jsonEscape(key) + "\\",\\"username\\":\\"" + LongAuthCompatInternal::jsonEscape(username) + "\\",\\"password\\":\\"" + LongAuthCompatInternal::jsonEscape(password) + "\\",\\"hwid\\":\\"" + LongAuthCompatInternal::jsonEscape(hwid) + "\\"}";
        std::string body = send("/register", raw, true);
        apply(body, "Registered");
        if (response.success) login(username, password);
    }

    void check(bool check_paid = false) {
        (void)check_paid;
        std::string body = send("/check", "{}", true);
        apply(body, "Session valid");
    }

    std::string var(std::string varid) { return getvar(varid); }
    std::string getvar(std::string var) {
        std::string body = send("/variables", "", false);
        apply(body, "Variables loaded");
        const std::string quoted = "\\"" + var + "\\"";
        auto pos = body.find(quoted);
        if (pos == std::string::npos) return "";
        auto valuePos = body.find("\\"value\\"", pos);
        if (valuePos == std::string::npos) return "";
        return LongAuthCompatInternal::extractString(body.substr(valuePos), "value");
    }

    void logout() { token.clear(); user_data = userdata{}; response.success = true; response.message = "Logged out"; }
    std::string fetchonline() { return app_data.numOnlineUsers; }

private:
    std::string token;

    std::string send(const std::string& apiPath, const std::string& raw, bool post) {
        std::string ts = std::to_string(time(nullptr));
        std::string n = LongAuthCompatInternal::nonce();
        std::string sig = LongAuthCompatInternal::hmacHex(path, ts + "." + n + "." + raw);
        std::string resp;
        CURL* c = curl_easy_init();
        struct curl_slist* h = nullptr;
        h = curl_slist_append(h, "Content-Type: application/json");
        h = curl_slist_append(h, ("x-app-id: " + ownerid).c_str());
        h = curl_slist_append(h, ("x-timestamp: " + ts).c_str());
        h = curl_slist_append(h, ("x-nonce: " + n).c_str());
        h = curl_slist_append(h, ("x-signature: " + sig).c_str());
        if (!token.empty()) h = curl_slist_append(h, ("Authorization: Bearer " + token).c_str());
        std::string base = url;
        while (!base.empty() && base.back() == '/') base.pop_back();
        curl_easy_setopt(c, CURLOPT_URL, (base + "/api/v1/client" + apiPath).c_str());
        curl_easy_setopt(c, CURLOPT_HTTPHEADER, h);
        if (post) curl_easy_setopt(c, CURLOPT_POSTFIELDS, raw.c_str());
        curl_easy_setopt(c, CURLOPT_WRITEFUNCTION, LongAuthCompatInternal::writeCb);
        curl_easy_setopt(c, CURLOPT_WRITEDATA, &resp);
        curl_easy_setopt(c, CURLOPT_TIMEOUT, 10L);
        curl_easy_setopt(c, CURLOPT_SSL_VERIFYPEER, 0L);
        curl_easy_perform(c);
        curl_slist_free_all(h); curl_easy_cleanup(c);
        std::string t = LongAuthCompatInternal::extractString(resp, "token");
        if (!t.empty()) token = t;
        return resp;
    }

    void apply(const std::string& body, const std::string& okMessage) {
        response.success = LongAuthCompatInternal::successTrue(body);
        response.isPaid = response.success;
        response.message = response.success ? okMessage : LongAuthCompatInternal::extractString(body, "error");
        if (response.message.empty()) response.message = LongAuthCompatInternal::extractString(body, "message");
        if (response.message.empty()) response.message = response.success ? okMessage : "Request failed";
    }

    void fillUser(const std::string& username, const std::string& hwid, const std::string& body) {
        user_data.username = username;
        user_data.hwid = hwid;
        user_data.lastlogin = std::to_string(time(nullptr));
        if (user_data.createdate.empty()) user_data.createdate = user_data.lastlogin;
        const std::string expiresAt = LongAuthCompatInternal::extractString(body, "expiresAt");
        const std::string expiry = LongAuthCompatInternal::isoUtcToUnixSeconds(expiresAt);
        if (user_data.subscriptions.empty()) {
            subscriptions_class sub;
            sub.name = "default";
            user_data.subscriptions.push_back(sub);
        }
        user_data.subscriptions[0].name = "default";
        user_data.subscriptions[0].expiry = expiry;
    }
};

} // namespace KeyAuth`;
}

function generateCppMain(app) {
  return `// ==============================================================================
// VÍ DỤ TÍCH HỢP AUTH.HPP VÀO TOOL C++ (CHUẨN KEYAUTH / LONGAUTH)
// Biên dịch: g++ main.cpp -lcurl -lcrypto -o tool.exe
// ==============================================================================

#include <iostream>
#include <string>
#include "auth.hpp"

// KHỞI TẠO KEYAUTH VỚI THÔNG TIN ỨNG DỤNG CỦA BẠN:
const std::string APP_NAME      = "${app.name}";
const std::string APP_OWNERID   = "${app.appId}";
const std::string APP_VERSION   = "${app.version || '1.0.0'}";
const std::string APP_URL       = "${API_BASE}";
const std::string APP_SECRET    = "${app.secretKey}";

KeyAuth::api KeyAuthApp(APP_NAME, APP_OWNERID, APP_VERSION, APP_URL, APP_SECRET);

int main() {
    std::cout << "====================================================\\n";
    std::cout << "          " << APP_NAME << " - BẢN QUYỀN API        \\n";
    std::cout << "====================================================\\n\\n";

    // 1. Khởi tạo kết nối hệ thống
    std::cout << "[*] Dang ket noi toi he thong xac thuc..." << std::endl;
    KeyAuthApp.init();

    if (!KeyAuthApp.response.success) {
        std::cout << "[-] Loi khoi tao: " << KeyAuthApp.response.message << std::endl;
        system("pause");
        return 1;
    }

    std::cout << "[+] Ket noi may chu thanh cong!" << std::endl;
    std::cout << "[+] So may dang truy cap: " << KeyAuthApp.app_data.numOnlineUsers << " may online" << std::endl;

    // 2. Xác thực bản quyền bằng key
    std::string key;
    std::cout << "[?] Nhap ma key ban quyen: ";
    std::cin >> key;

    KeyAuthApp.license(key);

    if (!KeyAuthApp.response.success) {
        std::cout << "[-] Xac thuc that bai: " << KeyAuthApp.response.message << std::endl;
        system("pause");
        return 1;
    }

    std::cout << "[+] XAC THUC THANH CONG! Thoi han: " << KeyAuthApp.expiryLabel() << std::endl;
    std::cout << "[+] HWID May: " << KeyAuthApp.user_data.hwid << std::endl;

    // 3. Chạy tính năng chính
    std::cout << "\\n[SUCCESS] Chuc mung! Tool da san sang hoat dong.\\n";
    system("pause");
    return 0;
}`;
}

function generateCSharpClient(app) {
  return `// VIET AUTH C# CLIENT (CHUẨN REST & KEYAUTH)
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class VietAuthClient
{
    public static readonly string AppName = "${app.name}";
    public static readonly string AppId = "${app.appId}";
    public static readonly string BaseUrl = "${API_BASE}";
    private static readonly HttpClient http = new HttpClient();

    public static async Task<bool> VerifyLicense(string key)
    {
        string hwid = Environment.MachineName + "-" + Environment.UserName;
        var payload = new { key = key, hwid = hwid, appId = AppId };
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var response = await http.PostAsync($"{BaseUrl}/api/v1/client/login", content);
        string json = await response.Content.ReadAsStringAsync();
        return json.Contains("\\"success\\":true");
    }
}`;
}

function generatePythonClient(app) {
  return `# VIET AUTH PYTHON CLIENT
import requests, platform, uuid

APP_NAME = "${app.name}"
APP_ID = "${app.appId}"
BASE_URL = "${API_BASE}"

def verify_license(key):
    hwid = f"{platform.node()}-{uuid.getnode()}"
    url = f"{BASE_URL}/api/v1/client/login"
    payload = {"key": key, "hwid": hwid, "appId": APP_ID}
    headers = {"Content-Type": "application/json", "x-app-id": APP_ID}
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=10)
        data = res.json()
        if data.get("success"):
            print(f"[+] Xác thực thành công! Máy online: {data.get('numOnlineUsers', 1)}")
            return True
        else:
            print(f"[-] Thất bại: {data.get('error', 'Lỗi không xác định')}")
            return False
    except Exception as e:
        print(f"[-] Lỗi kết nối: {e}")
        return False

if __name__ == "__main__":
    k = input("Nhập mã key bản quyền: ")
    verify_license(k)`;
}

function downloadAppSdk(appId, lang) {
  const app = state.apps.find(a => a.id === appId) || state.apps[0] || getTargetAppForCode();

  if (lang === 'cpp' || lang === 'cpp-auth') {
    const content = generateCppAuthHpp(app);
    downloadFile('auth.hpp', content);
    showToast(`Đã tải xuống file auth.hpp cho "${app.name}"!`, 'success');
  } else if (lang === 'cpp-main') {
    const content = generateCppMain(app);
    downloadFile('main.cpp', content);
    showToast(`Đã tải xuống file main.cpp mẫu cho "${app.name}"!`, 'success');
  } else if (lang === 'csharp') {
    const content = generateCSharpClient(app);
    downloadFile('VietAuthClient.cs', content);
    showToast(`Đã tải xuống file VietAuthClient.cs cho "${app.name}"!`, 'success');
  } else if (lang === 'python') {
    const content = generatePythonClient(app);
    downloadFile('viet_auth_client.py', content);
    showToast(`Đã tải xuống file viet_auth_client.py cho "${app.name}"!`, 'success');
  }
}

function updateCodeSnippetDisplay() {
  const box = document.getElementById('codeSnippetBox');
  if (!box) return;

  const app = getTargetAppForCode();
  const lang = state.activeSdkLang || 'cpp-auth';

  if (lang === 'cpp-auth') {
    box.textContent = generateCppAuthHpp(app);
  } else if (lang === 'cpp-main') {
    box.textContent = generateCppMain(app);
  } else if (lang === 'csharp') {
    box.textContent = generateCSharpClient(app);
  } else if (lang === 'python') {
    box.textContent = generatePythonClient(app);
  } else if (lang === 'curl') {
    box.textContent = `// 1. KHỞI TẠO (INIT)
curl -X POST "${API_BASE}/api/v1/client/init" -H "Content-Type: application/json" -H "x-app-id: ${app.appId}" -d '{}'

// 2. ĐĂNG NHẬP BẰNG KEY (LOGIN)
curl -X POST "${API_BASE}/api/v1/client/login" -H "Content-Type: application/json" -H "x-app-id: ${app.appId}" -d '{"key":"VIET-VIP-8888-9999-AAAA","hwid":"HWID-PC-01"}'

// 3. KIỂM TRA MÁY TRUY CẬP (DEVICES)
curl -X GET "${API_BASE}/api/devices?appId=${app.appId}"`;
  }
}

function initCodeSnippets() {
  document.querySelectorAll('.lang-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.lang-tab').forEach(b => b.classList.remove('active'));
      t.classList.add('active');
      state.activeSdkLang = t.getAttribute('data-lang');
      updateCodeSnippetDisplay();
    });
  });

  state.activeSdkLang = 'cpp-auth';
  updateCodeSnippetDisplay();

  document.getElementById('btnCopyCodeSnippet')?.addEventListener('click', () => {
    copyText(document.getElementById('codeSnippetBox').textContent, 'Đã sao chép toàn bộ code!');
  });

  document.getElementById('btnDownloadSelectedSdk')?.addEventListener('click', () => {
    const app = getTargetAppForCode();
    downloadAppSdk(app.id, state.activeSdkLang || 'cpp-auth');
  });
}

function initModals() {
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-backdrop').classList.remove('show'));
  });
  document.querySelectorAll('.modal-backdrop').forEach(bd => {
    bd.addEventListener('click', (e) => {
      if (e.target === bd) bd.classList.remove('show');
    });
  });
}

function openModal(id) { document.getElementById(id)?.classList.add('show'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('show'); }

function openCreateKeyForApp(appId) {
  openModal('modalCreateKey');
  const sel = document.getElementById('genKeyAppSelect');
  if (sel) sel.value = appId;
}

function copyText(text, msg) {
  navigator.clipboard.writeText(text).then(() => showToast(msg || 'Đã sao chép!', 'success'));
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-text">${escapeHtml(msg)}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.remove(); }, 3200);
}

function downloadFile(name, content) {
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
  a.download = name;
  a.click();
}

function randomHex(len) {
  let o = '';
  const c = '0123456789ABCDEF';
  for (let i = 0; i < len; i++) o += c[Math.floor(Math.random() * c.length)];
  return o;
}

function calculateDaysRemaining(expStr) {
  if (!expStr) return 99999;
  const diff = new Date(expStr).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDateTime(str) {
  if (!str) return 'Live';
  try { return new Date(str).toLocaleString('vi-VN'); } catch (e) { return str; }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function addLocalLog(action, user, appId, result, details) {
  state.logs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action, user, applicationId: appId, result, details
  });
  if (state.logs.length > 300) state.logs.pop();
}
