console.log('Script loading...');

// 等待 DOM 完全加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    console.log('Initializing app...');
    
    // 检查必要的DOM元素
    const cronExpression = document.querySelector('#cron-expression');
    const errorElement = document.querySelector('.error-message');
    const executionTimesList = document.querySelector('.next-execution-times');
    
    console.log('Essential elements:', {
        cronExpression: !!cronExpression,
        errorElement: !!errorElement,
        executionTimesList: !!executionTimesList,
        allInputs: document.querySelectorAll('input'),
        cronInputs: document.querySelectorAll('#cron-expression'),
        expressionInputs: document.querySelectorAll('.expression-input')
    });

    // 初始化
    init();

    // 绑定事件
    function init() {
        console.log('Initializing...');
        
        try {
            // 检查必要元素是否存在
            if (!cronExpression) {
                console.error('Cron expression input element not found. Available elements:', {
                    allInputs: document.querySelectorAll('input'),
                    cronInputs: document.querySelectorAll('#cron-expression'),
                    expressionInputs: document.querySelectorAll('.expression-input'),
                    bodyContent: document.body.innerHTML
                });
                throw new Error('Cron expression input element not found');
            }
            
            // 设置默认表达式
            cronExpression.value = '* * * * * ? *';
            console.log('Default expression set');
            
            // 绑定cron表达式输入事件
            cronExpression.addEventListener('input', handleExpressionChange);
            console.log('Expression input event bound');

            // 绑定各个选项的单选按钮点击事件
            bindRadioEvents();
            console.log('Radio events bound');
            
            // 绑定配置变化事件
            bindConfigChangeEvents();
            console.log('Config change events bound');
            
            // 绑定常用表达式按钮点击事件
            bindCommonExpressionEvents();
            console.log('Common expression events bound');
            
            // 初始化选择器
            initSelectors();
            console.log('Selectors initialized');
            
            // 初始化展示下一次执行时间
            updateExecutionTimes();
            console.log('Execution times updated');

            // 初始化各时间单位的显示状态
            const timeUnits = ['second', 'minute', 'hour', 'day', 'month', 'week'];
            timeUnits.forEach(unit => {
                // 确保每个时间单位都有一个默认选中的选项
                const defaultRadio = document.querySelector(`input[name="${unit}-type"]:checked`);
                if (defaultRadio) {
                    console.log(`Default radio checked for ${unit}`);
                } else {
                    console.warn(`Default radio not found for ${unit}`);
                }
                updateValueSelectorVisibility(unit);
            });
            
            console.log('Initialization completed successfully');
        } catch (error) {
            console.error('Initialization failed:', error);
            // 显示错误信息给用户
            if (errorElement) {
                errorElement.textContent = `初始化失败: ${error.message}`;
            }
        }
    }

    // 绑定单选按钮事件和初始化显示状态
    function bindRadioEvents() {
        const timeUnits = ['second', 'minute', 'hour', 'day', 'month', 'week'];
        
        timeUnits.forEach(unit => {
            const radioButtons = document.querySelectorAll(`input[name="${unit}-type"]`);
            if (radioButtons.length > 0) {
                radioButtons.forEach(radio => {
                    radio.addEventListener('change', () => {
                        updateValueSelectorVisibility(unit);
                    });
                });
            }
        });
    }
    
    // 更新值选择器的可见性
    function updateValueSelectorVisibility(unit) {
        console.log(`Updating visibility for ${unit}`);
        
        // 使用ID选择器
        const specificSelector = document.getElementById(`${unit}-specific-selector`);
        const rangeSelector = document.getElementById(`${unit}-range-selector`);
        const cycleSelector = document.getElementById(`${unit}-cycle-selector`);
        
        console.log('Found selectors:', {
            specificSelector: !!specificSelector,
            rangeSelector: !!rangeSelector,
            cycleSelector: !!cycleSelector
        });
        
        // 移除所有选择器的 active 类
        if (specificSelector) {
            specificSelector.classList.remove('active');
            console.log(`Removed active class from specific selector for ${unit}`);
        }
        if (rangeSelector) {
            rangeSelector.classList.remove('active');
            console.log(`Removed active class from range selector for ${unit}`);
        }
        if (cycleSelector) {
            cycleSelector.classList.remove('active');
            console.log(`Removed active class from cycle selector for ${unit}`);
        }
        
        // 根据选中的单选按钮显示对应的选择器
        const selectedRadio = document.querySelector(`input[name="${unit}-type"]:checked`);
        if (!selectedRadio) {
            console.warn(`No radio button selected for ${unit}`);
            return;
        }
        
        const selectedType = selectedRadio.value;
        console.log(`Selected type for ${unit}: ${selectedType}`);
        
        switch (selectedType) {
            case 'specific':
                if (specificSelector) {
                    specificSelector.classList.add('active');
                    console.log(`Added active class to specific selector for ${unit}`);
                }
                break;
            case 'range':
                if (rangeSelector) {
                    rangeSelector.classList.add('active');
                    console.log(`Added active class to range selector for ${unit}`);
                }
                break;
            case 'cycle':
                if (cycleSelector) {
                    cycleSelector.classList.add('active');
                    console.log(`Added active class to cycle selector for ${unit}`);
                }
                break;
        }
    }
    
    // 绑定配置变化事件
    function bindConfigChangeEvents() {
        const inputs = document.querySelectorAll('.value-selector input, .value-selector select');
        inputs.forEach(input => {
            input.addEventListener('change', updateCronExpression);
        });
    }
    
    // 绑定常用表达式按钮事件
    function bindCommonExpressionEvents() {
        const expressionButtons = document.querySelectorAll('.expression-button');
        expressionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const expression = this.getAttribute('data-expression');
                cronExpression.value = expression;
                
                // 更新配置界面
                parseExpressionToUI(expression);
                
                // 更新执行时间
                updateExecutionTimes();
            });
        });
    }
    
    // 初始化选择器
    function initSelectors() {
        console.log('初始化选择器...');
        
        // 获取所有时间单位面板
        const timeUnits = ['second', 'minute', 'hour', 'day', 'month', 'week'];
        
        timeUnits.forEach(unit => {
            // 获取特定值选择器
            const specificSelector = document.getElementById(`${unit}-specific-selector`);
            if (!specificSelector) {
                console.warn(`未找到 ${unit} 特定值选择器`);
                return;
            }
            
            // 获取对应的 select 元素
            const select = specificSelector.querySelector('.value-select');
            if (!select) {
                console.warn(`未找到 ${unit} select 元素`);
                return;
            }
            
            // 监听选择变化
            select.addEventListener('change', () => {
                updateDisplayValue(unit);
            });
        });
        
        // 初始化弹出式选择器
        initializePopupSelectors();
    }
    
    // 初始化弹出式选择器
    function initializePopupSelectors() {
        console.log('Initializing popup selectors...');
        
        // 获取所有弹出选择器触发元素
        const popupTriggers = document.querySelectorAll('.selected-values-display');
        
        // 为每个触发元素添加点击事件
        popupTriggers.forEach(trigger => {
            trigger.addEventListener('click', function() {
                // 获取对应的弹出选择器ID
                const popupId = this.id.replace('-display', '-popup');
                const popup = document.getElementById(popupId);
                
                if (popup) {
                    // 显示弹出选择器
                    popup.style.display = 'block';
                    
                    // 添加遮罩层
                    addOverlay();
                }
            });
        });
        
        // 设置各时间单位的选择器
        const timeUnits = ['second', 'minute', 'hour', 'day', 'month', 'week'];
        timeUnits.forEach(unit => {
            console.log(`Setting up ${unit} selector...`);
            setupUnitSelector(unit);
        });
        
        // 绑定选项点击事件
        const options = document.querySelectorAll('.popup-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                // 获取值和所属的弹出选择器
                const value = this.getAttribute('data-value');
                const popupElement = this.closest('.popup-select');
                const displayElement = document.getElementById(popupElement.id.replace('-popup', '-display'));
                
                if (displayElement) {
                    // 设置显示值
                    displayElement.value = this.textContent.trim();
                    displayElement.setAttribute('data-value', value);
                    
                    // 触发变更事件
                    const changeEvent = new Event('change', { bubbles: true });
                    displayElement.dispatchEvent(changeEvent);
                    
                    // 隐藏弹出选择器
                    popupElement.style.display = 'none';
                    
                    // 移除遮罩层
                    removeOverlay();
                }
            });
        });
        
        console.log('Popup selectors initialization completed');
        
        // 关闭所有弹出选择器
        closeAllPopups();
    }
    
    // 设置时间单位选择器
    function setupUnitSelector(unit) {
        // 获取该单位的特定值选择器
        const specificSelector = document.getElementById(`${unit}-specific-selector`);
        
        if (!specificSelector) {
            console.warn(`Missing elements for ${unit} selector`);
            return;
        }
        
        // 确保选择器中有选项
        const options = specificSelector.querySelectorAll('.popup-option, option');
        if (options.length === 0) {
            console.warn(`No options found for ${unit} selector`);
        }
    }
    
    // 添加遮罩层
    function addOverlay() {
        // 检查是否已存在遮罩层
        let overlay = document.querySelector('.popup-overlay');
        
        if (!overlay) {
            // 创建遮罩层
            overlay = document.createElement('div');
            overlay.className = 'popup-overlay active';
            document.body.appendChild(overlay);
            
            // 点击遮罩层关闭所有弹出选择器
            overlay.addEventListener('click', closeAllPopups);
        } else {
            overlay.classList.add('active');
        }
    }
    
    // 移除遮罩层
    function removeOverlay() {
        const overlay = document.querySelector('.popup-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            console.log('Removed active class from overlay');
        }
    }
    
    // 关闭所有弹出选择器
    function closeAllPopups() {
        console.log('Closing all popups');
        
        // 隐藏所有弹出选择器
        const popups = document.querySelectorAll('.popup-select');
        popups.forEach(popup => {
            popup.style.display = 'none';
        });
        
        // 移除遮罩层
        removeOverlay();
    }
    
    // 更新显示值
    function updateDisplayValue(unit) {
        console.log(`更新 ${unit} 显示值...`);
        
        // 获取特定值选择器
        const specificSelector = document.getElementById(`${unit}-specific-selector`);
        if (!specificSelector) {
            console.warn(`未找到 ${unit} 特定值选择器`);
            return;
        }
        
        // 获取对应的 select 元素
        const select = specificSelector.querySelector('.value-select');
        if (!select) {
            console.warn(`未找到 ${unit} select 元素`);
            return;
        }
        
        // 获取选中的值
        const selectedValues = Array.from(select.selectedOptions).map(option => option.value);
        
        // 更新显示
        const display = document.querySelector(`.${unit}-display`);
        if (display) {
            display.value = selectedValues.join(',');
        }
        
        // 更新 cron 表达式
        updateCronExpression();
    }
    
    // 获取部分值
    function getPartValue(part) {
        console.log(`获取 ${part} 部分值...`);
        
        // 获取特定值选择器
        const specificSelector = document.getElementById(`${part}-specific-selector`);
        if (!specificSelector) {
            console.warn(`未找到 ${part} 特定值选择器`);
            return '*';
        }
        
        // 获取对应的 select 元素
        const select = specificSelector.querySelector('.value-select');
        if (!select) {
            console.warn(`未找到 ${part} select 元素`);
            return '*';
        }
        
        // 获取选中的值
        const selectedValues = Array.from(select.selectedOptions).map(option => option.value);
        
        // 如果没有选中值，返回 '*'
        if (selectedValues.length === 0) {
            return '*';
        }
        
        // 返回选中的值，用逗号分隔
        return selectedValues.join(',');
    }
    
    // 更新 cron 表达式
    function updateCronExpression() {
        console.log('更新 cron 表达式...');
        
        // 获取各个部分的值
        const second = getPartValue('second');
        const minute = getPartValue('minute');
        const hour = getPartValue('hour');
        const day = getPartValue('day');
        const month = getPartValue('month');
        const week = getPartValue('week');
        
        // 组合 cron 表达式
        const cronExpression = `${second} ${minute} ${hour} ${day} ${month} ${week}`;
        
        // 更新显示
        const cronDisplay = document.querySelector('.cron-expression');
        if (cronDisplay) {
            cronDisplay.value = cronExpression;
        }
        
        // 更新执行时间
        updateExecutionTimes();
    }
    
    // 处理表达式变化
    function handleExpressionChange() {
        // 验证表达式
        const expression = cronExpression.value;
        const isValid = validateCronExpression(expression);
        
        // 更新错误信息
        if (errorElement) {
            errorElement.textContent = isValid ? '' : '无效的 Cron 表达式';
        }
        
        // 如果表达式有效，更新执行时间
        if (isValid) {
            updateExecutionTimes();
        }
    }
    
    // 验证 Cron 表达式
    function validateCronExpression(expression) {
        // 简单的格式验证
        const parts = expression.split(' ');
        return parts.length === 6;
    }
    
    // 更新执行时间
    function updateExecutionTimes() {
        // 这里可以添加执行时间预览的逻辑
    }

    // 解析 cron 表达式到 UI
    function parseExpressionToUI(expression) {
        console.log('解析 cron 表达式:', expression);
        
        try {
            // 分割表达式
            const parts = expression.split(' ');
            if (parts.length < 6) {
                throw new Error('无效的 cron 表达式格式：缺少必要的部分');
            }
            
            // 解析各个部分（忽略年份部分）
            const [second, minute, hour, day, month, week] = parts;
            
            // 更新各个时间单位的选择
            updateTimeUnitSelection('second', second);
            updateTimeUnitSelection('minute', minute);
            updateTimeUnitSelection('hour', hour);
            updateTimeUnitSelection('day', day);
            updateTimeUnitSelection('month', month);
            updateTimeUnitSelection('week', week);
            
            console.log('Cron 表达式解析完成');
        } catch (error) {
            console.error('解析 cron 表达式失败:', error);
            if (errorElement) {
                errorElement.textContent = `解析失败: ${error.message}`;
            }
        }
    }
    
    // 更新时间单位选择
    function updateTimeUnitSelection(unit, value) {
        console.log(`更新 ${unit} 选择:`, value);
        
        // 如果是 * 或 ?，选择 every
        if (value === '*' || value === '?') {
            const everyRadio = document.querySelector(`input[name="${unit}-type"][value="every"]`);
            if (everyRadio) {
                everyRadio.checked = true;
                updateValueSelectorVisibility(unit);
            }
            return;
        }
        
        // 如果是数字或逗号分隔的数字，选择 specific
        if (/^\d+(,\d+)*$/.test(value)) {
            const specificRadio = document.querySelector(`input[name="${unit}-type"][value="specific"]`);
            if (specificRadio) {
                specificRadio.checked = true;
                updateValueSelectorVisibility(unit);
                
                // 更新 select 选择
                const select = document.getElementById(`${unit}-specific-selector`).querySelector('.value-select');
                if (select) {
                    const values = value.split(',');
                    Array.from(select.options).forEach(option => {
                        option.selected = values.includes(option.value);
                    });
                }
            }
            return;
        }
        
        // 如果是范围（例如：1-5），选择 range
        if (/^\d+-\d+$/.test(value)) {
            const rangeRadio = document.querySelector(`input[name="${unit}-type"][value="range"]`);
            if (rangeRadio) {
                rangeRadio.checked = true;
                updateValueSelectorVisibility(unit);
                
                // 更新范围输入
                const [from, to] = value.split('-');
                const fromInput = document.querySelector(`.${unit}-range-selector input[name="${unit}-range-from"]`);
                const toInput = document.querySelector(`.${unit}-range-selector input[name="${unit}-range-to"]`);
                
                if (fromInput) fromInput.value = from;
                if (toInput) toInput.value = to;
            }
            return;
        }
        
        // 如果是周期（例如：*/5），选择 cycle
        if (/^\*\/\d+$/.test(value)) {
            const cycleRadio = document.querySelector(`input[name="${unit}-type"][value="cycle"]`);
            if (cycleRadio) {
                cycleRadio.checked = true;
                updateValueSelectorVisibility(unit);
                
                // 更新周期输入
                const interval = value.split('/')[1];
                const fromInput = document.querySelector(`.${unit}-cycle-selector input[name="${unit}-cycle-from"]`);
                const intervalInput = document.querySelector(`.${unit}-cycle-selector input[name="${unit}-cycle-interval"]`);
                
                if (fromInput) fromInput.value = '0';
                if (intervalInput) intervalInput.value = interval;
            }
            return;
        }
        
        console.warn(`无法解析 ${unit} 的值:`, value);
    }
}
