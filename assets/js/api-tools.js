// API工具核心功能实现

class APITool {
    constructor() {
        this.collections = [];
        this.currentRequest = null;
        this.tagDescriptions = {}; // 存储tag描述信息
        this.collapsedTags = new Set(JSON.parse(localStorage.getItem('collapsedTags') || '[]')); // 存储折叠状态
        this.swaggerConfigs = JSON.parse(localStorage.getItem('swaggerConfigs') || '[]'); // 存储swagger配置
        this.initializeElements();
        this.initializeEventListeners();
        this.loadCollections();
    }

    initializeElements() {
        // 工具栏元素
        this.methodSelect = document.getElementById('requestMethod');
        this.urlInput = document.getElementById('requestUrl');
        this.sendButton = document.getElementById('sendRequest');
        this.saveButton = document.getElementById('saveRequest');
        this.manageSwaggerButton = document.getElementById('manageSwagger');

        // 对话框元素
        this.dialogOverlay = document.getElementById('dialogOverlay');
        this.swaggerConfigDialog = document.getElementById('swaggerConfigDialog');
        this.configTableBody = document.getElementById('configTableBody');
        this.addConfigButton = document.getElementById('addConfig');
        this.closeConfigDialog = document.getElementById('closeConfigDialog');

        // 标签页元素
        this.requestTabs = document.querySelectorAll('.request-tabs .tab-btn');
        this.responseTabs = document.querySelectorAll('.response-tabs .tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');

        // 集合列表元素
        this.collectionsList = document.getElementById('apiCollections');

        // 参数和请求头表格元素
        this.paramsTableBody = document.getElementById('paramsTableBody');
        this.headersTableBody = document.getElementById('headersTableBody');
        this.addParamButton = document.getElementById('addParam');
        this.addHeaderButton = document.getElementById('addHeader');
        this.formatBodyButton = document.getElementById('formatBody');

        // 初始化表格
        this.addParamRow();
        this.addHeaderRow();
    }

    initializeEventListeners() {
        // 标签页切换
        this.requestTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab, 'request'));
        });

        this.responseTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab, 'response'));
        });

        // 发送请求
        this.sendButton.addEventListener('click', () => this.sendRequest());

        // 保存请求
        this.saveButton.addEventListener('click', () => this.saveRequest());

        // 添加参数和请求头
        this.addParamButton.addEventListener('click', () => this.addParamRow());
        this.addHeaderButton.addEventListener('click', () => this.addHeaderRow());

        // 格式化请求体
        this.formatBodyButton.addEventListener('click', () => this.formatBody());

        // Swagger配置管理
        this.manageSwaggerButton.addEventListener('click', () => this.showSwaggerConfigDialog());
        this.addConfigButton.addEventListener('click', () => this.showAddConfigDialog());
        this.closeConfigDialog.addEventListener('click', () => this.hideSwaggerConfigDialog());
        this.dialogOverlay.addEventListener('click', (e) => {
            if (e.target === this.dialogOverlay) {
                this.hideSwaggerConfigDialog();
            }
        });
    }

    switchTab(tab, type) {
        const tabName = tab.dataset.tab;
        
        // 更新标签页状态
        if (type === 'request') {
            this.requestTabs.forEach(t => t.classList.remove('active'));
        } else {
            this.responseTabs.forEach(t => t.classList.remove('active'));
        }
        tab.classList.add('active');

        // 更新内容区域
        this.tabContents.forEach(content => {
            if (content.id.includes(tabName)) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    addParamRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="param-name" placeholder="参数名"></td>
            <td><input type="text" class="param-value" placeholder="参数值"></td>
            <td>
                <button class="delete-row" onclick="this.closest('tr').remove()">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                </button>
            </td>
        `;
        this.paramsTableBody.appendChild(row);
    }

    addHeaderRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="header-name" placeholder="请求头名称"></td>
            <td><input type="text" class="header-value" placeholder="请求头值"></td>
            <td>
                <button class="delete-row" onclick="this.closest('tr').remove()">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                </button>
            </td>
        `;
        this.headersTableBody.appendChild(row);
    }

    getParams() {
        const params = {};
        this.paramsTableBody.querySelectorAll('tr').forEach(row => {
            const name = row.querySelector('.param-name').value.trim();
            const value = row.querySelector('.param-value').value.trim();
            if (name) {
                params[name] = value;
            }
        });
        return params;
    }

    getHeaders() {
        const headers = {};
        this.headersTableBody.querySelectorAll('tr').forEach(row => {
            const name = row.querySelector('.header-name').value.trim();
            const value = row.querySelector('.header-value').value.trim();
            if (name) {
                headers[name] = value;
            }
        });
        return headers;
    }

    getRequestBody() {
        try {
            return window.editor ? window.editor.getValue() : '';
        } catch (error) {
            console.error('获取请求体失败:', error);
            return '';
        }
    }

    setRequestBody(value) {
        try {
            if (window.editor) {
                window.editor.setValue(value || '');
            }
        } catch (error) {
            console.error('设置请求体失败:', error);
        }
    }

    formatBody() {
        try {
            const value = this.getRequestBody();
            if (!value) return;
            
            const formatted = JSON.stringify(JSON.parse(value), null, 2);
            this.setRequestBody(formatted);
        } catch (error) {
            this.showNotification('JSON格式化失败: ' + error.message, 'error');
        }
    }

    async sendRequest() {
        const method = this.methodSelect.value;
        const url = this.urlInput.value;

        if (!url) {
            this.showNotification('请输入请求URL', 'error');
            return;
        }

        // 构建URL参数
        const params = this.getParams();
        const urlWithParams = new URL(url);
        Object.entries(params).forEach(([key, value]) => {
            urlWithParams.searchParams.append(key, value);
        });

        try {
            const headers = this.getHeaders();
            const body = this.getRequestBody();

            const response = await fetch(urlWithParams.toString(), {
                method: method,
                headers: headers,
                body: ['GET', 'HEAD'].includes(method) ? null : body
            });

            const responseData = await response.json();
            this.displayResponse(response, responseData);
        } catch (error) {
            this.showNotification('请求失败: ' + error.message, 'error');
        }
    }

    displayResponse(response, data) {
        const responseTab = document.getElementById('responseTab');
        responseTab.innerHTML = '';

        // 显示响应状态码
        const statusCode = document.createElement('div');
        statusCode.className = `status-code ${response.ok ? 'success' : 'error'}`;
        statusCode.textContent = `${response.status} ${response.statusText}`;
        responseTab.appendChild(statusCode);

        // 显示响应数据
        const responseData = document.createElement('pre');
        responseData.textContent = JSON.stringify(data, null, 2);
        responseTab.appendChild(responseData);

        // 显示响应头
        const responseHeadersTab = document.getElementById('responseHeadersTab');
        responseHeadersTab.innerHTML = '';
        const headersList = document.createElement('pre');
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });
        headersList.textContent = JSON.stringify(headers, null, 2);
        responseHeadersTab.appendChild(headersList);
    }

    saveRequest() {
        const request = {
            method: this.methodSelect.value,
            url: this.urlInput.value,
            params: this.getParams(),
            headers: this.getHeaders(),
            body: this.getRequestBody()
        };

        this.collections.push(request);
        this.saveCollections();
        this.updateCollectionsList();
        this.showNotification('请求已保存', 'success');
    }

    loadCollections() {
        const savedCollections = localStorage.getItem('apiCollections');
        if (savedCollections) {
            this.collections = JSON.parse(savedCollections);
            this.updateCollectionsList();
        }
    }

    saveCollections() {
        localStorage.setItem('apiCollections', JSON.stringify(this.collections));
    }

    updateCollectionsList() {
        this.collectionsList.innerHTML = '';
        
        // 按tag分组API
        const groupedCollections = {};
        this.collections.forEach((collection) => {
            collection.tags.forEach(tag => {
                if (!groupedCollections[tag]) {
                    groupedCollections[tag] = [];
                }
                groupedCollections[tag].push(collection);
            });
        });
        
        // 按tag显示API
        Object.entries(groupedCollections).forEach(([tag, collections]) => {
            const isCollapsed = this.collapsedTags.has(tag);
            
            // 创建分组标题
            const groupTitle = document.createElement('div');
            groupTitle.className = 'collection-group-title';
            
            // 添加折叠图标
            const collapseIcon = document.createElement('span');
            collapseIcon.className = `collapse-icon ${isCollapsed ? 'collapsed' : ''}`;
            collapseIcon.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                </svg>
            `;
            
            // 添加标题文本
            const titleText = document.createElement('span');
            titleText.className = 'title-text';
            const description = this.tagDescriptions[tag] || tag;
            titleText.innerHTML = tag === description ? tag : `${tag} <span class="tag-description">${description}</span>`;
            
            groupTitle.appendChild(collapseIcon);
            groupTitle.appendChild(titleText);
            groupTitle.addEventListener('click', () => this.toggleTagCollapse(tag));
            this.collectionsList.appendChild(groupTitle);
            
            // 创建分组容器
            const groupContainer = document.createElement('div');
            groupContainer.className = `collection-group ${isCollapsed ? 'collapsed' : ''}`;
            
            // 添加该分组下的所有API
            collections.forEach((collection, index) => {
                const item = document.createElement('div');
                item.className = 'collection-item';
                
                // 创建方法标签
                const methodSpan = document.createElement('span');
                methodSpan.className = `method-tag ${collection.method.toLowerCase()}`;
                methodSpan.textContent = collection.method;
                
                // 创建描述/URL文本
                const textSpan = document.createElement('span');
                textSpan.className = 'collection-text';
                textSpan.textContent = collection.description || collection.url;
                
                // 添加提示框显示完整信息
                item.title = `${collection.method} ${collection.url}${collection.description ? '\n' + collection.description : ''}`;
                
                item.appendChild(methodSpan);
                item.appendChild(textSpan);
                item.addEventListener('click', () => this.loadRequest(this.collections.indexOf(collection)));
                groupContainer.appendChild(item);
            });
            
            this.collectionsList.appendChild(groupContainer);
        });
    }

    loadRequest(index) {
        const request = this.collections[index];
        this.methodSelect.value = request.method;
        this.urlInput.value = request.url;

        // 加载参数
        this.paramsTableBody.innerHTML = '';
        Object.entries(request.params || {}).forEach(([name, value]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" class="param-name" value="${name}"></td>
                <td><input type="text" class="param-value" value="${value}"></td>
                <td>
                    <button class="delete-row" onclick="this.closest('tr').remove()">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                    </button>
                </td>
            `;
            this.paramsTableBody.appendChild(row);
        });

        // 加载请求头
        this.headersTableBody.innerHTML = '';
        Object.entries(request.headers || {}).forEach(([name, value]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" class="header-name" value="${name}"></td>
                <td><input type="text" class="header-value" value="${value}"></td>
                <td>
                    <button class="delete-row" onclick="this.closest('tr').remove()">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                    </button>
                </td>
            `;
            this.headersTableBody.appendChild(row);
        });

        // 加载请求体
        this.setRequestBody(request.body);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    toggleTagCollapse(tag) {
        if (this.collapsedTags.has(tag)) {
            this.collapsedTags.delete(tag);
        } else {
            this.collapsedTags.add(tag);
        }
        localStorage.setItem('collapsedTags', JSON.stringify(Array.from(this.collapsedTags)));
        this.updateCollectionsList();
    }

    showSwaggerConfigDialog() {
        this.dialogOverlay.classList.add('show');
        this.swaggerConfigDialog.classList.add('show');
        this.updateConfigList();
    }

    hideSwaggerConfigDialog() {
        this.dialogOverlay.classList.remove('show');
        this.swaggerConfigDialog.classList.remove('show');
    }

    showAddConfigDialog(config = null) {
        const dialog = document.createElement('div');
        dialog.className = 'dialog';
        dialog.innerHTML = `
            <h3>${config ? '修改' : '新增'}Swagger配置</h3>
            <form id="configForm">
                <div class="form-group">
                    <label for="systemName">系统名</label>
                    <input type="text" id="systemName" value="${config?.systemName || ''}" required>
                </div>
                <div class="form-group">
                    <label for="swaggerUrl">Swagger地址</label>
                    <input type="text" id="swaggerUrl" value="${config?.swaggerUrl || ''}" required>
                </div>
                <div class="form-group">
                    <label for="domain">域名</label>
                    <input type="text" id="domain" value="${config?.domain || ''}" required>
                </div>
                <div class="dialog-buttons">
                    <button type="button" class="cancel">取消</button>
                    <button type="submit" class="btn-primary">保存</button>
                </div>
            </form>
        `;

        this.dialogOverlay.appendChild(dialog);
        dialog.classList.add('show');

        const form = dialog.querySelector('#configForm');
        const cancelButton = dialog.querySelector('.cancel');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const systemName = form.querySelector('#systemName').value;
            const swaggerUrl = form.querySelector('#swaggerUrl').value;
            const domain = form.querySelector('#domain').value;

            if (config) {
                // 修改配置
                const index = this.swaggerConfigs.findIndex(c => c.id === config.id);
                if (index !== -1) {
                    this.swaggerConfigs[index] = { ...config, systemName, swaggerUrl, domain };
                }
            } else {
                // 新增配置
                this.swaggerConfigs.push({
                    id: Date.now().toString(),
                    systemName,
                    swaggerUrl,
                    domain
                });
            }

            localStorage.setItem('swaggerConfigs', JSON.stringify(this.swaggerConfigs));
            this.updateConfigList();
            this.dialogOverlay.removeChild(dialog);
        });

        cancelButton.addEventListener('click', () => {
            this.dialogOverlay.removeChild(dialog);
        });
    }

    updateConfigList() {
        this.configTableBody.innerHTML = '';
        this.swaggerConfigs.forEach(config => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${config.systemName}</td>
                <td>${config.swaggerUrl}</td>
                <td>${config.domain}</td>
                <td>
                    <button class="action-btn load-config" data-config-id="${config.id}">加载</button>
                    <button class="action-btn edit-config" data-config-id="${config.id}">修改</button>
                    <button class="action-btn delete-config" data-config-id="${config.id}">删除</button>
                </td>
            `;
            this.configTableBody.appendChild(row);
        });
    }

    async loadSwaggerConfig(configId) {
        const config = this.swaggerConfigs.find(c => c.id === configId);
        if (!config) return;

        try {
            let swaggerData;
            
            // 判断是否是本地文件
            if (config.swaggerUrl.startsWith('file://') || !config.swaggerUrl.startsWith('http')) {
                // 创建文件输入元素
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                
                // 等待用户选择文件
                const file = await new Promise((resolve) => {
                    input.onchange = (e) => resolve(e.target.files[0]);
                    input.click();
                });
                
                if (!file) return;
                
                // 读取文件内容
                const content = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(e);
                    reader.readAsText(file);
                });
                
                swaggerData = JSON.parse(content);
            } else {
                // 远程URL请求
                const response = await fetch(config.swaggerUrl);
                swaggerData = await response.json();
            }
            
            this.parseSwagger(swaggerData, config.domain);
            this.hideSwaggerConfigDialog();
            this.showNotification('Swagger配置加载成功', 'success');
        } catch (error) {
            console.error('加载Swagger配置失败:', error);
            this.showNotification('加载Swagger配置失败: ' + error.message, 'error');
        }
    }

    deleteSwaggerConfig(configId) {
        if (confirm('确定要删除这个配置吗？')) {
            this.swaggerConfigs = this.swaggerConfigs.filter(c => c.id !== configId);
            localStorage.setItem('swaggerConfigs', JSON.stringify(this.swaggerConfigs));
            this.updateConfigList();
            this.showNotification('配置已删除', 'success');
        }
    }
}

// 初始化API工具
document.addEventListener('DOMContentLoaded', () => {
    window.apiTool = new APITool();
    
    // 使用事件委托处理配置列表的点击事件
    document.getElementById('configTableBody').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('load-config')) {
            const configId = target.dataset.configId;
            window.apiTool.loadSwaggerConfig(configId);
        } else if (target.classList.contains('edit-config')) {
            const configId = target.dataset.configId;
            const config = window.apiTool.swaggerConfigs.find(c => c.id === configId);
            if (config) {
                window.apiTool.showAddConfigDialog(config);
            }
        } else if (target.classList.contains('delete-config')) {
            const configId = target.dataset.configId;
            window.apiTool.deleteSwaggerConfig(configId);
        }
    });
}); 