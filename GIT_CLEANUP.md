# NatureE 项目 Git 仓库清理指南

由于本项目初期 Git 配置较为粗放，目前存在目录嵌套、`.gitignore` 失效等问题。以下是建议的清理步骤：

## 1. 结构扁平化 (Flattening)
目前项目结构为 `NatureE-main/miniprogram-2/...`。建议将代码提升至根目录：
1. 在根目录下运行：`mv miniprogram-2/* .` (Linux/Mac) 或手动移动所有文件到根目录。
2. 删除空的 `miniprogram-2` 文件夹。

## 2. 修复 .gitignore
目前的 `.gitignore` 路径规则不正确。请将根目录的 `.gitignore` 内容替换为：

```gitignore
# 微信小程序临时文件
/unpackage/
/miniprogram_npm/
/node_modules/

# 系统文件
.DS_Store
Thumbs.db
desktop.ini

# 开发工具配置 (可选保留)
/.claude/
/.project.config.json

# 编译产物
/dist/
```

## 3. 清理 Git 缓存
如果之前已经有 `node_modules` 被误提交，需要运行：
```bash
git rm -r --cached .
git add .
git commit -m "chore: optimize project structure and fix gitignore"
```

## 4. 后续建议
* **提交规范**：避免连续多次 "Update README.md"，建议使用 `git commit --amend` 或合并相关修改后再提交。
* **分支管理**：建议在 `main` 或 `new-main` 分支上进行稳定发布，功能开发可以使用 `feat/xxx` 分支。

---
*注：本项目已接入阿里云 DashScope AI 服务，请务必妥善保管 `services/ai-service.js` 中的 API Key，避免泄露。*
