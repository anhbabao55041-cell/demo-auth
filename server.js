/**
 * ==============================================================================
 * VIET AUTH SYSTEM - NODE.JS REST API & STATIC WEB SERVER
 * Tối ưu hóa 100% cho Render.com, Railway, Vercel, VPS Linux & Windows!
 * Chạy hoàn toàn bằng thư viện gốc của Node.js (ZERO EXTERNAL DEPENDENCIES)
 * ==============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const SCRIPT_DIR = __dirname;
const DATA_FILE = path.join(SCRIPT_DIR, 'data', 'database.json');

// KHỞI TẠO FILE DATABASE NẾU CHƯA CÓ
function initDatabase() {
  const dataDir = path.join(SCRIPT_DIR, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const defaultDb = {
      adminKey: "thai",
      admins: [
        {
          id: "admin_01",
          username: "admin",
          password: "thai",
          email: "admin@vietauth.vn",
          role: "SUPER_ADMIN",
          plan: "ENTERPRISE"
        }
      ],
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
          action: "SERVER_START",
          user: "system",
          applicationId: "SYSTEM",
          result: "SUCCESS",
          details: "Máy chủ VietAuth khởi động thành công trên Render/Node.js"
        }
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
  }
}

initDatabase();

function loadDatabase() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi đọc database.json:', err);
    return null;
  }
}

function saveDatabase(db) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Lỗi lưu database.json:', err);
  }
}

function addLog(action, user, appId, result, details) {
  const db = loadDatabase();
  if (!db) return;
  const newLog = {
    id: 'log_' + Math.random().toString(36).substring(2, 10),
    timestamp: new Date().toISOString(),
    action,
    user,
    applicationId: appId,
    result,
    details
  };
  db.logs = db.logs || [];
  db.logs.unshift(newLog);
  if (db.logs.length > 500) db.logs.pop();
  saveDatabase(db);
}

// QUẢN LÝ SỐ MÁY TRUY CẬP (ONLINE DEVICES / SESSIONS)
function recordDeviceActivity(db, appId, hwid, ip, licenseKey, username) {
  if (!hwid && !ip) return;
  db.devices = db.devices || [];
  const now = new Date().toISOString();
  let dev = db.devices.find(d => (hwid && d.hwid === hwid) || (!hwid && d.ip === ip));
  const app = (db.apps || []).find(a => a.id === appId || a.appId === appId);
  const appName = app ? app.name : 'Chung';

  if (dev) {
    dev.lastSeen = now;
    dev.status = 'ONLINE';
    if (appId) dev.appId = app ? app.id : appId;
    if (appName) dev.appName = appName;
    if (ip) dev.ip = ip;
    if (licenseKey) dev.licenseKey = licenseKey;
    if (username) dev.username = username;
  } else {
    dev = {
      id: 'dev_' + Math.random().toString(36).substring(2, 10),
      hwid: hwid || 'UNKNOWN_HWID',
      ip: ip || '127.0.0.1',
      appId: app ? app.id : (appId || ''),
      appName: appName,
      licenseKey: licenseKey || '',
      username: username || 'Khách',
      status: 'ONLINE',
      firstConnected: now,
      lastSeen: now
    };
    db.devices.unshift(dev);
    if (db.devices.length > 500) db.devices.pop();
  }
}

function getOnlineDeviceCount(db, appId = null) {
  db.devices = db.devices || [];
  const cutoff = Date.now() - 15 * 60 * 1000; // Trong vòng 15 phút là Online
  return db.devices.filter(d => {
    const isRecent = new Date(d.lastSeen).getTime() > cutoff;
    if (!isRecent) return false;
    if (appId && d.appId !== appId) return false;
    return true;
  }).length;
}

// MIME TYPES CHO STATIC FILES
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

// TẠO SERVER
const server = http.createServer((req, res) => {
  // CORS HEADERS CHO PHÉP CLIENT WEB VÀ TOOL GỌI TỰ DO
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // HÀM GỬI JSON RESPONSE
  const sendJson = (data, statusCode = 200) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };

  // ĐỌC REQUEST BODY
  let bodyChunks = [];
  req.on('data', chunk => bodyChunks.push(chunk));
  req.on('end', () => {
    let body = {};
    if (bodyChunks.length > 0) {
      try {
        const bodyStr = Buffer.concat(bodyChunks).toString('utf-8');
        if (bodyStr.trim()) body = JSON.parse(bodyStr);
      } catch (e) {}
    }

    // =========================================================================
    // 1. PHỤC VỤ STATIC FILES (HTML, CSS, JS)
    // =========================================================================
    if (method === 'GET' && !pathname.startsWith('/api/')) {
      let filePath = pathname === '/' || pathname === '/index.html'
        ? path.join(SCRIPT_DIR, 'index.html')
        : path.join(SCRIPT_DIR, pathname);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        return fs.createReadStream(filePath).pipe(res);
      } else {
        // Fallback về index.html cho SPA
        const indexPath = path.join(SCRIPT_DIR, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return fs.createReadStream(indexPath).pipe(res);
        }
      }
    }

    // =========================================================================
    // 2. AUTHENTICATION & ADMIN KEY VERIFICATION
    // =========================================================================
    
    // XÁC THỰC KEY ADMIN ("thai")
    if (pathname === '/api/auth/admin-verify' && method === 'POST') {
      const inputKey = (body.adminKey || body.key || '').trim().toLowerCase();
      const db = loadDatabase();
      const correctKey = (db.adminKey || 'thai').trim().toLowerCase();

      if (inputKey === correctKey) {
        addLog('ADMIN_UNLOCK_SUCCESS', 'admin', 'SYSTEM', 'SUCCESS', 'Admin đã mở khóa Bảng Quản Trị bằng Key');
        return sendJson({
          success: true,
          message: 'Xác thực Key Admin thành công! Đã mở khóa Bảng Quản Trị.',
          admin: {
            username: 'Admin Thai',
            role: 'SUPER_ADMIN',
            plan: 'ENTERPRISE'
          }
        });
      } else {
        addLog('ADMIN_UNLOCK_FAIL', 'anonymous', 'SYSTEM', 'FAIL', `Nhập sai Key Admin: ${inputKey}`);
        return sendJson({
          success: false,
          message: 'Mã Key Admin không chính xác! Vui lòng thử lại.'
        }, 403);
      }
    }

    // ĐĂNG NHẬP NGƯỜI DÙNG / ADMIN
    if (pathname === '/api/auth/login' && method === 'POST') {
      const username = (body.username || body.email || '').trim().toLowerCase();
      const password = (body.password || '').trim();
      const db = loadDatabase();

      // Kiểm tra xem có phải tài khoản admin không
      const admin = (db.admins || []).find(a => 
        (a.username.toLowerCase() === username || a.email.toLowerCase() === username) && a.password === password
      );

      if (admin) {
        addLog('ADMIN_LOGIN', admin.username, 'SYSTEM', 'SUCCESS', 'Admin đăng nhập thành công');
        return sendJson({
          success: true,
          role: 'ADMIN',
          token: 'token_adm_' + Math.random().toString(36).substring(2),
          user: {
            username: admin.username,
            email: admin.email,
            role: 'SUPER_ADMIN',
            plan: 'ENTERPRISE'
          }
        });
      }

      // Kiểm tra tài khoản thành viên (User)
      const user = (db.users || []).find(u => 
        (u.username.toLowerCase() === username || (u.email && u.email.toLowerCase() === username)) && u.password === password
      );

      if (user) {
        user.lastLogin = new Date().toISOString();
        saveDatabase(db);
        addLog('USER_LOGIN', user.username, user.applicationId || 'SYSTEM', 'SUCCESS', 'Người dùng đăng nhập thành công');
        return sendJson({
          success: true,
          role: 'USER',
          token: 'token_usr_' + Math.random().toString(36).substring(2),
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            licenseKey: user.licenseKey,
            status: user.status,
            role: 'USER'
          }
        });
      }

      return sendJson({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' }, 401);
    }

    // ĐĂNG KÝ TÀI KHOẢN NGƯỜI DÙNG MỚI
    if (pathname === '/api/auth/register' && method === 'POST') {
      const username = (body.username || '').trim();
      const email = (body.email || '').trim();
      const password = (body.password || '').trim();

      if (!username || !password) {
        return sendJson({ success: false, message: 'Vui lòng nhập tên tài khoản và mật khẩu!' }, 400);
      }

      const db = loadDatabase();
      db.users = db.users || [];

      const exists = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() || (email && u.email && u.email.toLowerCase() === email.toLowerCase()));
      if (exists) {
        return sendJson({ success: false, message: 'Tên tài khoản hoặc email này đã tồn tại!' }, 409);
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        username: username,
        email: email,
        password: password,
        applicationId: 'app_viet_01',
        status: 'ACTIVE',
        hwid: null,
        licenseKey: null,
        ipAddress: req.socket.remoteAddress || '127.0.0.1',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      db.users.unshift(newUser);
      saveDatabase(db);
      addLog('USER_REGISTER', username, 'SYSTEM', 'SUCCESS', 'Đăng ký tài khoản thành công');

      return sendJson({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: 'USER'
        }
      });
    }

    // =========================================================================
    // 3. CLIENT API v1.2 (DÀNH CHO TOOL / APP XÁC THỰC BẢN QUYỀN & HWID)
    // =========================================================================

    // STATUS HEALTH CHECK
    if (pathname === '/api/1.2/status' || pathname === '/api/status') {
      return sendJson({
        status: 'operational',
        service: 'VIET AUTH SYSTEM',
        version: '1.2',
        platform: 'Node.js Cloud / Render',
        timestamp: Math.floor(Date.now() / 1000)
      });
    }

    // XÁC THỰC BẢN QUYỀN KEY & KHÓA HWID
    if ((pathname === '/api/1.2/license/verify' || pathname === '/api/verify') && method === 'POST') {
      const db = loadDatabase();
      const licenseKey = (body.license || body.key || '').trim();
      const hwid = (body.hwid || '').trim();
      const appId = (body.appId || '').trim();

      if (!licenseKey) {
        return sendJson({ success: false, message: 'Vui lòng cung cấp mã key bản quyền!' }, 400);
      }

      const lic = (db.licenses || []).find(l => l.key.toUpperCase() === licenseKey.toUpperCase());
      if (!lic) {
        addLog('API_VERIFY_FAIL', 'Unknown', appId, 'FAIL', `Key không tồn tại: ${licenseKey}`);
        return sendJson({ success: false, message: 'Mã key bản quyền không tồn tại trên hệ thống!' }, 404);
      }

      if (lic.status === 'BANNED') {
        const reason = lic.banReason || 'Vi phạm chính sách';
        addLog('API_VERIFY_BANNED', lic.key, lic.applicationId, 'BANNED', `Key bị khóa: ${reason}`);
        return sendJson({ success: false, message: `Key bản quyền này đã bị khóa bởi Admin! Lý do: ${reason}` }, 403);
      }

      const now = new Date();

      // KÍCH HOẠT LẦN ĐẦU NẾU LÀ KEY "UNUSED"
      if (lic.status === 'UNUSED') {
        lic.status = 'ACTIVE';
        lic.activatedAt = now.toISOString();
        lic.activationCount = (lic.activationCount || 0) + 1;
        if (hwid) lic.hwid = hwid;
        if (lic.durationDays > 0) {
          const exp = new Date(now.getTime() + lic.durationDays * 24 * 60 * 60 * 1000);
          lic.expiresAt = exp.toISOString();
        } else {
          lic.expiresAt = null; // Vĩnh viễn
        }
        lic.lastUsedAt = now.toISOString();
        saveDatabase(db);

        addLog('API_ACTIVATE_KEY', lic.key, lic.applicationId, 'SUCCESS', `Kích hoạt key lần đầu với HWID: ${hwid}`);
        return sendJson({
          success: true,
          message: 'Kích hoạt bản quyền thành công lần đầu!',
          data: {
            key: lic.key,
            status: 'ACTIVE',
            subscriptionLevel: lic.subscriptionLevel,
            isLifetime: lic.durationDays <= 0,
            expiresAt: lic.expiresAt,
            daysRemaining: lic.durationDays <= 0 ? 99999 : lic.durationDays,
            hwid: lic.hwid
          }
        });
      }

      // NẾU ĐÃ ACTIVE: KIỂM TRA HẾT HẠN
      if (lic.status === 'ACTIVE') {
        if (lic.expiresAt) {
          const expDate = new Date(lic.expiresAt);
          if (now > expDate) {
            lic.status = 'EXPIRED';
            saveDatabase(db);
            addLog('API_EXPIRED', lic.key, lic.applicationId, 'EXPIRED', 'Key đã hết hạn');
            return sendJson({ success: false, message: 'Key bản quyền đã hết hạn sử dụng! Vui lòng gia hạn thêm.' }, 403);
          }
        }

        // KIỂM TRA KHÓA HWID
        if (lic.hwidEnabled && lic.hwid && hwid && lic.hwid !== hwid) {
          addLog('API_HWID_MISMATCH', lic.key, lic.applicationId, 'FAIL', `Lệch HWID: máy khách (${hwid}) != máy đã bind (${lic.hwid})`);
          return sendJson({
            success: false,
            message: 'Khóa HWID: Key này đã được liên kết với một máy tính khác! Vui lòng liên hệ Admin để reset HWID.'
          }, 403);
        }

        // Gắn HWID nếu chưa có
        if (!lic.hwid && hwid) lic.hwid = hwid;
        lic.lastUsedAt = now.toISOString();
        saveDatabase(db);

        let daysLeft = 99999;
        if (lic.expiresAt) {
          const diff = new Date(lic.expiresAt).getTime() - now.getTime();
          daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }

        addLog('API_VERIFY_SUCCESS', lic.key, lic.applicationId, 'SUCCESS', `Xác thực thành công key ${lic.key}`);
        return sendJson({
          success: true,
          message: 'Xác thực bản quyền thành công!',
          data: {
            key: lic.key,
            status: 'ACTIVE',
            subscriptionLevel: lic.subscriptionLevel,
            isLifetime: lic.durationDays <= 0,
            expiresAt: lic.expiresAt,
            daysRemaining: daysLeft,
            hwid: lic.hwid
          }
        });
      }

      return sendJson({ success: false, message: `Trạng thái key không hợp lệ (${lic.status})` }, 400);
    }

    // LẤY BIẾN TỪ XA (GET REMOTE VARIABLE)
    if (pathname === '/api/1.2/variable' && method === 'GET') {
      const varName = parsedUrl.query.name;
      const db = loadDatabase();
      const variable = (db.variables || []).find(v => v.name === varName && !v.isSecret);

      if (variable) {
        return sendJson({ success: true, name: variable.name, value: variable.value });
      } else {
        return sendJson({ success: false, message: 'Không tìm thấy biến cấu hình hoặc biến bị ẩn!' }, 404);
      }
    }

    // =========================================================================
    // 3.1 CHUẨN CLIENT API KEYAUTH & LONGAUTH COMPATIBLE (/api/v1/client/*)
    // Tương thích 100% với file auth.hpp của C++, C#, Python
    // =========================================================================

    // INIT (/api/v1/client/init)
    if (pathname === '/api/v1/client/init' && method === 'POST') {
      const db = loadDatabase();
      const reqAppId = req.headers['x-app-id'] || body.appId || parsedUrl.query.ownerid;
      const app = (db.apps || []).find(a => a.appId === reqAppId || a.id === reqAppId);

      if (!app) {
        return sendJson({ success: false, error: 'App ID không hợp lệ hoặc ứng dụng không tồn tại trên hệ thống!' }, 404);
      }

      const clientIp = req.socket.remoteAddress || '127.0.0.1';
      const hwid = body.hwid || req.headers['x-hwid'] || '';
      recordDeviceActivity(db, app.id, hwid, clientIp, null, 'Client Init');
      saveDatabase(db);

      const onlineUsers = getOnlineDeviceCount(db, app.id) || 1;
      const numUsers = (db.users || []).filter(u => u.applicationId === app.id).length || 1;
      const numKeys = (db.licenses || []).filter(l => l.applicationId === app.id).length || 1;
      const sessionToken = 'tok_' + crypto.randomBytes(16).toString('hex');

      return sendJson({
        success: true,
        message: 'Initialized',
        version: app.version || '1.0.0',
        token: sessionToken,
        numOnlineUsers: String(onlineUsers),
        numUsers: String(numUsers),
        numKeys: String(numKeys),
        app: {
          name: app.name,
          version: app.version || '1.0.0',
          numUsers: String(numUsers),
          numOnlineUsers: String(onlineUsers),
          numKeys: String(numKeys)
        }
      });
    }

    // LOGIN VỚI LICENSE KEY (/api/v1/client/login)
    if (pathname === '/api/v1/client/login' && method === 'POST') {
      const db = loadDatabase();
      const key = (body.key || body.license || '').trim();
      const hwid = (body.hwid || '').trim();
      const reqAppId = req.headers['x-app-id'] || body.appId;
      const clientIp = req.socket.remoteAddress || '127.0.0.1';

      if (!key) {
        return sendJson({ success: false, error: 'Vui lòng cung cấp mã key bản quyền!' }, 400);
      }

      const lic = (db.licenses || []).find(l => l.key.toUpperCase() === key.toUpperCase());
      if (!lic) {
        addLog('CLIENT_LOGIN_FAIL', 'Unknown', reqAppId, 'FAIL', `Key không tồn tại: ${key}`);
        return sendJson({ success: false, error: 'Mã key bản quyền không tồn tại trên hệ thống!' }, 404);
      }

      if (lic.status === 'BANNED') {
        const reason = lic.banReason || 'Vi phạm chính sách';
        addLog('CLIENT_LOGIN_BANNED', lic.key, lic.applicationId, 'BANNED', `Key bị khóa: ${reason}`);
        return sendJson({ success: false, error: `Key bản quyền đã bị khóa: ${reason}` }, 403);
      }

      const now = new Date();

      if (lic.status === 'UNUSED') {
        lic.status = 'ACTIVE';
        lic.activatedAt = now.toISOString();
        lic.activationCount = (lic.activationCount || 0) + 1;
        if (hwid) lic.hwid = hwid;
        if (lic.durationDays > 0) {
          const exp = new Date(now.getTime() + lic.durationDays * 24 * 60 * 60 * 1000);
          lic.expiresAt = exp.toISOString();
        } else {
          lic.expiresAt = null; // Vĩnh viễn
        }
      } else if (lic.status === 'ACTIVE') {
        if (lic.expiresAt && now > new Date(lic.expiresAt)) {
          lic.status = 'EXPIRED';
          saveDatabase(db);
          return sendJson({ success: false, error: 'Key bản quyền đã hết hạn sử dụng!' }, 403);
        }
        if (lic.hwidEnabled && lic.hwid && hwid && lic.hwid !== hwid) {
          addLog('CLIENT_HWID_MISMATCH', lic.key, lic.applicationId, 'FAIL', `Lệch HWID: ${hwid} != ${lic.hwid}`);
          return sendJson({ success: false, error: 'Khóa HWID: Key đã liên kết với máy tính khác! Vui lòng liên hệ Admin để reset HWID.' }, 403);
        }
        if (!lic.hwid && hwid) lic.hwid = hwid;
      }

      lic.lastUsedAt = now.toISOString();
      recordDeviceActivity(db, lic.applicationId, hwid, clientIp, lic.key, 'KeyClient');
      saveDatabase(db);

      const sessionToken = 'tok_' + crypto.randomBytes(16).toString('hex');
      addLog('CLIENT_LOGIN_SUCCESS', lic.key, lic.applicationId, 'SUCCESS', `Máy [${hwid || clientIp}] đăng nhập key thành công`);

      return sendJson({
        success: true,
        message: 'License login successful',
        token: sessionToken,
        expiresAt: lic.expiresAt || '2099-12-31T23:59:59Z',
        subscription: lic.subscriptionLevel || 'VIP',
        hwid: lic.hwid || hwid,
        createdate: lic.createdAt,
        numOnlineUsers: String(getOnlineDeviceCount(db, lic.applicationId))
      });
    }

    // LOGIN BẰNG USERNAME / PASSWORD (/api/v1/client/login-user)
    if (pathname === '/api/v1/client/login-user' && method === 'POST') {
      const db = loadDatabase();
      const username = (body.username || '').trim();
      const password = (body.password || '').trim();
      const hwid = (body.hwid || '').trim();
      const clientIp = req.socket.remoteAddress || '127.0.0.1';

      const user = (db.users || []).find(u => 
        (u.username.toLowerCase() === username.toLowerCase() || (u.email && u.email.toLowerCase() === username.toLowerCase())) &&
        u.password === password
      );

      if (!user) {
        return sendJson({ success: false, error: 'Sai tên đăng nhập hoặc mật khẩu!' }, 401);
      }

      if (user.status === 'BANNED') {
        const reason = user.banReason || 'Tài khoản này đã bị khóa bởi Admin!';
        return sendJson({ success: false, error: reason }, 403);
      }

      const now = new Date();

      // Kiểm tra hết hạn cho tài khoản
      if (user.expiresAt && now > new Date(user.expiresAt)) {
        user.status = 'EXPIRED';
        saveDatabase(db);
        return sendJson({ success: false, error: 'Tài khoản đã hết hạn sử dụng! Vui lòng liên hệ Admin để gia hạn.' }, 403);
      }

      // Kiểm tra HWID
      if (user.hwidEnabled) {
        if (!user.hwid && hwid) {
          user.hwid = hwid;
        } else if (user.hwid && hwid && user.hwid !== hwid) {
          addLog('CLIENT_HWID_MISMATCH', user.username, user.applicationId, 'FAIL', `Lệch HWID tài khoản: ${hwid} != ${user.hwid}`);
          return sendJson({ success: false, error: 'Khóa HWID: Tài khoản đã liên kết với máy tính khác! Vui lòng liên hệ Admin để reset HWID.' }, 403);
        }
      } else if (hwid && !user.hwid) {
        user.hwid = hwid;
      }

      user.lastLogin = now.toISOString();
      recordDeviceActivity(db, user.applicationId, user.hwid || hwid, clientIp, user.licenseKey || user.username, user.username);
      saveDatabase(db);

      const lic = user.licenseKey ? (db.licenses || []).find(l => l.key === user.licenseKey) : null;
      const sessionToken = 'tok_' + crypto.randomBytes(16).toString('hex');
      const expiresAt = user.expiresAt || (lic && lic.expiresAt ? lic.expiresAt : '2099-12-31T23:59:59Z');
      const subscription = user.subscriptionLevel || (lic ? lic.subscriptionLevel : 'VIP');

      addLog('CLIENT_USER_LOGIN', user.username, user.applicationId, 'SUCCESS', `Máy [${hwid || clientIp}] đăng nhập tài khoản thành công`);

      return sendJson({
        success: true,
        message: 'Login successful',
        token: sessionToken,
        expiresAt: expiresAt,
        subscription: subscription,
        hwid: user.hwid,
        createdate: user.createdAt,
        numOnlineUsers: String(getOnlineDeviceCount(db, user.applicationId))
      });
    }

    // REGISTER (/api/v1/client/register)
    if (pathname === '/api/v1/client/register' && method === 'POST') {
      const db = loadDatabase();
      const key = (body.key || '').trim();
      const username = (body.username || '').trim();
      const password = (body.password || '').trim();
      const hwid = (body.hwid || '').trim();
      const reqAppId = req.headers['x-app-id'] || body.appId;
      const clientIp = req.socket.remoteAddress || '127.0.0.1';

      if (!username || !password || !key) {
        return sendJson({ success: false, error: 'Vui lòng nhập đầy đủ Username, Password và License Key!' }, 400);
      }

      const lic = (db.licenses || []).find(l => l.key.toUpperCase() === key.toUpperCase());
      if (!lic) {
        return sendJson({ success: false, error: 'Mã key bản quyền không tồn tại!' }, 404);
      }

      if (lic.status === 'BANNED') {
        return sendJson({ success: false, error: 'Key bản quyền này đã bị khóa!' }, 403);
      }

      const existing = (db.users || []).find(u => u.username.toLowerCase() === username.toLowerCase());
      if (existing) {
        return sendJson({ success: false, error: 'Tên người dùng đã được sử dụng!' }, 400);
      }

      const now = new Date();
      if (lic.status === 'UNUSED') {
        lic.status = 'ACTIVE';
        lic.activatedAt = now.toISOString();
        if (hwid) lic.hwid = hwid;
        if (lic.durationDays > 0) {
          const exp = new Date(now.getTime() + lic.durationDays * 24 * 60 * 60 * 1000);
          lic.expiresAt = exp.toISOString();
        }
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        username,
        email: `${username}@client.com`,
        password,
        applicationId: lic.applicationId || reqAppId || 'app_viet_01',
        status: 'ACTIVE',
        hwid: hwid || lic.hwid,
        licenseKey: lic.key,
        ipAddress: clientIp,
        createdAt: now.toISOString(),
        lastLogin: now.toISOString()
      };

      db.users.unshift(newUser);
      recordDeviceActivity(db, newUser.applicationId, hwid, clientIp, lic.key, username);
      saveDatabase(db);

      const sessionToken = 'tok_' + crypto.randomBytes(16).toString('hex');
      return sendJson({
        success: true,
        message: 'Registered',
        token: sessionToken
      });
    }

    // CHECK SESSION (/api/v1/client/check)
    if (pathname === '/api/v1/client/check') {
      const db = loadDatabase();
      const hwid = body.hwid || req.headers['x-hwid'] || '';
      const reqAppId = req.headers['x-app-id'] || body.appId;
      const clientIp = req.socket.remoteAddress || '127.0.0.1';

      recordDeviceActivity(db, reqAppId, hwid, clientIp, null, 'ActiveCheck');
      saveDatabase(db);

      return sendJson({
        success: true,
        message: 'Session valid',
        numOnlineUsers: String(getOnlineDeviceCount(db, reqAppId))
      });
    }

    // VARIABLES (/api/v1/client/variables)
    if (pathname === '/api/v1/client/variables') {
      const db = loadDatabase();
      const reqAppId = req.headers['x-app-id'] || parsedUrl.query.ownerid;
      let vars = db.variables || [];
      if (reqAppId) {
        vars = vars.filter(v => (v.applicationId === reqAppId || !v.applicationId) && !v.isSecret);
      } else {
        vars = vars.filter(v => !v.isSecret);
      }
      return sendJson({
        success: true,
        message: 'Variables loaded',
        variables: vars
      });
    }

    // QUẢN LÝ THIẾT BỊ / MÁY TRUY CẬP (DEVICES)
    if (pathname === '/api/devices') {
      const db = loadDatabase();
      db.devices = db.devices || [];

      if (method === 'GET') {
        const appId = parsedUrl.query.appId;
        const cutoff = Date.now() - 15 * 60 * 1000;
        let list = db.devices.map(d => {
          const isOnline = new Date(d.lastSeen).getTime() > cutoff;
          return {
            ...d,
            status: isOnline ? 'ONLINE' : 'OFFLINE',
            isOnline: isOnline
          };
        });

        if (appId && appId !== 'ALL') {
          list = list.filter(d => d.appId === appId);
        }

        return sendJson({
          success: true,
          onlineCount: list.filter(d => d.isOnline).length,
          totalCount: list.length,
          data: list
        });
      }

      if (method === 'DELETE') {
        const devId = parsedUrl.query.id;
        db.devices = db.devices.filter(d => d.id !== devId);
        saveDatabase(db);
        return sendJson({ success: true, message: 'Đã xóa thiết bị khỏi danh sách!' });
      }
    }

    // =========================================================================
    // 4. DASHBOARD API (DÀNH CHO BẢNG QUẢN TRỊ ADMIN)
    // =========================================================================

    // THỐNG KÊ TOÀN DIỆN
    if (pathname === '/api/dashboard/stats' && method === 'GET') {
      const db = loadDatabase();
      const lics = db.licenses || [];
      return sendJson({
        success: true,
        data: {
          totalApps: (db.apps || []).length,
          totalLicenses: lics.length,
          activeLicenses: lics.filter(l => l.status === 'ACTIVE').length,
          unusedLicenses: lics.filter(l => l.status === 'UNUSED').length,
          expiredLicenses: lics.filter(l => l.status === 'EXPIRED').length,
          bannedLicenses: lics.filter(l => l.status === 'BANNED').length,
          totalUsers: (db.users || []).length,
          totalLogs: (db.logs || []).length,
          totalOnlineDevices: getOnlineDeviceCount(db),
          totalDevices: (db.devices || []).length
        }
      });
    }

    // QUẢN LÝ ỨNG DỤNG (APPS)
    if (pathname === '/api/dashboard/apps') {
      const db = loadDatabase();
      db.apps = db.apps || [];

      if (method === 'GET') {
        return sendJson({ success: true, data: db.apps });
      }

      if (method === 'POST') {
        const newApp = {
          id: 'app_' + Date.now(),
          name: body.name || 'Ứng dụng mới',
          appId: 'app_pk_viet_' + Math.random().toString(36).substring(2, 14),
          secretKey: 'sk_live_viet_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
          version: body.version || '1.0.0',
          platform: body.platform || 'C# (.NET / WinForms)',
          description: body.description || '',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          usersCount: 0,
          licensesCount: 0
        };
        db.apps.unshift(newApp);
        saveDatabase(db);
        addLog('CREATE_APP', 'admin', newApp.id, 'SUCCESS', `Tạo ứng dụng mới: ${newApp.name}`);
        return sendJson({ success: true, data: newApp });
      }

      if (method === 'DELETE') {
        const appId = parsedUrl.query.id;
        db.apps = db.apps.filter(a => a.id !== appId);
        db.licenses = (db.licenses || []).filter(l => l.applicationId !== appId);
        saveDatabase(db);
        addLog('DELETE_APP', 'admin', appId, 'SUCCESS', `Xóa ứng dụng ${appId}`);
        return sendJson({ success: true, message: 'Đã xóa ứng dụng thành công!' });
      }
    }

    // TẠO & QUẢN LÝ KEY BẢN QUYỀN (LICENSES)
    if (pathname === '/api/dashboard/licenses') {
      const db = loadDatabase();
      db.licenses = db.licenses || [];

      if (method === 'GET') {
        const appId = parsedUrl.query.applicationId;
        const status = parsedUrl.query.status;
        let result = db.licenses;
        if (appId && appId !== 'ALL') result = result.filter(l => l.applicationId === appId);
        if (status && status !== 'ALL') result = result.filter(l => l.status === status);
        return sendJson({ success: true, data: result });
      }

      // TẠO KEY (ĐƠN HOẶC HÀNG LOẠT)
      if (method === 'POST') {
        const appId = body.applicationId || (db.apps[0] ? db.apps[0].id : 'app_viet_01');
        const amount = Math.min(100, Math.max(1, parseInt(body.amount) || 1));
        const durationDays = parseInt(body.durationDays) || 30;
        const level = body.subscriptionLevel || 'VIP';
        const prefix = (body.prefix || 'VIET').trim().toUpperCase();
        const notes = (body.notes || '').trim();

        const generated = [];
        const now = new Date().toISOString();

        for (let i = 0; i < amount; i++) {
          const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
          const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
          const p3 = Math.random().toString(36).substring(2, 6).toUpperCase();
          const keyStr = `${prefix}-${level}-${p1}-${p2}-${p3}`;

          const newLic = {
            id: 'lic_' + Date.now() + '_' + i,
            key: keyStr,
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
          };

          db.licenses.unshift(newLic);
          generated.push(keyStr);
        }

        saveDatabase(db);
        addLog('GENERATE_KEYS', 'admin', appId, 'SUCCESS', `Tạo ${amount} key (${level}, ${durationDays} ngày)`);
        return sendJson({ success: true, message: `Đã tạo thành công ${amount} key!`, data: generated });
      }

      // RESET HWID, BAN, UNBAN, GIA HẠN NGÀY
      if (method === 'PATCH') {
        const licId = body.id;
        const action = (body.action || '').toLowerCase();
        const days = parseInt(body.days) || 0;
        const reason = body.reason || 'Admin khóa key';

        const lic = db.licenses.find(l => l.id === licId || l.key === licId);
        if (!lic) return sendJson({ success: false, message: 'Không tìm thấy key!' }, 404);

        if (action === 'reset_hwid') {
          const oldHwid = lic.hwid;
          lic.hwid = null;
          addLog('RESET_HWID', 'admin', lic.applicationId, 'SUCCESS', `Reset HWID cho key ${lic.key} (Trước: ${oldHwid})`);
        } else if (action === 'ban') {
          lic.status = 'BANNED';
          lic.banReason = reason;
          addLog('BAN_KEY', 'admin', lic.applicationId, 'SUCCESS', `Khóa key ${lic.key}: ${reason}`);
        } else if (action === 'unban') {
          lic.status = lic.activatedAt ? 'ACTIVE' : 'UNUSED';
          lic.banReason = null;
          addLog('UNBAN_KEY', 'admin', lic.applicationId, 'SUCCESS', `Mở khóa key ${lic.key}`);
        } else if (action === 'add_days' && days > 0) {
          lic.durationDays = (lic.durationDays || 0) + days;
          if (lic.expiresAt) {
            const exp = new Date(lic.expiresAt);
            exp.setDate(exp.getDate() + days);
            lic.expiresAt = exp.toISOString();
          }
          if (lic.status === 'EXPIRED') lic.status = 'ACTIVE';
          addLog('EXTEND_KEY', 'admin', lic.applicationId, 'SUCCESS', `Gia hạn ${days} ngày cho key ${lic.key}`);
        }

        saveDatabase(db);
        return sendJson({ success: true, message: 'Thao tác thành công!', data: lic });
      }

      // XÓA KEY
      if (method === 'DELETE') {
        const licId = parsedUrl.query.id;
        db.licenses = db.licenses.filter(l => l.id !== licId && l.key !== licId);
        saveDatabase(db);
        addLog('DELETE_KEY', 'admin', 'SYSTEM', 'SUCCESS', `Xóa key ${licId}`);
        return sendJson({ success: true, message: 'Đã xóa key thành công!' });
      }
    }

    // QUẢN LÝ NGƯỜI DÙNG & TẠO KEY TÀI KHOẢN MẬT KHẨU (USERS)
    if (pathname === '/api/dashboard/users') {
      const db = loadDatabase();
      db.users = db.users || [];

      // LẤY DANH SÁCH USER
      if (method === 'GET') {
        let list = db.users;
        const appId = parsedUrl.query.applicationId;
        const status = parsedUrl.query.status;
        const search = (parsedUrl.query.search || '').toLowerCase().trim();

        if (appId && appId !== 'ALL') {
          list = list.filter(u => u.applicationId === appId);
        }
        if (status && status !== 'ALL') {
          list = list.filter(u => u.status === status);
        }
        if (search) {
          list = list.filter(u => 
            (u.username && u.username.toLowerCase().includes(search)) ||
            (u.email && u.email.toLowerCase().includes(search)) ||
            (u.hwid && u.hwid.toLowerCase().includes(search)) ||
            (u.notes && u.notes.toLowerCase().includes(search))
          );
        }
        return sendJson({ success: true, data: list });
      }

      // TẠO TÀI KHOẢN MỚI (ĐƠN HOẶC HÀNG LOẠT)
      if (method === 'POST') {
        const appId = body.applicationId || (db.apps && db.apps[0] ? db.apps[0].id : 'app_viet_01');
        const level = body.subscriptionLevel || 'VIP';
        const durationDays = parseInt(body.durationDays) || 30;
        const hwidEnabled = body.hwidEnabled !== false;
        const notes = body.notes || '';
        const now = new Date();

        let expiresAt = null;
        if (durationDays > 0) {
          const exp = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
          expiresAt = exp.toISOString();
        }

        // Trường hợp 1: Nhập tùy chỉnh 1 tài khoản
        if (body.customUsername) {
          const customUser = body.customUsername.trim();
          const customPass = (body.customPassword || 'Pass@123456').trim();

          const exists = db.users.find(u => u.username.toLowerCase() === customUser.toLowerCase());
          if (exists) {
            return sendJson({ success: false, message: 'Tên tài khoản này đã tồn tại!' }, 409);
          }

          const newUser = {
            id: 'usr_' + Date.now(),
            applicationId: appId,
            username: customUser,
            password: customPass,
            email: body.email || `${customUser}@client.com`,
            subscriptionLevel: level,
            durationDays: durationDays,
            status: 'ACTIVE',
            hwid: null,
            hwidEnabled: hwidEnabled,
            createdAt: now.toISOString(),
            expiresAt: expiresAt,
            lastLogin: null,
            notes: notes
          };

          db.users.unshift(newUser);
          saveDatabase(db);
          addLog('CREATE_USER_ACCOUNT', 'admin', appId, 'SUCCESS', `Tạo tài khoản: ${customUser} (${level}, ${durationDays} ngày)`);
          return sendJson({
            success: true,
            message: 'Đã tạo tài khoản thành công!',
            data: [newUser],
            accountsText: `Tài khoản: ${newUser.username} | Mật khẩu: ${newUser.password} | Gói: ${level} | Thời hạn: ${durationDays > 0 ? durationDays + ' ngày' : 'Vĩnh viễn'}`
          });
        }

        // Trường hợp 2: Tạo hàng loạt ngẫu nhiên
        const amount = Math.min(Math.max(parseInt(body.amount) || 1, 1), 50);
        const prefix = (body.prefix || 'user_').trim();
        const createdUsers = [];
        const lines = [];

        for (let i = 0; i < amount; i++) {
          const randSuffix = Math.random().toString(36).substring(2, 6).toLowerCase();
          const uname = `${prefix}${randSuffix}`;
          const pword = 'Pass@' + Math.random().toString(36).substring(2, 6).toUpperCase();

          const newUser = {
            id: 'usr_' + Date.now() + '_' + i,
            applicationId: appId,
            username: uname,
            password: pword,
            email: `${uname}@client.com`,
            subscriptionLevel: level,
            durationDays: durationDays,
            status: 'ACTIVE',
            hwid: null,
            hwidEnabled: hwidEnabled,
            createdAt: now.toISOString(),
            expiresAt: expiresAt,
            lastLogin: null,
            notes: notes
          };

          db.users.unshift(newUser);
          createdUsers.push(newUser);
          lines.push(`Tài khoản: ${uname} | Mật khẩu: ${pword} | Gói: ${level} | Hạn: ${durationDays > 0 ? durationDays + ' ngày' : 'Vĩnh viễn'}`);
        }

        saveDatabase(db);
        addLog('GENERATE_USER_ACCOUNTS', 'admin', appId, 'SUCCESS', `Tạo ${amount} tài khoản (${level}, ${durationDays} ngày)`);
        return sendJson({
          success: true,
          message: `Đã tạo thành công ${amount} tài khoản!`,
          data: createdUsers,
          accountsText: lines.join('\n')
        });
      }

      // THAO TÁC TRÊN TÀI KHOẢN (RESET HWID, BAN, UNBAN, GIA HẠN, ĐỔI PASS)
      if (method === 'PATCH') {
        const uId = body.id;
        const action = (body.action || '').toLowerCase();
        const days = parseInt(body.days) || 0;
        const reason = body.reason || 'Admin khóa tài khoản';
        const newPassword = body.newPassword;

        const user = db.users.find(u => u.id === uId || u.username === uId);
        if (!user) return sendJson({ success: false, message: 'Không tìm thấy tài khoản!' }, 404);

        if (action === 'reset_hwid') {
          const oldHwid = user.hwid;
          user.hwid = null;
          addLog('RESET_USER_HWID', 'admin', user.applicationId, 'SUCCESS', `Reset HWID cho user ${user.username} (Trước: ${oldHwid})`);
        } else if (action === 'ban') {
          user.status = 'BANNED';
          user.banReason = reason;
          addLog('BAN_USER', 'admin', user.applicationId, 'SUCCESS', `Khóa user ${user.username}: ${reason}`);
        } else if (action === 'unban') {
          user.status = 'ACTIVE';
          user.banReason = null;
          addLog('UNBAN_USER', 'admin', user.applicationId, 'SUCCESS', `Mở khóa user ${user.username}`);
        } else if (action === 'add_days' && days > 0) {
          user.durationDays = (user.durationDays || 0) + days;
          const currExp = user.expiresAt ? new Date(user.expiresAt) : new Date();
          currExp.setDate(currExp.getDate() + days);
          user.expiresAt = currExp.toISOString();
          if (user.status === 'EXPIRED') user.status = 'ACTIVE';
          addLog('EXTEND_USER', 'admin', user.applicationId, 'SUCCESS', `Gia hạn ${days} ngày cho user ${user.username}`);
        } else if (action === 'change_password' && newPassword) {
          user.password = newPassword.trim();
          addLog('CHANGE_USER_PASS', 'admin', user.applicationId, 'SUCCESS', `Đổi mật khẩu cho user ${user.username}`);
        }

        saveDatabase(db);
        return sendJson({ success: true, message: 'Thao tác tài khoản thành công!', data: user });
      }

      // XÓA TÀI KHOẢN
      if (method === 'DELETE') {
        const uId = parsedUrl.query.id;
        db.users = db.users.filter(u => u.id !== uId && u.username !== uId);
        saveDatabase(db);
        addLog('DELETE_USER', 'admin', 'SYSTEM', 'SUCCESS', `Xóa tài khoản ${uId}`);
        return sendJson({ success: true, message: 'Đã xóa người dùng thành công!' });
      }
    }

    // QUẢN LÝ BIẾN TỪ XA (VARIABLES)
    if (pathname === '/api/dashboard/variables') {
      const db = loadDatabase();
      db.variables = db.variables || [];
      if (method === 'GET') return sendJson({ success: true, data: db.variables });
      if (method === 'POST') {
        const newVar = {
          id: 'var_' + Date.now(),
          applicationId: body.applicationId || 'app_viet_01',
          name: (body.name || '').trim().toUpperCase(),
          value: body.value || '',
          isSecret: !!body.isSecret,
          updatedAt: new Date().toISOString()
        };
        db.variables.unshift(newVar);
        saveDatabase(db);
        return sendJson({ success: true, data: newVar });
      }
      if (method === 'DELETE') {
        const varId = parsedUrl.query.id;
        db.variables = db.variables.filter(v => v.id !== varId);
        saveDatabase(db);
        return sendJson({ success: true, message: 'Đã xóa biến thành công!' });
      }
    }

    // NHẬT KÝ HỆ THỐNG (AUDIT LOGS)
    if (pathname === '/api/dashboard/logs' && method === 'GET') {
      const db = loadDatabase();
      return sendJson({ success: true, data: db.logs || [] });
    }

    // 404 NOT FOUND CHO CÁC API KHÁC
    return sendJson({ error: 'Endpoint không tồn tại', path: pathname }, 404);
  });
});

// KHỞI ĐỘNG SERVER
server.listen(PORT, HOST, () => {
  console.log('======================================================================');
  console.log('       VIET AUTH SYSTEM - NODE.JS & RENDER.COM READY SERVER          ');
  console.log('======================================================================');
  console.log(` [*] Server đang chạy tại: http://${HOST}:${PORT}`);
  console.log(` [*] Key Admin mặc định:   thai`);
  console.log(` [*] Trạng thái:           Sẵn sàng nhận request & deploy Render!`);
  console.log('======================================================================\n');
});
