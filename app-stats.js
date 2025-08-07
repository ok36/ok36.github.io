// 获取准确时间的方案
async function fetchOfficialDate() {
    updateLocalDate();
    try {
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
    document.getElementById('current-date').textContent = `今天是 ${date.toLocaleDateString('zh-CN', options)}`;
}

function calculateDaysLeft() {
    const targetDate = new Date('2026-03-21');
    const diffDays = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));
    document.getElementById('days-left').textContent = diffDays > 0 ? diffDays : 0;
}

// 模拟在线人数
function updateOnlineCount() {
    document.getElementById('online-count').textContent = Math.floor(Math.random() * 50) + 20;
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    fetchOfficialDate();
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    calculateDaysLeft();
    updateOnlineCount();
    
    setInterval(fetchOfficialDate, 60000);
    setInterval(updateOnlineCount, 30000);
    setInterval(calculateDaysLeft, 86400000);
});