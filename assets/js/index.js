document.addEventListener('DOMContentLoaded', function() {
    // 保存最后访问的工具，以便在首页加载时显示最近使用的工具
    const toolLinks = document.querySelectorAll('.tool-button:not(.disabled)');
    
    toolLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href')) {
                // 记录最后访问的工具 - 从URL中提取tool参数
                const href = this.getAttribute('href');
                const toolId = href.includes('?tool=') ? href.split('?tool=')[1] : href;
                localStorage.setItem('lastVisitedTool', toolId);
            }
        });
    });

    // 检查是否有最近使用的工具
    const lastVisitedTool = localStorage.getItem('lastVisitedTool');
    if (lastVisitedTool) {
        // 查找对应的工具卡片并添加一个"最近使用"的标记
        toolLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.includes(lastVisitedTool) || 
                        href.includes(`?tool=${lastVisitedTool}`))) {
                const toolCard = link.closest('.tool-card');
                if (toolCard) {
                    // 创建"最近使用"标记
                    const recentBadge = document.createElement('span');
                    recentBadge.className = 'recent-badge';
                    recentBadge.textContent = '最近使用';
                    
                    // 将标记添加到工具卡片
                    const toolHeader = toolCard.querySelector('h2');
                    if (toolHeader && !toolHeader.querySelector('.recent-badge')) {
                        toolHeader.appendChild(recentBadge);
                        
                        // 添加CSS样式
                        const style = document.createElement('style');
                        style.textContent = `
                            .recent-badge {
                                font-size: 0.7rem;
                                background-color: #28a745;
                                color: white;
                                padding: 2px 8px;
                                border-radius: 12px;
                                margin-left: 10px;
                                font-weight: normal;
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }
            }
        });
    }
}); 