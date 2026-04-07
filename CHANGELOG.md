# CHANGELOG.md

**注意事項**：自擴充功能 **1.0.4（含）以後**，請使用 **VS Code 1.110.0 以上**（`package.json` 的 `engines.vscode` 為 `^1.110.0`）。

# 1.0.5

- 開發工具鏈升級：`TypeScript` 6、`ESLint` 10（flat config）、`webpack` / `webpack-cli`、`axios` 1、`Prettier` 3、`@swc/core` 與相關 loader 等依賴更新至目前最新版。
- 封裝工具：`vsce` 改為官方套件 `@vscode/vsce`（`package` 指令仍使用 `vsce` CLI）。
- 建置設定：`tsconfig` 調整為符合新版 `moduleResolution`；新增 `eslint.config.mjs`，移除 `.eslintrc.yml`、`.eslintignore`。
- **行為**：若無法自工作區／使用者設定讀取 Fanhuaji 設定，`getSettings` 會改為明確拋出錯誤（取代先前對 `undefined` 的非空斷言）。

# 1.0.4

- 編輯器右鍵選單（Context Menu）：`Traditional`、`Taiwan` 顯示於根層，其餘轉換指令收合在「繁化姬」子選單。
- 最低 VS Code 版本提升至 `^1.110.0`（與 `@types/vscode` 對齊，以支援子選單等宣告方式）。

# 1.0.3

- **fix**：修正物件型別判斷邏輯。
  - 調整 `userPreReplace` 與 `userPostReplace` 的型別檢查方式。
  - 避免誤判陣列或 `null` 為物件。

# 1.0.2

- Reduce api requests

# 1.0.0

- Publish extension to Visual Studio Code Marketplace

# 0.0.6

- Reject push large text (no split text anymore!)

# 0.0.5

- Split into multiple part data if its length up to 5000000 bytes

# 0.0.4

- Fix convert params
