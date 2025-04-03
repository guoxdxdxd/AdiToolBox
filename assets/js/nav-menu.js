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
    
    // 处理导航菜单项点击事件
    const menuLinks = document.querySelectorAll('.nav-menu-link[data-tool]');
    if (menuLinks.length > 0) {
        // 在layout.html中，处理菜单项点击导航
        menuLinks.forEach(link => {
            // 处理已在layout.js中实现
        });
    } else {
        // 在功能页面中，标记当前页面对应的菜单项为活动状态
        const currentPath = window.location.pathname;
        const menuLinks = document.querySelectorAll('.nav-menu-link');
        
        menuLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            // 使用endsWith检查，以支持相对路径
            if (linkPath && currentPath.endsWith(linkPath)) {
                link.classList.add('active');
            }
        });
        
        // 记录最近使用的工具
        const toolLinks = document.querySelectorAll('.nav-menu-link:not([href="../index.html"])');
        toolLinks.forEach(link => {
            link.addEventListener('click', function() {
                const toolName = this.getAttribute('data-tool');
                if (toolName) {
                    // 将当前工具添加到localStorage的最近使用工具列表中
                    try {
                        let recentTools = JSON.parse(localStorage.getItem('recentTools')) || [];
                        // 如果已存在，则先移除
                        recentTools = recentTools.filter(tool => tool !== toolName);
                        // 添加到列表最前面
                        recentTools.unshift(toolName);
                        // 只保留最近5个
                        if (recentTools.length > 5) {
                            recentTools = recentTools.slice(0, 5);
                        }
                        localStorage.setItem('recentTools', JSON.stringify(recentTools));
                    } catch (e) {
                        console.error('Error saving recent tools:', e);
                    }
                }
            });
        });
    }
}); 