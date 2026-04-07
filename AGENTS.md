# AGENTS.md — AI 代理開發指引

本文件說明 **vscode-fanhuaji（Fanhuaji 繁化姬）** 擴充功能的架構、慣例與修改時應注意事項，供後續以 AI 或人工新增／修改功能時參考。

---

## 1. 專案定位與責任邊界

- **本專案**：VS Code／VS Code for the Web 用的擴充功能殼層，透過 **HTTP API** 呼叫繁化姬服務完成轉換。
- **不在此 repo**：實際繁簡轉換演算法、詞庫、伺服器實作；轉換品質問題應導向 [繁化姬文件](https://docs.zhconvert.org) 與官方回報管道（見 `README.md`）。
- **使用者預期**：選取文字或整份文件一鍵轉換；可設定 API 位址、金鑰與 `/convert` 的進階參數。

---

## 2. 技術堆疊

| 項目 | 說明 |
|------|------|
| 語言 | TypeScript（`strict: true`，`noImplicitAny: false`） |
| 執行目標 | **Node 擴充主機**（`dist/extension.js`）與 **Web Worker**（`dist/web/extension.js`）雙產物 |
| 打包 | Webpack 5 + **`swc-loader`**（編譯 `src/` 與擴充本體）；型別檢查用 `fork-ts-checker-webpack-plugin`；Lint 用 `eslint-webpack-plugin` |
| Webpack 設定載入 | **`ts-node/register/transpile-only`**（見下方 §4）；**不再**使用 `@swc-node/register` |
| HTTP | `axios`（可取消請求） |
| 訊息／字串 | `@formatjs/intl`，預設訊息來自 `package.nls.json` |

---

## 3. 目錄與重要檔案

```
src/
  extension.ts      # 啟用、指令註冊、設定讀取、API 呼叫、編輯器替換邏輯（主要邏輯集中於此）
  settings.ts       # `Settings`、`OptionalConvertParams` 型別與常數 `NAME`
  locale.ts         # `intl` 初始化（依執行環境載入 NLS）
  typings/global.d.ts  # 全域：`__COMMIT_HASH__`、`__VSCODE_WEB__` 等
package.json        # `contributes.commands`、`contributes.configuration`、`activationEvents`、腳本
package.nls.json    # 指令標題、設定說明、`ext.*` 等可翻譯字串鍵（預設訊息表）
webpack.config.js   # Node 端 webpack 進入點：先 `ts-node/register/transpile-only`，再 `require("./webpack.config.ts")`
webpack.node.js     # 同上，載入 `webpack.node.ts`（`watch-node`／偵錯用）
webpack.web.js      # 同上，載入 `webpack.web.ts`（`watch-web`／偵錯用）
webpack.node.ts     # Node 目標組態（輸出 `dist/extension.js`）
webpack.web.ts      # Web Worker 目標組態（輸出 `dist/web/extension.js`）
webpack.config.ts   # 預設匯出 `[web, node]`，一次建兩種產物
```

目前 **沒有** `*.test.ts`／`*.spec.ts`；`jest.config.ts` 存在但 `package.json` 未掛測試腳本，新增測試時需一併補上腳本與依賴慣例。

---

## 4. 常用指令（pnpm）

| 指令 | 用途 |
|------|------|
| `pnpm run build` | 正式組態建置（`NODE_ENV=production`，產出 `dist/`） |
| `pnpm run watch-node` | 開發時監聽 Node 擴充（搭配「Run Extension in VS Code」） |
| `pnpm run watch-web` | 開發時監聽 Web 擴充（搭配「Run Web Extension in VS Code」） |
| `pnpm run format` / `pnpm run check-format` | Prettier |
| `pnpm run package` | `vsce package` 打出 `.vsix` |

發佈前會跑 `vscode:prepublish` → `npm run build`。

### Webpack 為何用 `ts-node` 載入 `.ts` 設定

過去曾以 **`@swc-node/register`** 在執行 webpack 前編譯 `webpack.*.ts`。在 pnpm 解析下，`@swc-node/register` 會搭配較新的 **`@swc-node/core`**，其送出的 SWC 選項含 **`decoratorVersion`** 等欄位，與本專案鎖定的 **`@swc/core@1.3.2`**（給 `swc-loader` 用）不相容，導致 **`pnpm run build` 在載入設定檔階段即失敗**。

**現行作法**：`webpack.config.js`、`webpack.node.js`、`webpack.web.js` 僅 **`require("ts-node/register/transpile-only")`** 後再 `require` 對應的 TypeScript 設定檔。這只影響 **webpack 設定檔**的載入；**擴充程式碼**仍由 webpack 管線內的 **`swc-loader` + `@swc/core`** 編譯。

**維護注意**：請勿在未一併升級 `@swc/core`／釐清相容性的情況下改回 `@swc-node/register`；`package.json` 的 **`ts-node`** 為建置所需 **devDependency**，不應移除。

---

## 5. Desktop 與 Web 擴充

- `package.json` 同時指定 `main`（Node）與 `browser`（Web）。
- **偵錯**：`.vscode/launch.json` 已分別綁定 `watch-node`／`watch-web` 與對應 `outFiles`。
- **Web 組態**在 `webpack.web.ts` 使用 `ProvidePlugin(process)`、`resolve.fallback.util` 等，以相容瀏覽器／Worker 環境。
- **`locale.ts`**：`__VSCODE_WEB__` 為 true 時固定視為 `locale: "en"`；否則讀 `process.env.VSCODE_NLS_CONFIG`。動態載入失敗時退回 `package.nls.json`。若日後要區分更多語系，可新增 `package.nls.<locale>.json` 並確保載入路徑與打包行為一致。

---

## 6. 啟用與指令流程（`extension.ts`）

1. **`activate`**：`onStartupFinished` 後執行；建立 Output channel，寫入 `__COMMIT_HASH__`。
2. **註冊指令**：`fanhuaji.<Converter>`，`<Converter>` 須與內部型別 `Converter` 聯集一致。
3. **執行指令**（`command(converter)`）：
   - 無作用中編輯器則直接 return。
   - 以 `axios.CancelToken` 支援取消；`withProgress` 顯示通知列進度（文案鍵 `ext.running`）。
4. **選取範圍**：
   - 多個 selection：各塊文字分別處理；若單一 selection 為空則改為整份文件。
   - **長度**：以 `TextEncoder` 計算 UTF-8 位元組，單塊不得超過 `MAX_TEXT_LENGTH_IN_BYTES`（5_000_000）。
   - **多選合併請求**：以分隔字串 ` 𫠬𫠣 ` 串接，API 回傳後再拆回各 selection 替換（分隔符不得出現於使用者內容，為設計假設）。
5. **設定**：`getSettings(editor)` 依「含該文件的工作區資料夾」選最長路徑匹配的 workspace folder，再 `getConfiguration("", ws[0]).get("fanhuaji")`；並將 `modules`／`userPreReplace`／`userPostReplace`／`userProtectReplace` 從設定檔型態轉成 API 期望格式。

---

## 7. API 與設定（`package.json` → `fanhuaji.*`）

- **預設伺服器**：`https://api.zhconvert.org`（設定鍵 `fanhuaji.server`）。
- **請求**：`POST {server}/convert`，body 含 `converter`、`text`、`apiKey`、`outputFormat: "json"`、`prettify: false`，以及展開的 `convertParams`（型別見 `settings.ts`）。
- **回應**：型別 `ResponseData` 定義於 `extension.ts`；成功時使用 `data.data.text`。
- **官方參數說明**：設定描述中已連結 [convert API 文件](https://docs.zhconvert.org/api/convert/)，新增／修改 `convertParams` 欄位時應與文件與 `settings.ts` 同步。

---

## 8. 新增一種「轉換模式」的檢查清單

1. 在 `extension.ts` 的 `Converter` 聯集新增字串（與 API 的 `converter` 名稱一致）。
2. `activate` 內 `registerCommand("fanhuaji.<Name>", command("<Name>"))`。
3. `package.json` → `contributes.commands` 新增一筆，`command` 與上列相同，`title` 使用 `%command.fanhuaji.<Name>%`。
4. `package.nls.json` 新增對應 `command.fanhuaji.<Name>` 字串（及其他語系檔若存在）。
5. 執行 `pnpm run build`，確認無 ESLint／型別錯誤。
6. 若該模式需新參數：在 `package.json` 的 `fanhuaji.convertParams` schema、`package.nls.json` 說明、以及 `settings.ts` 的 `OptionalConvertParams` 同步新增。

---

## 9. 國際化（NLS）

- **鍵名慣例**：`command.fanhuaji.*`、`config.*`、`ext.*`。
- **程式內使用**：`intl.formatMessage({ id: "..." })`（見 `extension.ts` 進度標題）。
- VS Code 靜態 contributed 字串使用 `%key%` 在 `package.json` 中引用。

---

## 10. 程式風格與品質門檻

- **Lint**：`.eslintrc.yml`，TypeScript ESLint recommended + 專案自訂規則（例如 `member-delimiter-style`、arrow callback 偏好）。
- **格式**：Prettier，`pnpm run format`。
- **型別**：維持與現有檔案一致；避免在無測試情況下大幅重構 `extension.ts`。
- **註解與 UX 字串**：若專案／使用者規範要求繁體中文，請遵循該規範（本 repo 面向繁中使用者，`package.nls.json` 已大量繁中說明）。

---

## 11. 給 AI／維護者的已知陷阱（程式碼審閱備忘）

以下項目有利於避免「以為改了設定就生效」或重複踩雷：

1. **`convert` 內巢狀函式 `request(options, settings?)`**：目前呼叫時未傳入 workspace 的 `Settings`，內層 `settings?.server` 多為 `undefined`，實際請求可能**固定**落在預設 `https://api.zhconvert.org`。若使用者回報「已改 `fanhuaji.server` 仍連到預設網址」，應優先查此處是否應改為使用 `getSettings` 的結果（或將 `server` 併入 closure）。
2. **`getSettings` 內型別判斷**：`userPreReplace`／`userPostReplace` 處存在與 `typeof x === "object"` 混淆的寫法（字串 `"object"` 比較），若物件格式轉換不如預期應檢查該段。
3. **`webpack.node.ts` 的 `DefinePlugin`**：與 `webpack.web.ts` 相同專案內對 `__VSCODE_WEB__` 的定義需與 `locale.ts` 分支語意一致；若調整 i18n 或桌面／網頁行為差異，應連動檢查兩份 webpack 組態。
4. **`console.log`**：`extension.ts` 多選路徑留有 `console.log(texts)`，正式品質或隱私考量下可改為 `OutputChannel` 或移除。

---

## 12. 建議的變更流程（與本 repo 對齊）

1. 讀懂 `extension.ts` 中與你的需求最接近的一條路徑（整文件 vs 多選、錯誤處理）。
2. 小步修改；每次 `pnpm run build` 確認通過。
3. 涉及使用者可見字串或設定：同步 `package.nls.json`（及 `package.json` schema）。
4. 若引入可測試的純函式（例如設定正規化），可優先抽離至新檔案並補 Jest，符合專案漸進式重構習慣。

---

## 13. 參考連結

- [繁化姬](https://zhconvert.org)
- [繁化姬文件](https://docs.zhconvert.org)
- [Convert API](https://docs.zhconvert.org/api/convert/)

此文件應隨架構變更更新；若修正第 11 節所述行為，請同步刪改該節描述以免誤導後續代理。
