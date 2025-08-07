// sw.js - 需要放在所有站点的根目录
const CACHE_NAME = 'ok36-online-counter-v1';
const ONLINE_USERS_KEY = 'ok36_online_users';
const MAX_AGE = 60 * 60 * 1000; // 1小时

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'heartbeat') {
    handleHeartbeat(event);
  } else if (event.data.type === 'get_online_count') {
    sendOnlineCount(event);
  }
});

function handleHeartbeat(event) {
  const userId = event.data.userId;
  const now = Date.now();

  caches.open(CACHE_NAME).then((cache) => {
    return cache.match(ONLINE_USERS_KEY).then((response) => {
      let users = {};
      if (response) {
        users = response.json().catch(() => ({}));
      }
      return Promise.resolve(users);
    }).then((users) => {
      // 清理过期用户
      Object.keys(users).forEach((key) => {
        if (now - users[key] > MAX_AGE) {
          delete users[key];
        }
      });
      
      // 更新当前用户
      users[userId] = now;
      
      // 保存数据
      return cache.put(
        ONLINE_USERS_KEY,
        new Response(JSON.stringify(users), {
          headers: {'Content-Type': 'application/json'}
        })
      );
    });
  });
}

function sendOnlineCount(event) {
  const now = Date.now();
  
  caches.open(CACHE_NAME).then((cache) => {
    return cache.match(ONLINE_USERS_KEY).then((response) => {
      if (!response) return 0;
      return response.json().catch(() => ({}));
    }).then((users) => {
      // 清理并计数
      let count = 0;
      Object.keys(users).forEach((key) => {
        if (now - users[key] <= MAX_AGE) {
          count++;
        } else {
          delete users[key];
        }
      });
      
      // 返回计数
      event.source.postMessage({
        type: 'online_count',
        count: count
      }, {targetOrigin: event.origin});
    });
  });
}