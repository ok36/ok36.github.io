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
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = `今天是 ${now.toLocaleDateString('zh-CN', options)}`;
    }
    
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = now.getFullYear();
    }
}

// 计算剩余天数
function calculateDaysLeft() {
    const targetDate = new Date('2026-03-21');
    const diffDays = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));
    const daysLeftElement = document.getElementById('days-left');
    if (daysLeftElement) {
        daysLeftElement.textContent = diffDays > 0 ? diffDays : 0;
    }
}

// 在线人数统计系统 (1小时内活跃用户)
const ONLINE_EXPIRATION = 60 * 60 * 1000; // 1小时(毫秒)
const ONLINE_STORAGE_KEY = 'ok36_online_users';
const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5分钟

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

// 更新在线用户列表
function updateOnlineUsers(userId) {
    const now = Date.now();
    let onlineUsers = JSON.parse(localStorage.getItem(ONLINE_STORAGE_KEY) || '{}');
    
    // 清理过期用户
    Object.keys(onlineUsers).forEach(id => {
        if (now - onlineUsers[id] > ONLINE_EXPIRATION) {
            delete onlineUsers[id];
        }
    });
    
    // 更新当前用户
    onlineUsers[userId] = now;
    
    localStorage.setItem(ONLINE_STORAGE_KEY, JSON.stringify(onlineUsers));
    return Object.keys(onlineUsers).length;
}

// 获取当前在线人数
function getOnlineCount() {
    const now = Date.now();
    const onlineUsers = JSON.parse(localStorage.getItem(ONLINE_STORAGE_KEY) || '{}');
    
    // 清理过期用户并计数
    let count = 0;
    Object.keys(onlineUsers).forEach(id => {
        if (now - onlineUsers[id] <= ONLINE_EXPIRATION) {
            count++;
        } else {
            delete onlineUsers[id];
        }
    });
    
    // 更新存储
    localStorage.setItem(ONLINE_STORAGE_KEY, JSON.stringify(onlineUsers));
    
    return count;
}

// 更新在线人数显示
function updateOnlineCountDisplay() {
    const baseCount = 20; // 基础人数
    const actualCount = getOnlineCount();
    const adjustedCount = Math.max(baseCount, actualCount); // 确保不低于基础人数
    
    // 更新所有页面中的在线人数显示
    const onlineCountElements = document.querySelectorAll('#online-count');
    onlineCountElements.forEach(element => {
        element.textContent = adjustedCount;
    });
}

// 发送心跳
function sendHeartbeat(userId) {
    const count = updateOnlineUsers(userId);
    updateOnlineCountDisplay();
    return count;
}

// 初始化在线人数统计
function initOnlineCount() {
    const userId = getOrCreateUserId();
    
    // 立即发送第一次心跳
    sendHeartbeat(userId);
    
    // 设置定时器：定期发送心跳
    setInterval(() => sendHeartbeat(userId), HEARTBEAT_INTERVAL);
    
    // 设置定时器：每分钟更新显示
    setInterval(updateOnlineCountDisplay, 60 * 1000);
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            sendHeartbeat(userId);
        }
    });
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

// 导出函数供其他页面使用
window.appStats = {
    updateOnlineCountDisplay,
    getOnlineCount
};