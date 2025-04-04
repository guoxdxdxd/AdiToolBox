/**
 * 导航菜单交互功能
 */
document.addEventListener('DOMContentLoaded', function() {
    // 获取导航菜单元素
    const navMenu = document.querySelector('.nav-menu');
    const navMenuToggle = document.querySelector('.nav-menu-toggle');
    
    if (!navMenu || !navMenuToggle) return;
    
    // 切换导航菜单的显示/隐藏
    navMenuToggle.addEventListener('click', function(event) {
        navMenu.classList.toggle('active');
        // 阻止事件冒泡，避免触发document的点击事件处理
        event.stopPropagation();
    });
    
    // 点击菜单外部时关闭菜单
    document.addEventListener('click', function(event) {
        const isClickInside = navMenu.contains(event.target) || navMenuToggle.contains(event.target);
        if (!isClickInside && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    });
    
    // 最近使用工具管理
    const RECENT_TOOLS_KEY = 'recent_tools';
    const MAX_RECENT_TOOLS = 3;

    // 获取最近使用的工具
    function getRecentTools() {
        const recentTools = localStorage.getItem(RECENT_TOOLS_KEY);
        return recentTools ? JSON.parse(recentTools) : [];
    }

    // 保存最近使用的工具
    function saveRecentTool(tool) {
        let recentTools = getRecentTools();
        
        // 移除已存在的相同工具
        recentTools = recentTools.filter(t => t.id !== tool.id);
        
        // 添加到开头
        recentTools.unshift(tool);
        
        // 限制数量
        if (recentTools.length > MAX_RECENT_TOOLS) {
            recentTools = recentTools.slice(0, MAX_RECENT_TOOLS);
        }
        
        localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(recentTools));
        updateRecentToolsMenu();
    }

    // 更新最近使用工具菜单
    function updateRecentToolsMenu() {
        const recentTools = getRecentTools();
        const menuContainer = document.getElementById('most-used-menu');
        
        if (!menuContainer) return;
        
        menuContainer.innerHTML = '';
        
        recentTools.forEach(tool => {
            const li = document.createElement('li');
            li.className = 'nav-menu-item';
            li.innerHTML = `
                <a href="#" class="nav-menu-link" data-tool="${tool.id}" data-src="${tool.src}">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="currentColor" d="${tool.icon}" />
                    </svg>
                    ${tool.title}
                </a>
            `;
            menuContainer.appendChild(li);
        });
    }

    // 监听工具点击
    document.querySelectorAll('.nav-menu-link[data-tool]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tool = {
                id: this.dataset.tool,
                src: this.dataset.src,
                title: this.textContent.trim(),
                icon: this.querySelector('svg path').getAttribute('d')
            };
            saveRecentTool(tool);
            
            // 加载工具
            const contentFrame = document.getElementById('content-frame');
            if (contentFrame) {
                contentFrame.src = tool.src;
            }
            
            // 更新活动状态
            document.querySelectorAll('.nav-menu-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 关闭菜单
            navMenu.classList.remove('active');
        });
    });

    // 初始化最近使用工具菜单
    updateRecentToolsMenu();
}); 