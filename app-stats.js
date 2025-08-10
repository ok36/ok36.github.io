// app-stats.js

// 1. 考试倒计时功能（保持不变）
function updateCountdown() {
    const examDate = new Date('2026-03-21T00:00:00');
    const today = new Date();
    const timeDiff = examDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    document.getElementById('days-left').textContent = daysLeft > 0 ? daysLeft : "已过期";
}

// 2. 本设备访问次数统计（新功能）
function updateVisitCount() {
    const storageKey = 'wanglaoshi_visit_stats';
    
    try {
        // 获取或初始化统计（带错误处理）
        let stats = JSON.parse(localStorage.getItem(storageKey)) || {
            visitCount: 0,
            lastVisit: 0
        };

        // 防刷新计数：同一会话只计1次（1分钟内重复访问不计数）
        const now = Date.now();
        const isNewVisit = (now - stats.lastVisit) > 1 * 60 * 1000; // 1分钟间隔

        if (isNewVisit) {
            stats.visitCount += 1;
            stats.lastVisit = now;
            localStorage.setItem(storageKey, JSON.stringify(stats));
        }

        // 更新页面显示（添加格式化）
        const displayCount = stats.visitCount > 999 ? "999+" : stats.visitCount;
        document.getElementById('total-devices').textContent = `${displayCount} `;

    } catch (e) {
        // 本地存储出错时的降级处理
        console.error('统计功能暂不可用:', e);
        document.getElementById('total-devices').textContent = '访问统计';
    }
}

// 3. 日期时间显示功能（保持不变）
function updateDateTime() {
    const now = new Date();
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
    const dateStr = now.toLocaleDateString('zh-CN', dateOptions);
    const timeStr = now.toLocaleTimeString('zh-CN', timeOptions);
    document.getElementById('current-date').textContent = `${dateStr} ${timeStr}`;
    document.getElementById('current-year').textContent = now.getFullYear();
    setTimeout(updateDateTime, 1000);
}

// 4. 页面加载初始化
function initPage() {
    updateCountdown();
    updateVisitCount(); // 改为调用访问次数统计
    updateDateTime();
    setInterval(updateCountdown, 24 * 60 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', initPage);