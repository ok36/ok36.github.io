// app-stats.js

// 1. 考试倒计时（保持不变）
function updateCountdown() {
    const examDate = new Date('2026-03-21T00:00:00');
    const today = new Date();
    const timeDiff = examDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    document.getElementById('days-left').textContent = daysLeft > 0 ? daysLeft : "已过期";
}

// 2. 无打扰设备统计（基于浏览器指纹）
function updateTotalDevices() {
    const statsKey = 'wanglaoshi_device_stats_v4';
    const fingerprintKey = 'wanglaoshi_fingerprint';

    // 生成简易浏览器指纹（不保证唯一性，但足够简单）
    function generateFingerprint() {
        const keys = [
            navigator.userAgent,
            navigator.hardwareConcurrency,
            navigator.deviceMemory,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset()
        ];
        return keys.join('|');
    }

    // 获取或初始化统计
    let stats = JSON.parse(localStorage.getItem(statsKey)) || {
        totalDevices: 0,
        knownFingerprints: []
    };

    // 检查当前设备指纹
    const currentFingerprint = generateFingerprint();
    const isNewDevice = !stats.knownFingerprints.includes(currentFingerprint);

    if (isNewDevice) {
        stats.totalDevices += 1;
        stats.knownFingerprints.push(currentFingerprint);
        localStorage.setItem(statsKey, JSON.stringify(stats));
    }

    // 更新显示（限制最大显示值）
    document.getElementById('total-devices').textContent = 
        Math.min(stats.totalDevices, 9999); // 防止异常值
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