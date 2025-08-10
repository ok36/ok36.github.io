// app-stats.js

// 1. 考试倒计时功能
function updateCountdown() {
    const examDate = new Date('2026-03-21T00:00:00');
    const today = new Date();
    const timeDiff = examDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    document.getElementById('days-left').textContent = daysLeft > 0 ? daysLeft : "已过期";
}

// 2. 装机量统计（修复版）
function updateTotalDevices() {
    const statsKey = 'wanglaoshi_stats';
    const deviceKey = 'wanglaoshi_device_id';

    // 初始化统计
    let stats = JSON.parse(localStorage.getItem(statsKey)) || {
        totalDevices: 0,
        lastUpdated: new Date().toISOString()
    };

    // 检查是否为新设备
    if (!localStorage.getItem(deviceKey)) {
        // 生成设备ID（简单时间戳+随机数）
        const deviceId = `device_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem(deviceKey, deviceId);

        // 更新统计（防止意外溢出）
        stats.totalDevices = Math.min(stats.totalDevices + 1, 9999); // 最大9999
        stats.lastUpdated = new Date().toISOString();
        localStorage.setItem(statsKey, JSON.stringify(stats));
    }

    // 更新页面显示
    document.getElementById('total-devices').textContent = stats.totalDevices;
}

// 3. 日期时间显示
function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    const timeStr = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    document.getElementById('current-date').textContent = `${dateStr} ${timeStr}`;
    document.getElementById('current-year').textContent = now.getFullYear();
    setTimeout(updateDateTime, 1000);
}

// 4. 页面初始化
function initPage() {
    updateCountdown();
    updateTotalDevices();
    updateDateTime();
    setInterval(updateCountdown, 24 * 60 * 60 * 1000); // 每天更新倒计时
}

document.addEventListener('DOMContentLoaded', initPage);