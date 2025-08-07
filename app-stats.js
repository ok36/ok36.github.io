// 获取准确时间的方案
async function fetchOfficialDate() {
    // 先显示本地日期作为临时值
    updateLocalDate();
    
    try {
        // 使用更可靠的WorldTimeAPI
        const response = await fetch('https://worldtimeapi.org/api/ip');
        if (!response.ok) throw new Error('API响应不正常');
        
        const data = await response.json();
        const date = new Date(data.datetime);
        
        if (!isNaN(date.getTime())) {
            updateDateDisplay(date);
        } else {
            throw new Error('日期格式无效');
        }
    } catch (error) {
        console.log('获取网络时间失败，使用本地时间:', error);
        updateLocalDate();
    }
}

function updateLocalDate() {
    const now = new Date();
    updateDateDisplay(now);
    // 更新版权年份
    document.getElementById('current-year').textContent = now.getFullYear();
}

function updateDateDisplay(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const dateStr = `今天是 ${date.toLocaleDateString('zh-CN', options)}`;
    document.getElementById('current-date').textContent = dateStr;
}

// 计算距离2026年3月21日的天数:专升本考试。
function calculateDaysLeft() {
    const targetDate = new Date('2026-03-21');
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById('days-left').textContent = diffDays > 0 ? diffDays : 0;
}

// 统计使用时长
let totalSeconds = 0;
let usageInterval;

function startUsageTimer() {
    // 从本地存储加载之前的使用时长
    const savedSeconds = localStorage.getItem('appUsageSeconds');
    if (savedSeconds) {
        totalSeconds = parseInt(savedSeconds, 10);
    }
    
    // 更新显示
    updateUsageDisplay();
    
    // 开始计时
    usageInterval = setInterval(() => {
        totalSeconds++;
        localStorage.setItem('appUsageSeconds', totalSeconds.toString());
        updateUsageDisplay();
    }, 1000);
}

function updateUsageDisplay() {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    document.getElementById('total-usage').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 统计装机量
function updateInstallCount() {
    // 检查是否已经统计过
    if (!localStorage.getItem('isInstalled')) {
        // 获取当前装机量
        let installCount = localStorage.getItem('appInstallCount') || 0;
        installCount = parseInt(installCount, 10) + 1;
        
        // 更新本地存储
        localStorage.setItem('appInstallCount', installCount.toString());
        localStorage.setItem('isInstalled', 'true');
    }
    
    // 显示装机量
    const installCount = localStorage.getItem('appInstallCount') || 0;
    document.getElementById('install-count').textContent = installCount;
}

// 模拟在线人数（实际应用中应该从服务器获取）
function updateOnlineCount() {
    // 这里只是模拟，实际应用中应该从服务器API获取
    const baseOnline = Math.floor(Math.random() * 50) + 20;
    document.getElementById('online-count').textContent = baseOnline;
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    fetchOfficialDate();
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // 初始化统计功能
    calculateDaysLeft();
    updateInstallCount();
    startUsageTimer();
    updateOnlineCount();
    
    // 每分钟更新一次日期和在线人数
    setInterval(fetchOfficialDate, 60000);
    setInterval(updateOnlineCount, 30000); // 每30秒更新一次在线人数
    setInterval(calculateDaysLeft, 86400000); // 每天更新一次剩余天数
});

// 防止复制等操作的代码
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.key === 'Insert') {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
    }
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
});

document.addEventListener('copy', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('cut', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('paste', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('touchstart', function(e) {
    this.startTime = new Date().getTime();
}, false);

document.addEventListener('touchend', function(e) {
    var endTime = new Date().getTime();
    if (endTime - this.startTime > 500) {
        e.preventDefault();
        return false;
    }
}, false);

document.addEventListener('mousedown', function(e) {
    if (!e.target.closest('#settings-btn') && !e.target.closest('#settings-panel')) {
        e.preventDefault();
        return false;
    }
}, true);