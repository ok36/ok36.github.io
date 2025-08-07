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
const SUPPORTED_PATHS = [
    '/app-index.html',
    '/appdl-index.html'
];

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

// 检查是否支持的页面
function isSupportedPage() {
    return SUPPORTED_PATHS.includes(window.location.pathname);
}

// 通过Service Worker统计在线人数
function initOnlineCount() {
    if (!isSupportedPage()) {
        updateOnlineCountDisplay(Math.floor(Math.random() * 50) + 20);
        return;
    }

    const userId = getOrCreateUserId();
    
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(() => {
                // 发送心跳
                sendHeartbeat(userId);
                
                // 获取在线人数
                getOnlineCount();
                
                // 设置定时器
                setInterval(() => sendHeartbeat(userId), 30 * 1000);
                setInterval(getOnlineCount, 60 * 1000);
            })
            .catch(() => {
                // 回退方案
                updateOnlineCountDisplay(Math.floor(Math.random() * 50) + 20);
            });
    } else {
        // 不支持Service Worker的回退方案
        updateOnlineCountDisplay(Math.floor(Math.random() * 50) + 20);
    }
}

// 发送心跳到Service Worker
function sendHeartbeat(userId) {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'heartbeat',
            userId: userId,
            timestamp: Date.now()
        });
    }
}

// 从Service Worker获取在线人数
function getOnlineCount() {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        const channel = new MessageChannel();
        
        channel.port1.onmessage = (event) => {
            if (event.data.type === 'online_count') {
                updateOnlineCountDisplay(event.data.count);
            }
        };
        
        navigator.serviceWorker.controller.postMessage({
            type: 'get_online_count'
        }, [channel.port2]);
    }
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