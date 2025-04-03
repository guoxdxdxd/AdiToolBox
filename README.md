# AdiToolBox | 工具箱系统

AdiToolBox是一个轻量级、无依赖的前端工具箱，提供各种常用的开发辅助工具。使用纯HTML、CSS和JavaScript实现，无需安装，即开即用。

## 功能特性

以下是当前已实现的功能：

- **JSON工具**：提供JSON序列化、格式化、压缩、转义和去除转义等功能
- **字符串差异对比**：支持实时比较两个文本之间的差异，高亮显示变更内容
- **Cron表达式生成器**：通过可视化界面生成和解析Cron表达式，预览执行时间

## 最新更新

- **目录结构优化**：重构项目目录结构，添加tools目录存放组件化功能模块
- **统一布局系统**：创建layout.html作为统一页面框架，通过iframe加载工具模块
- **Cron表达式生成器V5**：完全重构，支持7位cron表达式，全新的可视化配置界面

## 系统架构

AdiToolBox采用简洁的目录结构组织代码：

```
AdiToolBox/
├── index.html            # 项目首页，所有工具的入口
├── layout.html           # 统一页面布局，通过iframe加载功能模块
├── tools/                # 存放简化版功能模块，用于在layout中嵌入
│   ├── json-tools.html   # JSON工具模块
│   ├── string-diff.html  # 字符串差异对比工具模块
│   └── cron-generator.html # Cron表达式生成器模块
├── assets/               # 静态资源文件
│   ├── css/              # 样式文件
│   ├── js/               # JavaScript文件
│   └── lib/              # 第三方库
└── README.md             # 项目文档
```

详细的目录结构请参考 [DirectoryStructure.md](DirectoryStructure.md)。

## 如何使用

### 方法一：直接使用

1. 克隆或下载本仓库
2. 使用浏览器直接打开 `index.html`，或通过任何静态文件服务器提供访问
3. 从首页选择需要使用的工具
4. 每个工具页面上方都有导航菜单，可随时切换到其他工具

### 方法二：Docker部署

1. 确保已安装 Docker 和 Docker Compose
2. 克隆本仓库：`git clone https://github.com/yourusername/AdiToolBox.git`
3. 进入项目目录：`cd AdiToolBox`
4. 使用Docker Compose启动服务：
   ```bash
   docker-compose up -d
   ```
5. 访问 `http://localhost:8080` 即可使用

Docker相关文件说明：
- `Dockerfile`：用于构建Docker镜像，基于nginx:alpine
- `docker-compose.yml`：定义服务配置，默认映射到8080端口

如需修改访问端口，编辑 `docker-compose.yml` 文件中的端口映射配置。

## 工具详情

### JSON工具

JSON工具提供以下功能：

- **JSON序列化**：将文本转换为JSON字符串格式
- **JSON压缩**：移除JSON中的空白字符，减小体积
- **文本转义**：对文本进行转义处理，支持选中部分或全文转义
- **去除转义**：移除文本中的转义字符，支持选中部分或全文处理
- **撤销/重做**：支持操作撤销和恢复
- **历史记录**：保存最近的操作历史，可随时恢复

### 字符串差异对比

字符串差异对比工具提供：

- 左右两侧文本框，可同时编辑和查看
- 实时高亮显示两侧文本的差异部分
- 支持字符级别的精确对比
- 文本框大小可调节
- 差异统计信息展示

### Cron表达式生成器

Cron表达式生成器具备以下功能：

- 支持7位Cron表达式（秒、分、时、日、月、周、年）
- 可视化配置界面，直观设置各时间字段
- 表达式与界面配置双向绑定，实时更新
- 提供常用Cron表达式快速选择
- 计算并显示未来10次执行时间
- 支持直接编辑表达式，自动解析到界面配置

## 屏幕截图

在项目中添加屏幕截图，可以在assets目录下创建images文件夹并添加以下文件：
- `index-screenshot.png` - 首页截图
- `json-tools-screenshot.png` - JSON工具截图
- `string-diff-screenshot.png` - 字符串差异对比工具截图
- `cron-generator-screenshot.png` - Cron表达式生成器截图

## 未来计划

以下是计划中的功能和改进：

- **XML工具**：序列化/反序列化和格式化XML文档
- **JSON与XML转换**：提供JSON与XML结构互转功能
- **随机密码生成器**：生成安全的随机密码
- **深色模式支持**：添加全站黑暗主题
- **工具搜索功能**：快速查找和访问工具
- **个性化设置**：允许用户自定义界面和工具偏好

## 贡献指南

如果您想为AdiToolBox贡献代码或提出建议，欢迎：

1. Fork本仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 发起Pull Request

## 开发日记

项目的开发进度和功能实现细节记录在 [DevDiary.md](DevDiary.md) 文件中。

## 许可证

本项目采用MIT许可证 - 详情请参见 LICENSE 文件

## 作者

AdiMac 