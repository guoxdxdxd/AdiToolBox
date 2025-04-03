# 项目目录结构

```
AdiToolBox/
├── README.md                 # 项目主要文档，包含项目介绍、功能列表、安装说明、使用指南等重要信息
├── DirectoryStructure.md     # 记录并维护项目的目录结构，包含每个文件的详细描述
├── DevDiary.md               # 开发日记，记录项目功能开发进度和技术实现细节
├── index.html                # 项目首页，提供所有功能工具的统一入口和导航界面
├── layout.html               # 布局页面，提供统一的页面布局和导航框架，通过iframe嵌入功能页面
├── tools/                    # 存放简化版功能模块，用于在layout.html中嵌入
│   ├── json-tools.html       # JSON工具模块，提供JSON序列化、压缩、转义等功能
│   ├── string-diff.html      # 字符串差异对比工具模块，提供文本差异对比功能
│   └── cron-generator.html   # Cron表达式生成器模块，支持7位长度cron表达式，提供可视化配置界面
├── assets/                   # 存放静态资源文件
│   ├── css/                  # 样式文件目录
│   │   ├── common.css        # 通用样式文件，定义全局样式变量和共享组件样式
│   │   ├── index.css         # 首页的样式文件，定义主页布局和工具卡片样式
│   │   ├── json-tools.css    # JSON工具页面的样式文件
│   │   ├── string-diff2.css  # 字符串差异对比工具V2的样式表，使用CSS变量实现主题定制
│   │   ├── cron-generator4.css # Cron表达式生成器第四版的样式文件，使用现代界面设计
│   │   ├── cron-generator5.css # Cron表达式生成器第五版的样式文件，采用Grid布局设计
│   │   └── nav-menu.css      # 导航菜单的样式文件，提供固定定位的下拉菜单效果
│   ├── js/                   # JavaScript文件目录
│   │   ├── index.js          # 首页的JavaScript实现，提供工具导航和交互功能
│   │   ├── json-tools.js     # JSON工具页面的功能实现脚本
│   │   ├── string-diff2.js   # 字符串差异对比工具V2的核心JavaScript实现
│   │   ├── cron-generator4.js # Cron表达式生成器第四版的JavaScript实现
│   │   ├── cron-generator5.js # Cron表达式生成器第五版的JavaScript实现
│   │   └── nav-menu.js       # 导航菜单的JavaScript实现
│   └── lib/                  # 第三方库目录
└── .cursor/                  # Cursor IDE配置目录
```

## 文件说明

### README.md
项目的主要文档，详细介绍了AdiToolBox工具箱系统的功能特性、安装方法、使用说明和贡献指南，帮助用户快速了解和使用本工具箱系统。

### DirectoryStructure.md
用于记录和维护项目的目录结构，确保文件结构的清晰性和可维护性，包含每个文件的详细描述和用途说明。

### DevDiary.md
项目开发日记，详细记录每个功能的开发过程、技术实现细节、遇到的问题和解决方案，帮助团队成员了解项目进展和技术决策。

### index.html
项目首页，提供所有功能工具的统一入口和导航界面，采用响应式设计的卡片布局，便于用户快速访问各个工具。同时也为未来新增功能预留了位置，便于系统扩展。

### layout.html
布局页面，提供统一的页面框架和导航结构，通过iframe加载tools目录下的功能模块，实现统一的用户界面和导航体验，减少重复代码。

### tools/json-tools.html
JSON工具模块，提供JSON序列化、压缩、转义和去除转义等功能，设计为在layout.html框架中嵌入使用，不包含重复的标题栏和导航菜单。

### tools/string-diff.html
字符串差异对比工具模块，提供文本差异对比功能，设计为在layout.html框架中嵌入使用，不包含重复的标题栏和导航菜单。

### tools/cron-generator.html
Cron表达式生成器模块，支持7位长度cron表达式，提供可视化配置界面，设计为在layout.html框架中嵌入使用，不包含重复的标题栏和导航菜单。

### assets/css/common.css
通用样式文件，定义全局样式变量和共享组件样式，确保整个应用的样式一致性和可维护性。包含颜色变量、字体设置、按钮样式等基础样式定义。

### assets/css/index.css
首页的样式文件，定义了主页布局、工具卡片样式、响应式设计等，提供统一的用户界面风格，确保与其他工具页面的UI协调一致。

### assets/css/json-tools.css
JSON工具页面的样式表文件，定义了页面布局、按钮样式、输入框样式等视觉效果。

### assets/css/string-diff2.css
字符串差异对比工具V2的样式表，使用CSS变量实现主题定制，提供更现代的UI设计。

### assets/css/cron-generator4.css
Cron表达式生成器第四版的样式表文件，使用更现代的界面设计。

### assets/css/cron-generator5.css
Cron表达式生成器第五版的样式表文件，采用Grid布局设计，支持更好的响应式体验。

### assets/css/nav-menu.css
导航菜单的样式文件，实现了固定定位的弹出式菜单，允许用户在不同功能页面间快速切换，提高用户体验和工作效率。

### assets/js/index.js
首页的JavaScript实现，提供工具导航和交互功能，记录用户最近使用的工具，提升用户体验。

### assets/js/json-tools.js
JSON工具页面的JavaScript实现文件，包含JSON处理、文本选择、转义处理等核心功能的实现代码。

### assets/js/string-diff2.js
字符串差异对比工具V2的核心JavaScript实现，采用模块化设计，提供更好的代码组织和维护性。

### assets/js/cron-generator4.js
Cron表达式生成器第四版的JavaScript实现，包含Cron表达式解析与生成、界面与表达式双向绑定、触发时间计算和预览等功能的实现代码。

### assets/js/cron-generator5.js
Cron表达式生成器第五版的JavaScript实现，支持7位cron表达式的解析、生成和执行时间计算，提供更强大的执行时间预览功能。

### assets/js/nav-menu.js
导航菜单的JavaScript实现，提供菜单打开关闭交互、当前页面高亮显示以及记录用户最近使用工具的功能，增强用户体验。

### assets/lib/diff_match_patch.js
Google开发的差异对比库，提供高效的文本差异对比算法，用于增强字符串对比工具的功能和性能。

### .cursor/
Cursor IDE的配置目录，存储IDE相关的配置信息和缓存文件。
