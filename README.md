# AiPicCloud 云图片管理系统
![主页](https://github.com/linbei0/AIPicCloud-backed/blob/master/picture/Home.png)
![空间](https://github.com/linbei0/AIPicCloud-backed/blob/master/picture/space.png)
## 项目简介

AiPicCloud 是一个现代化的云图片管理系统，提供图片上传、存储、分类、搜索和分享等功能。系统支持私有空间和团队空间，满足个人和团队的图片管理需求。通过直观的界面和强大的功能，帮助用户高效管理和利用图片资源。

## 功能特点

- **多空间管理**：支持私有空间和团队空间，满足不同场景需求
- **图片上传**：支持本地上传和URL上传图片
- **批量操作**：支持批量上传和编辑图片
- **智能分类**：通过分类和标签系统组织图片
- **多维度搜索**：支持关键词、分类、标签、颜色等多种搜索方式
- **图片分享**：便捷的图片分享功能
- **空间分析**：提供空间使用统计和分析功能
- **权限管理**：细粒度的成员权限控制
- **响应式设计**：适配各种屏幕尺寸的设备

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI组件库**：Ant Design Vue 4.x
- **构建工具**：Vite
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **HTTP客户端**：Axios
- **图表可视化**：ECharts + Vue-ECharts
- **图片处理**：Vue-Cropper
- **颜色选择器**：Vue3-Colorpicker

## 项目结构

```
├── src/                    # 源代码目录
│   ├── api/                # API接口定义
│   ├── assets/             # 静态资源
│   ├── components/         # 公共组件
│   ├── constants/          # 常量定义
│   ├── layouts/            # 布局组件
│   ├── pages/              # 页面组件
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia状态管理
│   ├── utils/              # 工具函数
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── public/                 # 公共静态资源
├── index.html              # HTML模板
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置
└── package.json            # 项目依赖和脚本
```

## 快速开始

### 环境要求

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查和格式化

```bash
npm run lint
npm run format
```

## 主要页面

- **首页**：展示和搜索图片
- **空间详情页**：管理空间内的图片和成员
- **图片详情页**：查看和编辑图片详细信息
- **图片上传页**：上传和编辑图片
- **空间分析页**：查看空间使用统计和分析
- **个人中心**：管理个人信息和设置

## 权限系统

系统实现了细粒度的权限控制，主要包括：

- **空间成员管理**：管理空间成员和权限
- **图片查看**：查看空间内的图片
- **图片上传**：向空间上传新图片
- **图片编辑**：编辑空间内的图片信息
- **图片删除**：删除空间内的图片

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

​        
