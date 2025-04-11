// 设置可用高度
function setAvailableHeight(height) {
    document.querySelector('.prompt-optimizer-container').style.height = `${height}px`;
}

// 保存原始markdown文本
let originalMarkdownText = '';
let currentController = null; // 当前的AbortController
let currentReader = null; // 当前的reader

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    const originalPrompt = document.getElementById('original-prompt');
    const optimizeBtn = document.getElementById('optimize-btn');
    const optimizedPrompt = document.getElementById('optimized-prompt');
    const copyBtn = document.getElementById('copy-btn');
    const abortBtn = document.getElementById('abort-btn');

    // 中止按钮点击事件
    abortBtn.addEventListener('click', async function() {
        if (currentController) {
            currentController.abort();
            if (currentReader) {
                try {
                    await currentReader.cancel(); // 取消reader
                } catch (e) {
                    console.error('Error canceling reader:', e);
                }
            }
            abortBtn.disabled = true;
            optimizeBtn.disabled = false;
            optimizedPrompt.innerHTML += '\n\n优化已中止';
            currentReader = null;
        }
    });

    // 复制按钮点击事件
    copyBtn.addEventListener('click', async function() {
        if (!originalMarkdownText) {
            alert('没有可复制的内容');
            return;
        }

        try {
            await navigator.clipboard.writeText(originalMarkdownText);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '复制成功';
            copyBtn.disabled = true;
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.disabled = false;
            }, 2000);
        } catch (err) {
            alert('复制失败: ' + err);
        }
    });

    // 优化按钮点击事件
    optimizeBtn.addEventListener('click', async function() {
        const prompt = originalPrompt.value.trim();
        if (!prompt) {
            alert('请输入需要优化的提示词');
            return;
        }

        // 禁用按钮
        optimizeBtn.disabled = true;
        optimizedPrompt.textContent = '正在优化中...';
        originalMarkdownText = ''; // 清空之前的内容
        
        // 创建新的AbortController
        currentController = new AbortController();
        abortBtn.disabled = false; // 启用中止按钮

        try {
            const response = await fetch('http://120.76.200.148:5234/api/prompt/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    originalPrompt: prompt
                }),
                signal: currentController.signal // 添加中止信号
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 处理流式响应
            currentReader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';
            optimizedPrompt.innerHTML = '';

            try {
                while (true) {
                    const { done, value } = await currentReader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedText += chunk;
                    originalMarkdownText = accumulatedText;
                    optimizedPrompt.innerHTML = marked.parse(accumulatedText);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw error; // 重新抛出中止错误
                }
                console.error('Error reading stream:', error);
                throw error;
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.name === 'AbortError') {
                optimizedPrompt.innerHTML += '\n\n优化已中止';
            } else {
                optimizedPrompt.textContent = `优化失败: ${error.message}`;
            }
            originalMarkdownText = ''; // 出错时清空内容
        } finally {
            optimizeBtn.disabled = false;
            abortBtn.disabled = true; // 禁用中止按钮
            currentController = null; // 清除当前的AbortController
            currentReader = null; // 清除当前的reader
        }
    });
}); 