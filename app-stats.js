// 获取准确时间的方案
async function fetchOfficialDate() {
    updateLocalDate();
    try {
        const response = await fetch('https://worldtimeapi.org/api/ip');
        if (!response.ok) throw new Error('API响应不正常');
        const data = await response.json();
        const date = new Date(data.datetime);
        if (!isNaN(date.getTime())) {
            updateDateDisplay(date);
        } else {
            throw new Error('日期格式无效');
        }
    } catch (error) {
        console.log('获取网络时间失败，使用本地时间:', error);
        updateLocalDate();
    }
}

function updateLocalDate() {
    const now = new Date();
    updateDateDisplay(now);
    document.getElementById('current-year').textContent = now.getFullYear();
}

function updateDateDisplay(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    document.getElementById('current-date').textContent = `今天是 ${date.toLocaleDateString('zh-CN', options)}`;
}

function calculateDaysLeft() {
    const targetDate = new Date('2026-03-21');
    const diffDays = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));
    document.getElementById('days-left').textContent = diffDays > 0 ? diffDays : 0;
}

// 在线人数统计系统
const ONLINE_USERS_KEY = 'online_users_data';
const CHANNEL_NAME = 'online_users_channel';
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
    let userId = localStorage.getItem('online_user_id');
    if (!userId) {
        userId = generateUserId();
        localStorage.setItem('online_user_id', userId);
    }
    return userId;
}

// 更新在线用户数据
function updateOnlineUsers() {
    if (!isSupportedSite()) return;

    const userId = getOrCreateUserId();
    const now = Date.now();
    const onlineUsers = getOnlineUsers();

    // 更新或添加当前用户
    onlineUsers[userId] = now;

    // 清理超过5分钟不活跃的用户
    const activeThreshold = now - 5 * 60 * 1000; // 5分钟
    Object.keys(onlineUsers).forEach(key => {
        if (onlineUsers[key] < activeThreshold) {
            delete onlineUsers[key];
        }
    });

    // 保存更新后的数据
    localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(onlineUsers));
    
    // 广播更新
    if (window.broadcastChannel) {
        window.broadcastChannel.postMessage({ type: 'update', userId, timestamp: now });
    }

    // 更新显示
    updateOnlineCountDisplay(Object.keys(onlineUsers).length);
}

// 获取当前在线用户数据
function getOnlineUsers() {
    const data = localStorage.getItem(ONLINE_USERS_KEY);
    return data ? JSON.parse(data) : {};
}

// 更新在线人数显示
function updateOnlineCountDisplay(count) {
    const baseCount = 20; // 基础人数
    const adjustedCount = Math.max(baseCount, count); // 确保不低于基础人数
    document.getElementById('online-count').textContent = adjustedCount;
}

// 初始化在线人数统计
function initOnlineCount() {
    if (!isSupportedSite()) {
        // 不在支持列表中，使用随机数
        document.getElementById('online-count').textContent = Math.floor(Math.random() * 50) + 20;
        return;
    }

    // 创建广播通道
    window.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);

    // 监听其他标签页的消息
    window.broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'update') {
            const onlineUsers = getOnlineUsers();
            onlineUsers[event.data.userId] = event.data.timestamp;
            localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(onlineUsers));
            updateOnlineCountDisplay(Object.keys(onlineUsers).length);
        }
    };

    // 初始更新
    updateOnlineUsers();

    // 定期更新（每分钟）
    setInterval(updateOnlineUsers, 60 * 1000);

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
    fetchOfficialDate();
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    calculateDaysLeft();
    initOnlineCount();
    
    setInterval(fetchOfficialDate, 60000);
    setInterval(calculateDaysLeft, 86400000);
});