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

    // 工具使用记录管理
    const toolUsageManager = {
        // 获取工具使用记录
        getToolUsage() {
            const usage = localStorage.getItem('toolUsage');
            return usage ? JSON.parse(usage) : {};
        },

        // 记录工具使用
        recordToolUsage(toolId) {
            const usage = this.getToolUsage();
            usage[toolId] = Date.now();
            localStorage.setItem('toolUsage', JSON.stringify(usage));
            this.updateMostUsedSection();
        },

        // 获取最常用工具列表
        getMostUsedTools() {
            const usage = this.getToolUsage();
            return Object.entries(usage)
                .sort(([, a], [, b]) => b - a) // 按时间戳倒序排序
                .map(([toolId]) => toolId);
        },

        // 更新最常使用section
        updateMostUsedSection() {
            const mostUsedGrid = document.getElementById('most-used-grid');
            if (!mostUsedGrid) return;

            const mostUsedTools = this.getMostUsedTools();
            if (mostUsedTools.length === 0) {
                mostUsedGrid.innerHTML = '<div class="empty-state">暂无使用记录</div>';
                return;
            }

            // 清空现有内容
            mostUsedGrid.innerHTML = '';

            // 获取所有工具卡片
            const allToolCards = document.querySelectorAll('.tool-card');
            const toolCards = Array.from(allToolCards).filter(card => {
                const button = card.querySelector('.tool-button');
                return button && !button.classList.contains('disabled');
            });

            // 添加最常用的工具卡片（最多显示3个）
            mostUsedTools.slice(0, 3).forEach(toolId => {
                const originalCard = Array.from(toolCards).find(card => {
                    const link = card.querySelector('.tool-button');
                    return link && link.getAttribute('href') && 
                           link.getAttribute('href').includes(toolId);
                });

                if (originalCard) {
                    // 克隆卡片并添加到最常用区域
                    const clonedCard = originalCard.cloneNode(true);
                    
                    // 添加最后使用时间
                    const usage = this.getToolUsage();
                    const lastUsed = new Date(usage[toolId]);
                    const timeLabel = document.createElement('div');
                    timeLabel.className = 'last-used-time';
                    timeLabel.textContent = `最后使用: ${this.formatDate(lastUsed)}`;
                    clonedCard.querySelector('.tool-content').appendChild(timeLabel);

                    mostUsedGrid.appendChild(clonedCard);
                }
            });
        },

        // 格式化日期
        formatDate(date) {
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor(diff / (1000 * 60));

            if (days > 0) {
                return `${days}天前`;
            } else if (hours > 0) {
                return `${hours}小时前`;
            } else if (minutes > 0) {
                return `${minutes}分钟前`;
            } else {
                return '刚刚';
            }
        }
    };

    // 为所有工具按钮添加点击事件
    toolLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href')) {
                const href = this.getAttribute('href');
                const toolId = href.includes('?tool=') ? href.split('?tool=')[1] : href;
                toolUsageManager.recordToolUsage(toolId);
            }
        });
    });

    // 初始化最常使用section
    toolUsageManager.updateMostUsedSection();

    // 添加空状态样式
    const style = document.createElement('style');
    style.textContent = `
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #666;
            font-size: 1.1em;
            background: #f5f5f5;
            border-radius: 8px;
            grid-column: 1 / -1;
        }
        .last-used-time {
            font-size: 0.8em;
            color: #666;
            margin-top: 8px;
            font-style: italic;
        }
        #most-used-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }
        @media screen and (max-width: 992px) {
            #most-used-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        @media screen and (max-width: 768px) {
            #most-used-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
});

// 处理导航交互
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.tools-section');
    const navItems = document.querySelectorAll('.nav-item');
    
    // 平滑滚动
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 滚动时更新当前分类
    const updateActiveSection = () => {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const scrollPosition = window.scrollY + 100; // 添加偏移量以提前触发

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = '#' + section.id;
            }
        });

        // 更新导航项的激活状态
        navItems.forEach(item => {
            if (item.getAttribute('href') === currentSectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    // 监听滚动事件
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateActiveSection);
    });

    // 初始化时执行一次
    updateActiveSection();
}); 