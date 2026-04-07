# 編輯器右鍵選單（Context Menu）設計規格

**日期**：2026-04-07  
**主題**：將繁化姬轉換指令掛入 VS Code 編輯器右鍵選單  

## 1. 背景與目標

使用者希望在**文字編輯器畫面**中透過**右鍵選單**觸發既有轉換指令，無須僅依賴指令面板或快捷鍵。  
現有十個指令已由 `extension.ts` 註冊，行為（選取範圍或空選取時整份文件）維持不變。

## 2. 使用者體驗

- **觸發位置**：一般編輯器內容區右鍵（`editor/context`）。
- **根層**（直接出現在右鍵選單主層，由上而下）：
  1. `fanhuaji.Traditional`（標題沿用現有 `%command.fanhuaji.Traditional%`）
  2. `fanhuaji.Taiwan`（標題沿用現有 `%command.fanhuaji.Taiwan%`）
- **子選單**：標籤為 **「繁化姬」**（建議以 `package.nls.json` 鍵值本地化，例如 `%submenu.fanhuaji%`，預設字串為「繁化姬」）。
- **子選單內指令**（順序與 `package.json` 之 `commands` 區塊一致，略過已在根層的兩項）：
  - `fanhuaji.Simplified`
  - `fanhuaji.China`
  - `fanhuaji.Hongkong`
  - `fanhuaji.Pinyin`
  - `fanhuaji.Bopomofo`
  - `fanhuaji.Mars`
  - `fanhuaji.WikiSimplified`
  - `fanhuaji.WikiTraditional`

## 3. 技術作法

- 於 `package.json` 的 `contributes` 新增：
  - **`submenus`**：宣告一個子選單 id（例如 `fanhuaji.submenu`）與顯示標籤。
  - **`menus`**：
    - `editor/context`：三筆項目——兩個 `command`、一個 `submenu`；以 **`group`**（例如 `9_fanhuaji@1`、`9_fanhuaji@2`、`9_fanhuaji@3`）控制相對順序並與其他擴充功能區隔。
    - 以子選單 id 為鍵的區段：列出上述八個 `command` 項目。
- 每一筆選單項目設定 **`when`: `editorTextFocus`**，僅在編輯器文字區有焦點時顯示。
- **`extension.ts` 不需修改**；選單僅引用既有 command id。

## 4. 引擎與型別版本

- **`engines.vscode`**：同意**不再綁定舊版**，實作時拉高至當時之現行穩定版下限（語意版本範圍如 `^1.x.x`），並與專案實際使用的 VS Code API 對齊。
- **`@types/vscode`**：與 `engines.vscode` 一併調整，避免型別與宣告的引擎版本落差。
- **備註**：`contributes.submenus` 自 VS Code **1.58** 起提供；實際最低版本以實作所選 `engines.vscode` 為準。

## 5. 錯誤處理與邊界行為

- 與現有指令相同：無作用中編輯器時指令不執行；網路／API 錯誤仍由現有 `showErrorMessage` 等邏輯處理。  
- 選單僅改變進入點，**不重複實作轉換或取消邏輯**。

## 6. 測試與驗收

- **手動驗收**：
  - 在任意文字檔編輯器右鍵：可見 Traditional、Taiwan 於根層；可見「繁化姬」子選單及其內八個指令。
  - 各項目執行結果與從指令面板執行相同指令一致（含選取／未選取行為）。
- **自動化**：若專案後續新增整合測試，可再補；本變更以 manifest 為主，現階段以手動驗收為主。

## 7. 非範圍

- 未要求之其他選單點（例如檔案總管、`editor/title`）不在本次範圍。
- 未要求新增設定項以開關選單顯示；若未來需要可另開議題。

## 8. 曾考慮之替代方案

- **根層平鋪十個指令**：選單過長，已由使用者否決。
- **子選單標題寫死於 `package.json`**：可行，但建議與其他字串一致採 `package.nls.json`。
- **執行期動態註冊選單**：不必要地增加複雜度，不採用。
