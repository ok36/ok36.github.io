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

// 2. 总设备统计功能
function updateTotalDevices() {
    // 本地存储键名
    const storageKey = 'wanglaoshi_total_devices';
    const deviceKey = 'wanglaoshi_device_id';
    
    // 获取或初始化统计数据
    let stats = JSON.parse(localStorage.getItem(storageKey)) || {
        totalDevices: 0
    };
    
    // 检查是否为首次访问的设备
    const isNewDevice = !localStorage.getItem(deviceKey);
    
    if (isNewDevice) {
        // 为新设备生成唯一ID并存储
        const deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(deviceKey, deviceId);
        
        // 更新总设备数
        stats.totalDevices += 1;
        
        // 保存到本地存储
        localStorage.setItem(storageKey, JSON.stringify(stats));
    }
    
    // 更新页面显示
    document.getElementById('total-devices').textContent = stats.totalDevices;
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
    updateTotalDevices();
    updateDateTime();
    
    // 设置定时器
    setInterval(updateCountdown, 24 * 60 * 60 * 1000); // 每天更新倒计时
}

// 5. 监听DOM加载完成事件
document.addEventListener('DOMContentLoaded', initPage);

// 导出函数（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateCountdown,
        updateTotalDevices,
        updateDateTime
    };
}