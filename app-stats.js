// app-stats.js

// 1. 倒计时功能
function updateCountdown() {
    // 假设考试日期是2026年3月21日（可以根据实际情况修改）
    const examDate = new Date('2026-03-21T00:00:00');
    const today = new Date();
    
    // 计算剩余天数
    const timeDiff = examDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // 更新页面显示
    document.getElementById('days-left').textContent = daysLeft;
}

// 2. 在线人数统计
function updateOnlineCount() {
    // 使用localStorage模拟在线人数统计
    const storageKey = 'wanglaoshi_online_stats';
    const sessionKey = 'wanglaoshi_session_active';
    const baseOnlineCount = 30; // 基础在线人数
    
    // 获取当前存储的数据
    let stats = JSON.parse(localStorage.getItem(storageKey)) || {
        lastUpdate: 0,
        onlineCount: baseOnlineCount,
        totalSessions: 0
    };
    
    // 检查会话是否已存在
    const isNewSession = !sessionStorage.getItem(sessionKey);
    
    if (isNewSession) {
        // 新会话
        sessionStorage.setItem(sessionKey, 'active');
        stats.totalSessions += 1;
        
        // 在基础人数上增加随机波动 (0-10人)
        const randomAddition = Math.floor(Math.random() * 11);
        stats.onlineCount = baseOnlineCount + randomAddition;
        
        // 设置过期时间 (15分钟后数据会重置)
        stats.lastUpdate = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(stats));
    } else {
        // 已有会话，检查数据是否过期 (15分钟)
        const fifteenMinutes = 15 * 60 * 1000;
        if (Date.now() - stats.lastUpdate > fifteenMinutes) {
            // 数据过期，重置为基数
            stats.onlineCount = baseOnlineCount;
            stats.lastUpdate = Date.now();
            localStorage.setItem(storageKey, JSON.stringify(stats));
        }
    }
    
    // 更新页面显示
    document.getElementById('online-count').textContent = stats.onlineCount;
}

// 3. 日期时间显示
function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    // 中文日期格式
    const dateStr = now.toLocaleDateString('zh-CN', options);
    
    // 更新页面显示
    document.getElementById('current-date').textContent = dateStr;
    
    // 更新版权年份
    document.getElementById('current-year').textContent = now.getFullYear();
    
    // 每秒更新一次时间
    setTimeout(updateDateTime, 1000);
}

// 页面加载时初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    updateCountdown();
    updateOnlineCount();
    updateDateTime();
    
    // 每天更新一次倒计时
    setInterval(updateCountdown, 24 * 60 * 60 * 1000);
    
    // 每分钟更新一次在线人数（模拟变化）
    setInterval(updateOnlineCount, 60 * 1000);
});