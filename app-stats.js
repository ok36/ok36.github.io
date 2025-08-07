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
const ONLINE_USERS_KEY = 'ok36_online_users';
const SITES = [
    'ok36.github.io',
    'ok36-github-io.pages.dev',
    'ok36.netlify.app',
    'ok36.pages.dev',
    'ok39.netlify.app',
    'ok36.neocities.org'
];
const IFRAME_URL = 'https://ok36.github.io/online-counter.html'; // 选择一个主站点作为统计中心

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

// 创建跨域通信的iframe
function createCounterIframe() {
    const iframe = document.createElement('iframe');
    iframe.src = IFRAME_URL;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    return iframe;
}

// 发送消息到iframe
function sendMessageToIframe(iframe, message) {
    iframe.contentWindow.postMessage(message, IFRAME_URL);
}

// 初始化在线人数统计
function initOnlineCount() {
    if (!isSupportedSite()) {
        updateOnlineCountDisplay(Math.floor(Math.random() * 50) + 20);
        return;
    }

    const userId = getOrCreateUserId();
    const iframe = createCounterIframe();

    // 监听来自iframe的消息
    window.addEventListener('message', (event) => {
        if (event.origin !== new URL(IFRAME_URL).origin) return;
        if (event.data.type === 'online_count') {
            updateOnlineCountDisplay(event.data.count);
        }
    });

    // 定期发送心跳（每分钟）
    function sendHeartbeat() {
        sendMessageToIframe(iframe, {
            type: 'heartbeat',
            userId: userId,
            timestamp: Date.now(),
            site: window.location.hostname
        });
    }

    // 初始心跳
    sendHeartbeat();

    // 设置定时器
    const heartbeatInterval = setInterval(sendHeartbeat, 60 * 1000);

    // 页面可见性变化时发送心跳
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            sendHeartbeat();
        }
    });

    // 页面卸载前发送心跳
    window.addEventListener('beforeunload', sendHeartbeat);
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