// app-stats.js

// 1. 考试倒计时（保持不变）
function updateCountdown() {
    const examDate = new Date('2026-03-21T00:00:00');
    const today = new Date();
    const timeDiff = examDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    document.getElementById('days-left').textContent = daysLeft > 0 ? daysLeft : "已过期";
}

// 2. 模拟跨设备统计（通过用户交互确认）
function updateTotalDevices() {
    const statsKey = 'wanglaoshi_cross_device_stats';
    const confirmKey = 'wanglaoshi_user_confirmed';

    // 初始化统计（示例数据，实际需用户确认）
    let stats = JSON.parse(localStorage.getItem(statsKey)) || {
        simulatedCount: 1, // 默认值
        lastUpdated: new Date().toISOString()
    };

    // 首次访问时询问用户是否是新设备
    if (!localStorage.getItem(confirmKey)) {
        const isNewDevice = confirm('您是首次在此设备上访问吗？\n\n点击"确定"统计为新设备，点击"取消"不计数。');
        
        if (isNewDevice) {
            stats.simulatedCount += 1;
            localStorage.setItem(statsKey, JSON.stringify(stats));
        }
        
        localStorage.setItem(confirmKey, 'confirmed');
    }

    // 显示统计（模拟值）
    document.getElementById('total-devices').textContent = stats.simulatedCount;
}

// 3. 日期时间（保持不变）
function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });
    const timeStr = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    document.getElementById('current-date').textContent = `${dateStr} ${timeStr}`;
    document.getElementById('current-year').textContent = now.getFullYear();
    setTimeout(updateDateTime, 1000);
}

// 4. 初始化
function initPage() {
    updateCountdown();
    updateTotalDevices();
    updateDateTime();
    setInterval(updateCountdown, 24 * 60 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', initPage);