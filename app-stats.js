// app-stats.js

// 1. 考试倒计时功能
function updateCountdown() {
    // 设置考试日期为2026年3月21日（可根据实际情况修改）
    const examDate = new Date('2026-03-21T00:00:00');
    const today = new Date();
    
    // 计算剩余天数（向上取整）
    const timeDiff = examDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // 更新页面显示
    document.getElementById('days-left').textContent = daysLeft > 0 ? daysLeft : "已过期";
}

// 2. 在线人数统计功能
function updateOnlineCount() {
    // 本地存储键名
    const storageKey = 'wanglaoshi_online_stats';
    const sessionKey = 'wanglaoshi_session_active';
    
    // 获取当前小时
    const currentHour = new Date().getHours();
    
    // 判断是否在凌晨0点到5点之间
    const isMidnightToDawn = currentHour >= 0 && currentHour < 5;
    
    // 基础在线人数和随机波动范围
    const baseOnlineCount = isMidnightToDawn ? 0 : 30;
    const maxRandomAddition = isMidnightToDawn ? 5 : 10; // 深夜波动范围减小
    
    // 获取或初始化统计数据
    let stats = JSON.parse(localStorage.getItem(storageKey)) || {
        lastUpdate: 0,
        onlineCount: baseOnlineCount,
        totalSessions: 0
    };
    
    // 检查是否为新会话
    const isNewSession = !sessionStorage.getItem(sessionKey);
    
    if (isNewSession) {
        // 标记为新会话
        sessionStorage.setItem(sessionKey, 'active');
        
        // 更新统计数据
        stats.totalSessions += 1;
        
        // 在基础人数上增加随机波动
        const randomAddition = Math.floor(Math.random() * (maxRandomAddition + 1));
        stats.onlineCount = baseOnlineCount + randomAddition;
        
        // 更新最后更新时间
        stats.lastUpdate = Date.now();
        
        // 保存到本地存储
        localStorage.setItem(storageKey, JSON.stringify(stats));
    } else {
        // 检查数据是否过期（15分钟）
        const fifteenMinutes = 15 * 60 * 1000;
        if (Date.now() - stats.lastUpdate > fifteenMinutes) {
            // 重置为基数
            stats.onlineCount = baseOnlineCount;
            stats.lastUpdate = Date.now();
            localStorage.setItem(storageKey, JSON.stringify(stats));
        }
    }
    
    // 更新页面显示
    document.getElementById('online-count').textContent = stats.onlineCount;
}

// 3. 日期时间显示功能
function updateDateTime() {
    const now = new Date();
    
    // 中文日期时间选项
    const dateOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long'
    };
    
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    // 格式化日期和时间
    const dateStr = now.toLocaleDateString('zh-CN', dateOptions);
    const timeStr = now.toLocaleTimeString('zh-CN', timeOptions);
    
    // 更新页面显示
    document.getElementById('current-date').textContent = `${dateStr} ${timeStr}`;
    
    // 更新版权年份
    document.getElementById('current-year').textContent = now.getFullYear();
    
    // 每秒更新一次时间
    setTimeout(updateDateTime, 1000);
}

// 4. 页面加载初始化
function initPage() {
    // 初始化所有功能
    updateCountdown();
    updateOnlineCount();
    updateDateTime();
    
    // 设置定时器
    setInterval(updateCountdown, 24 * 60 * 60 * 1000); // 每天更新倒计时
    setInterval(updateOnlineCount, 60 * 1000); // 每分钟更新在线人数
}

// 5. 监听DOM加载完成事件
document.addEventListener('DOMContentLoaded', initPage);

// 导出函数（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateCountdown,
        updateOnlineCount,
        updateDateTime
    };
}