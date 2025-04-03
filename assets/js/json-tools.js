// DOM元素
const editor = document.getElementById('editor');
const notification = document.getElementById('notification');
const historyList = document.getElementById('historyList');

// 历史记录管理
const history = {
    records: [],
    currentIndex: -1,
    maxSize: 50,

    push(value) {
        // 如果在历史记录中间位置做了修改，删除后面的记录
        if (this.currentIndex < this.records.length - 1) {
            this.records.splice(this.currentIndex + 1);
        }
        
        // 添加新记录
        this.records.push(value);
        
        // 如果超出最大大小，删除最早的记录
        if (this.records.length > this.maxSize) {
            this.records.shift();
        }
        
        this.currentIndex = this.records.length - 1;
    },

    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.records[this.currentIndex];
        }
        return null;
    },

    redo() {
        if (this.currentIndex < this.records.length - 1) {
            this.currentIndex++;
            return this.records[this.currentIndex];
        }
        return null;
    }
};

// JSON序列化历史记录管理
const jsonHistory = {
    maxSize: 20,
    storageKey: 'jsonToolHistory',

    // 获取历史记录
    getHistory() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    },

    // 保存历史记录
    saveHistory(history) {
        localStorage.setItem(this.storageKey, JSON.stringify(history));
    },

    // 添加新记录
    addRecord(text) {
        const history = this.getHistory();
        const record = {
            text: text,
            preview: text.length > 100 ? text.substring(0, 100) + '...' : text,
            timestamp: new Date().toISOString()
        };

        history.unshift(record);
        if (history.length > this.maxSize) {
            history.pop();
        }

        this.saveHistory(history);
        this.renderHistory();
    },

    // 清空历史记录
    clearHistory() {
        localStorage.removeItem(this.storageKey);
        this.renderHistory();
    },

    // 渲染历史记录
    renderHistory() {
        const history = this.getHistory();
        historyList.innerHTML = '';

        history.forEach(record => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-item-time">${new Date(record.timestamp).toLocaleString()}</div>
                <div class="history-item-preview">${record.preview}</div>
            `;
            item.addEventListener('click', () => {
                editor.value = record.text;
                history.push(editor.value);
            });
            historyList.appendChild(item);
        });
    }
};

// 初始化历史记录
history.push(editor.value);
jsonHistory.renderHistory();

// 监听文本变化
editor.addEventListener('input', () => {
    history.push(editor.value);
});

// 监听键盘事件
editor.addEventListener('keydown', (e) => {
    // 检测操作系统
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    // Mac: Cmd+Z, Win: Ctrl+Z
    if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const previousValue = history.undo();
        if (previousValue !== null) {
            editor.value = previousValue;
        }
    }
    
    // Mac: Cmd+Shift+Z, Win: Ctrl+Y
    if ((isMac && e.metaKey && e.shiftKey && e.key === 'z') || 
        (!isMac && e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        const nextValue = history.redo();
        if (nextValue !== null) {
            editor.value = nextValue;
        }
    }
});

// 工具函数：显示通知
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.className = `notification show${isError ? ' error' : ''}`;
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

// 工具函数：获取选中的文本或全部文本
function getSelectedText() {
    const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    return selectedText || editor.value;
}

// 工具函数：替换选中的文本或全部文本
function replaceSelectedText(newText) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const hasSelection = start !== end;

    if (hasSelection) {
        const before = editor.value.substring(0, start);
        const after = editor.value.substring(end);
        editor.value = before + newText + after;
        // 保持选区
        editor.setSelectionRange(start, start + newText.length);
    } else {
        editor.value = newText;
        // 将光标移到末尾
        editor.setSelectionRange(newText.length, newText.length);
    }
    
    // 添加到历史记录
    history.push(editor.value);
}

// 工具函数：尝试去除转义
function tryUnescapeText(text) {
    try {
        return text
            .replace(/\\"/g, '"')     // 双引号
            .replace(/\\'/g, "'")     // 单引号
            .replace(/\\f/g, '\f')    // 换页
            .replace(/\\\\/g, '\\');  // 反斜杠（最后处理）
    } catch {
        return text;
    }
}

// JSON序列化
document.getElementById('jsonSerialize').addEventListener('click', () => {
    try {
        const text = getSelectedText();
        let result;
        
        try {
            // 尝试先去除转义
            const unescapedText = tryUnescapeText(text);
            // 尝试解析JSON
            const parsed = JSON.parse(unescapedText);
            // 格式化JSON，使用2个空格缩进
            result = JSON.stringify(parsed, null, 2);
        } catch {
            try {
                // 如果去除转义后解析失败，尝试直接解析原文本
                const parsed = JSON.parse(text);
                result = JSON.stringify(parsed, null, 2);
            } catch {
                // 如果都不是有效的JSON，才当作普通文本序列化
                result = JSON.stringify(text);
            }
        }
        
        replaceSelectedText(result);
        // 添加到JSON序列化历史记录
        jsonHistory.addRecord(result);
        showNotification('JSON序列化成功！');
    } catch (error) {
        showNotification('JSON序列化失败：' + error.message, true);
    }
});

// 压缩JSON
document.getElementById('jsonCompress').addEventListener('click', () => {
    try {
        const text = getSelectedText();
        let result;
        
        try {
            // 尝试先去除转义
            const unescapedText = tryUnescapeText(text);
            // 尝试解析JSON
            const parsed = JSON.parse(unescapedText);
            result = JSON.stringify(parsed);
        } catch {
            try {
                // 如果去除转义后解析失败，尝试直接解析原文本
                const parsed = JSON.parse(text);
                result = JSON.stringify(parsed);
            } catch {
                // 如果不是有效的JSON，提示错误
                showNotification('请输入有效的JSON文本', true);
                return;
            }
        }

        // 移除所有空格、换行和缩进
        result = result.replace(/\s+/g, '');
        
        replaceSelectedText(result);
        showNotification('JSON压缩成功！');
    } catch (error) {
        showNotification('JSON压缩失败：' + error.message, true);
    }
});

// 转义文本
document.getElementById('escapeText').addEventListener('click', () => {
    try {
        const text = getSelectedText();
        const result = text
            .replace(/\\/g, '\\\\')  // 反斜杠
            .replace(/"/g, '\\"')    // 双引号
            .replace(/'/g, "\\'")    // 单引号
            .replace(/\f/g, '\\f');  // 换页

        replaceSelectedText(result);
        showNotification('文本转义成功！');
    } catch (error) {
        showNotification('文本转义失败：' + error.message, true);
    }
});

// 去除转义
document.getElementById('unescapeText').addEventListener('click', () => {
    try {
        const text = getSelectedText();
        const result = tryUnescapeText(text);
        replaceSelectedText(result);
        showNotification('去除转义成功！');
    } catch (error) {
        showNotification('去除转义失败：' + error.message, true);
    }
});

// 清空文本
document.getElementById('clearText').addEventListener('click', () => {
    editor.value = '';
    // 添加到历史记录
    history.push(editor.value);
    showNotification('已清空文本！');
});

// 清空历史记录
document.getElementById('clearHistory').addEventListener('click', () => {
    jsonHistory.clearHistory();
    showNotification('已清空历史记录！');
});

// 复制文本
document.getElementById('copyText').addEventListener('click', () => {
    const text = getSelectedText();
    if (!text) {
        showNotification('没有可复制的内容！', true);
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        showNotification('已复制到剪贴板！');
    }).catch(error => {
        showNotification('复制失败：' + error.message, true);
    });
}); 