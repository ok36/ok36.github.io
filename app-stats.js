// 显示本地时间
function updateLocalDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    document.getElementById('current-date').textContent = `今天是 ${now.toLocaleDateString('zh-CN', options)}`;
    document.getElementById('current-year').textContent = now.getFullYear();
}

// 计算剩余天数
function calculateDaysLeft() {
    const targetDate = new Date('2026-03-21');
    const diffDays = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));
    document.getElementById('days-left').textContent = diffDays > 0 ? diffDays : 0;
}

// 在线人数统计系统
const ONLINE_USERS_KEY = 'ok36_online_users_v2';
const HEARTBEAT_INTERVAL = 30 * 1000; // 30秒心跳
const MAX_IDLE_TIME = 60 * 60 * 1000; // 60分钟不活跃视为离线
const SITES = [
    'ok36.github.io',
    'ok36-github-io.pages.dev',
    'ok36.netlify.app',
    'ok36.pages.dev',
    'ok39.netlify.app',
    'ok36.neocities.org'
];

// 检查当前域名是否在支持的列表中
function isSupportedSite() {
    return SITES.includes(window.location.hostname);
}

// 生成唯一用户ID
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// 获取或创建用户ID
function getOrCreateUserId() {
    let userId = localStorage.getItem('ok36_user_id');
    if (!userId) {
        userId = generateUserId();
        localStorage.setItem('ok36_user_id', userId);
    }
    return userId;
}

// 更新在线人数显示
function updateOnlineCountDisplay(count) {
    const baseCount = 20; // 基础人数
    const adjustedCount = Math.max(baseCount, count); // 确保不低于基础人数
    document.getElementById('online-count').textContent = adjustedCount;
}

// 获取在线用户数据
function getOnlineUsers() {
    try {
        const data = localStorage.getItem(ONLINE_USERS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

// 更新在线用户数据
function updateOnlineUsers() {
    if (!isSupportedSite()) {
        updateOnlineCountDisplay(Math.floor(Math.random() * 50) + 20);
        return;
    }

    const userId = getOrCreateUserId();
    const now = Date.now();
    let onlineUsers = getOnlineUsers();

    // 更新当前用户
    onlineUsers[userId] = now;

    // 清理不活跃用户
    Object.keys(onlineUsers).forEach(key => {
        if (now - onlineUsers[key] > MAX_IDLE_TIME) {
            delete onlineUsers[key];
        }
    });

    // 保存数据
    try {
        localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(onlineUsers));
        updateOnlineCountDisplay(Object.keys(onlineUsers).length);
    } catch (e) {
        // 存储失败时使用随机数
        updateOnlineCountDisplay(Math.floor(Math.random() * 30) + 20);
    }
}

// 初始化在线人数统计
function initOnlineCount() {
    // 初始更新
    updateOnlineUsers();

    // 设置定时器
    const timer = setInterval(updateOnlineUsers, HEARTBEAT_INTERVAL);

    // 页面可见性变化时更新
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateOnlineUsers();
        }
    });

    // 页面卸载前更新
    window.addEventListener('beforeunload', updateOnlineUsers);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 显示本地时间
    updateLocalDate();
    
    // 计算剩余天数
    calculateDaysLeft();
    
    // 初始化在线人数统计
    initOnlineCount();
    
    // 设置定时器
    setInterval(updateLocalDate, 60000); // 每分钟更新时间
    setInterval(calculateDaysLeft, 86400000); // 每天更新倒计时
});