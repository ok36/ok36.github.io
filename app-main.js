// 工具函数集合
const Utils = {
    // 安全获取DOM元素
    getElement: (selector) => document.querySelector(selector) || document.getElementById(selector),
    
    // 安全添加事件监听
    addEvent: (element, event, handler, options) => {
        if (element) element.addEventListener(event, handler, options);
    },
    
    // 类名操作
    toggleClass: (element, className) => element?.classList.toggle(className),
    addClass: (element, className) => element?.classList.add(className),
    removeClass: (element, className) => element?.classList.remove(className),
    
    // 滚动到顶部
    scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    
    // 防抖函数
    debounce: (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    // 解析URL参数
    getUrlParams: () => {
        const params = {};
        const queryString = window.location.search.substring(1);
        const vars = queryString.split('&');
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=');
            if (pair[0]) {
                params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            }
        }
        return params;
    }
};

// 移动端目录菜单功能
const initMobileMenu = () => {
    const muluBtn = Utils.getElement('mulu-btn');
    if (!muluBtn) return;

    const muluMenu = Utils.getElement('mulu-menu');
    const closeBtn = Utils.getElement('.mulu-close-btn');
    const overlay = Utils.getElement('mulu-overlay');

    const toggleMenu = (e) => {
        e?.preventDefault();
        Utils.toggleClass(muluMenu, 'active');
        Utils.toggleClass(overlay, 'active');
        document.body.style.overflow = muluMenu.classList.contains('active') ? 'hidden' : '';
    };

    const closeMenu = (e) => {
        e?.preventDefault();
        Utils.removeClass(muluMenu, 'active');
        Utils.removeClass(overlay, 'active');
        document.body.style.overflow = '';
    };

    // 添加事件监听
    Utils.addEvent(muluBtn, 'click', toggleMenu);
    Utils.addEvent(closeBtn, 'click', closeMenu);
    Utils.addEvent(overlay, 'click', closeMenu);
    
    // 触摸事件
    Utils.addEvent(muluBtn, 'touchstart', toggleMenu, { passive: false });
    Utils.addEvent(closeBtn, 'touchstart', closeMenu, { passive: false });
    Utils.addEvent(overlay, 'touchstart', closeMenu, { passive: false });
    
    // 滑动关闭功能
    let startX = 0;
    Utils.addEvent(muluMenu, 'touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });
    
    Utils.addEvent(muluMenu, 'touchmove', (e) => {
        if (startX > 50) return;
        if (e.touches[0].clientX < startX) closeMenu();
    }, { passive: true });
};

// 搜索功能模块
class SearchModule {
    constructor() {
        this.originalItems = [];
        this.filteredItems = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 0;
        this.init();
    }

    init() {
        this.createSearchUI();
        this.createSearchButton();
        this.createPaginationControls();
        this.backupOriginalContent();
        this.setupEventListeners();
        
        // 检查URL参数，如果有page参数则跳转到指定页
        const params = Utils.getUrlParams();
        if (params.page) {
            const pageNum = parseInt(params.page);
            if (!isNaN(pageNum)) {
                this.displayPage(pageNum);
            } else {
                this.displayPage(1);
            }
        } else {
            this.displayPage(1);
        }
    }

    createSearchUI() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        
        const searchInputContainer = document.createElement('div');
        searchInputContainer.className = 'search-input-container';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'search-input';
        searchInput.placeholder = '输入关键词搜索...';
        searchInput.autocomplete = 'off';
        
        const resultCounter = document.createElement('span');
        resultCounter.id = 'search-result-counter';
        resultCounter.className = 'search-result-counter';
        
        searchInputContainer.append(searchInput, resultCounter);
        
        const hideBtn = document.createElement('button');
        hideBtn.className = 'search-hide-btn';
        hideBtn.innerHTML = '<i class="fas fa-times"></i>';
        Utils.addEvent(hideBtn, 'click', () => Utils.removeClass(searchContainer, 'visible'));
        
        searchContainer.append(searchInputContainer, hideBtn);
        
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.id = 'no-results';
        noResults.innerHTML = `
            <i class="fas fa-search" style="font-size: 1.5rem; margin-bottom: 10px;"></i>
            <p>没有找到匹配的内容</p>
        `;
        
        document.body.prepend(searchContainer);
        document.body.append(noResults);
    }

    createSearchButton() {
        const title = document.querySelector('.page-title');
        if (!title) return;
        
        const searchBtn = document.createElement('button');
        searchBtn.className = 'search-btn';
        searchBtn.innerHTML = '<i class="fas fa-search"></i>';
        
        Utils.addEvent(searchBtn, 'click', (e) => {
            e.stopPropagation();
            const searchContainer = document.querySelector('.search-container');
            Utils.addClass(searchContainer, 'visible');
            document.getElementById('search-input').focus();
        });
        
        title.appendChild(searchBtn);
    }

    createPaginationControls() {
        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination-controls';
        paginationDiv.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 5px;
            padding: 10px;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
            z-index: 1000;
        `;
        
        paginationDiv.innerHTML = `
            <button id="prev-page" class="page-btn">上页</button>
            <span id="page-info">1/1</span>
            <input type="number" id="page-input" min="1" value="1">
            <button id="go-page" class="page-btn">跳转</button>
            <button id="next-page" class="page-btn">下页</button>
        `;
        
        document.body.appendChild(paginationDiv);
    }

    backupOriginalContent() {
        const contentItems = document.querySelectorAll('.content-item');
        if (contentItems.length === 0) return;
        
        this.originalItems = Array.from(contentItems).map((item, index) => ({
            html: item.innerHTML,
            text: item.textContent,
            index: index
        }));
        
        this.filteredItems = [...this.originalItems];
        this.totalPages = Math.ceil(this.originalItems.length / this.itemsPerPage);
        this.updatePaginationControls();
    }

    highlightText(text, keywords) {
        if (!keywords?.length) return text;
        return keywords.reduce((result, keyword) => {
            const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            return result.replace(regex, match => `<span class="search-highlight">${match}</span>`);
        }, text);
    }

    performSearch() {
        const searchInput = Utils.getElement('search-input').value.trim();
        const noResultsDiv = Utils.getElement('no-results');
        const resultCounter = Utils.getElement('search-result-counter');
        
        if (!searchInput) {
            this.resetSearch();
            return;
        }
        
        const keywords = searchInput.split(/\s+/).filter(Boolean);
        if (!keywords.length) {
            this.resetSearch();
            return;
        }
        
        this.filteredItems = this.originalItems
            .filter(item => keywords.every(k => item.text.toLowerCase().includes(k.toLowerCase())))
            .map(item => ({
                ...item,
                html: this.highlightText(item.html, keywords)
            }));
        
        this.updateSearchResults(resultCounter, noResultsDiv);
    }

    resetSearch() {
        this.filteredItems = [...this.originalItems];
        this.totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
        Utils.getElement('no-results').style.display = 'none';
        Utils.getElement('search-result-counter').textContent = '';
        this.displayPage(1);
    }

    updateSearchResults(resultCounter, noResultsDiv) {
        resultCounter.textContent = this.filteredItems.length ? `${this.filteredItems.length}个结果` : '';
        this.totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
        
        if (this.filteredItems.length) {
            this.displayPage(1);
            noResultsDiv.style.display = 'none';
            Utils.scrollToTop();
        } else {
            Utils.getElement('content').innerHTML = '';
            noResultsDiv.style.display = 'block';
        }
    }

    displayPage(pageNum) {
        if (!this.filteredItems.length) return;
        
        this.currentPage = Math.max(1, Math.min(pageNum, this.totalPages));
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const pageItems = this.filteredItems.slice(startIdx, startIdx + this.itemsPerPage);
        
        const contentDiv = Utils.getElement('content') || document.createElement('div');
        contentDiv.id = 'content';
        contentDiv.innerHTML = pageItems.map(item => 
            `<div class="content-item" data-index="${item.index}">${item.html}</div>`
        ).join('');
        
        if (!Utils.getElement('content')) {
            document.body.appendChild(contentDiv);
        }
        
        this.updatePaginationControls();
        
        // 更新URL参数但不刷新页面
        const params = new URLSearchParams(window.location.search);
        params.set('page', this.currentPage);
        const newUrl = window.location.pathname + '?' + params.toString();
        window.history.replaceState({ path: newUrl }, '', newUrl);
    }

    updatePaginationControls() {
        const pageInfo = Utils.getElement('page-info');
        const pageInput = Utils.getElement('page-input');
        const prevBtn = Utils.getElement('prev-page');
        const nextBtn = Utils.getElement('next-page');
        
        if (pageInfo) pageInfo.textContent = `${this.currentPage}/${this.totalPages}`;
        if (pageInput) {
            pageInput.value = this.currentPage;
            pageInput.max = this.totalPages;
        }
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
            prevBtn.style.opacity = this.currentPage <= 1 ? '0.5' : '1';
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages;
            nextBtn.style.opacity = this.currentPage >= this.totalPages ? '0.5' : '1';
        }
    }

    setupEventListeners() {
        const searchInput = Utils.getElement('search-input');
        if (!searchInput) return;
        
        Utils.addEvent(searchInput, 'input', Utils.debounce(() => this.performSearch(), 300));
        
        Utils.addEvent(Utils.getElement('prev-page'), 'click', () => 
            this.handlePageChange(this.currentPage - 1));
        
        Utils.addEvent(Utils.getElement('next-page'), 'click', () => 
            this.handlePageChange(this.currentPage + 1));
        
        Utils.addEvent(Utils.getElement('go-page'), 'click', () => this.handlePageJump());
        Utils.addEvent(Utils.getElement('page-input'), 'keypress', (e) => {
            if (e.key === 'Enter') this.handlePageJump();
        });
    }
    
    handlePageChange(newPage) {
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.displayPage(newPage);
            Utils.scrollToTop();
        }
    }
    
    handlePageJump() {
        const pageInput = Utils.getElement('page-input');
        const pageNum = parseInt(pageInput.value);
        if (!isNaN(pageNum)) this.handlePageChange(pageNum);
    }
}

// 设置功能
const initSettings = () => {
    // 创建设置UI
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'settings-btn';
    settingsBtn.id = 'settings-btn';
    settingsBtn.title = '设置';
    settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
    
    const settingsPanel = document.createElement('div');
    settingsPanel.className = 'settings-panel';
    settingsPanel.id = 'settings-panel';
    
    settingsPanel.innerHTML = `
        <div class="setting-option">
            <label for="font-size-select"><i class="fas fa-text-height"></i> 字体大小</label>
            <select id="font-size-select">
                <option value="small">小号</option>
                <option value="medium" selected>中号</option>
                <option value="large">大号</option>
                <option value="xlarge">特大</option>
            </select>
        </div>
        <div class="setting-option">
            <label for="theme-select"><i class="fas fa-palette"></i> 主题</label>
            <select id="theme-select">
                <option value="default" selected>默认</option>
                <option value="eye-care">护眼</option>
                <option value="dark">夜间</option>
            </select>
        </div>
    `;
    
    document.body.append(settingsBtn, settingsPanel);
    
    // 初始化设置功能
    const setBodyClass = (type, value) => {
        document.body.className = document.body.className.replace(new RegExp(`\\b${type}-\\w+`, 'g'), '');
        document.body.classList.add(`${type}-${value}`);
        localStorage.setItem(type, value);
    };
    
    // 加载用户设置
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const savedTheme = localStorage.getItem('theme') || 'default';
    setBodyClass('font', savedFontSize);
    setBodyClass('theme', savedTheme);
    
    // 设置事件监听
    Utils.addEvent(Utils.getElement('settings-btn'), 'click', (e) => {
        e.stopPropagation();
        Utils.toggleClass(Utils.getElement('settings-panel'), 'show');
    });
    
    Utils.addEvent(Utils.getElement('font-size-select'), 'change', (e) => 
        setBodyClass('font', e.target.value));
    
    Utils.addEvent(Utils.getElement('theme-select'), 'change', (e) => 
        setBodyClass('theme', e.target.value));
    
    Utils.addEvent(document, 'click', () => 
        Utils.removeClass(Utils.getElement('settings-panel'), 'show'));
    
    Utils.addEvent(Utils.getElement('settings-panel'), 'click', (e) => 
        e.stopPropagation());
};

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSettings();
    new SearchModule();
});

//防止恶意复制
// 禁用右键菜单
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// 禁用文本选择
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
});

// 禁用复制快捷键 Ctrl+C, Ctrl+Insert
document.addEventListener('keydown', function(e) {
    // 禁用 Ctrl+C
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        return false;
    }
    
    // 禁用 Ctrl+Insert (某些系统上的复制快捷键)
    if (e.ctrlKey && e.key === 'Insert') {
        e.preventDefault();
        return false;
    }
    
    // 禁用 Ctrl+U (查看源代码)
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
    }
    
    // 禁用 F12 (开发者工具)
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
});

// 禁用剪贴板复制
document.addEventListener('copy', function(e) {
    e.preventDefault();
    return false;
});

// 禁用剪切
document.addEventListener('cut', function(e) {
    e.preventDefault();
    return false;
});

// 禁用粘贴到页面（防止通过粘贴方式添加内容）
document.addEventListener('paste', function(e) {
    e.preventDefault();
    return false;
});

// 针对触摸设备，禁用长按选择文本
document.addEventListener('touchstart', function(e) {
    // 记录触摸开始时间
    this.startTime = new Date().getTime();
}, false);

document.addEventListener('touchend', function(e) {
    // 计算触摸持续时间，如果超过500ms，视为长按
    var endTime = new Date().getTime();
    if (endTime - this.startTime > 500) {
        e.preventDefault();
        return false;
    }
}, false);

// 禁用鼠标拖拽选择
document.addEventListener('mousedown', function(e) {
    e.preventDefault();
    return false;
}, true);

// 为所有元素添加样式，防止文本选择
var style = document.createElement('style');
style.textContent = `
    * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        pointer-events: auto !important;
    }
    /* 确保输入框仍然可以使用（如果需要） */
    input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
    }
`;
document.head.appendChild(style);
