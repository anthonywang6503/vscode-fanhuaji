# VS Code - Fanhuaji

## 安裝

```sh
code --install-extension vscode-fanhuaji-x.x.x.vsix
```

或

快捷鍵 `F1` -> `Extension: Install from VSIX...`

## 建置 VSIX

本專案使用 [pnpm](https://pnpm.io/) 管理相依套件；若你使用 npm，可將下列指令中的 `pnpm` 改為對應的 `npm run`。

1. **安裝相依**：在專案根目錄執行 `pnpm install`。
2. **打包擴充功能**：執行 `pnpm run package`。  
   此指令會呼叫 `vsce package --no-dependencies`，並透過 `vscode:prepublish` 觸發 `npm run build` 完成 webpack 建置。
3. **取得檔案**：完成後在專案根目錄會產生 `vscode-fanhuaji-<版本號>.vsix`（版本號與 `package.json` 的 `version` 一致，例如 `1.0.4`）。

若僅想先編譯而不打包，可執行 `pnpm run build`，產出位於 `dist/`。

## 使用方式

- **指令面板**：`Ctrl+Shift+P`（macOS 為 `Cmd+Shift+P`）→ 輸入 **Fanhuaji** 或轉換模式名稱。
- **編輯器右鍵選單**：在文字編輯器內容區右鍵 → 可見 **Traditional**、**Taiwan**；其餘模式在 **繁化姬** 子選單內。  
  本擴充功能需要 **VS Code（或相容編輯器）≥ 1.110.0**（見 `package.json` 的 `engines.vscode`）。

## 簡介

繁化姬是一個繁簡轉換與本地化的工具，除了轉換模式外， 尚擁有轉換模組用於應付特定情況下的轉換。 並且在轉換完成後，提供與轉換前的差異比較，以讓使用者知曉哪些地方被轉換了。

繁化姬的轉換目標為「最大化一般情況下的正確率」。 這意味著，對於不確定是否該進行轉換的字詞， 繁化姬很可能會選擇轉換它們，而非保持原文。 這與 OpenCC 的「嚴格區分一簡對多繁和一簡對多異、能分則不合」不同， 你或許得親自試試究竟哪種原則更符合你的需求。

## 轉換模式

- 简体化：将文字转换为简体。
- 繁體化：將文字轉換為繁體。
- 中国化：将文字转换为简体，并使用中国地区的词语修正。
- 香港化：將文字轉換為繁體，並使用香港地區的詞語修正。
- 台灣化：將文字轉換為繁體，並使用台灣地區的詞語修正。
- 拼音化：將文字轉為拼音。
- 注音化：將文字轉為注音。
- 火星化：將文字轉換為繁體火星文。
- 维基简体化：只使用维基百科的词库将文字转换为简体。
- 維基繁體化：只使用維基百科的詞庫將文字轉換為繁體。

## 設定與客製化

### 在 VS Code 中如何設定

1. **圖形介面**：`檔案` → `喜好設定` → `設定`，搜尋 **Fanhuaji**。
2. **`settings.json`**：`Ctrl+Shift+P`（macOS 為 `Cmd+Shift+P`）→ 選擇「Preferences: Open User Settings (JSON)」或「Open Workspace Settings (JSON)」。

擴充讀取的設定鍵為 **`fanhuaji`**。**作用範圍**：若目前作用中的編輯器檔案屬於某個工作區資料夾，會優先套用該資料夾的工作區設定；否則使用使用者設定。

### 頂層設定

| 鍵 | 說明 |
| --- | --- |
| `fanhuaji.server` | API 基底網址，預設為 `https://api.zhconvert.org`。 |
| `fanhuaji.key` | API 金鑰（若您使用的服務需要）。 |
| `fanhuaji.convertParams` | 送交 [`/convert` API](https://docs.zhconvert.org/api/convert/) 的額外參數（JSON 物件，可為 `{}`）。 |

以下欄位皆寫在 **`fanhuaji.convertParams`** 內。

### 字幕樣式與日文相關

#### `ignoreTextStyles`（字串）

不希望被繁化姬處理的「樣式」名稱，以**逗號**分隔。常用於保護特效字幕等。

```json
"fanhuaji": {
  "server": "https://api.zhconvert.org",
  "key": "",
  "convertParams": {
    "ignoreTextStyles": "OPJP,OPCN"
  }
}
```

#### `jpTextStyles`（字串）

指定哪些樣式當作日文處理。若改為自行指定，須加上 **`*noAutoJpTextStyles`**，否則伺服器仍會自動猜測日文樣式。

```json
"convertParams": {
  "jpTextStyles": "OPJP,EDJP,*noAutoJpTextStyles"
}
```

#### `jpStyleConversionStrategy` / `jpTextConversionStrategy`（字串）

可選值：`none`、`protect`、`protectOnlySameOrigin`、`fix`（預設多為 `protectOnlySameOrigin`）。

- **`jpStyleConversionStrategy`**：對您標成日文樣式的區段如何處理。
- **`jpTextConversionStrategy`**：對繁化姬偵測到的日文區域如何處理。

```json
"convertParams": {
  "jpStyleConversionStrategy": "protectOnlySameOrigin",
  "jpTextConversionStrategy": "protect"
}
```

### `modules`（物件）

強制開關轉換模組：`-1` 自動、`0` 停用、`1` 啟用。可使用 `"*"` 先設定全部模組，再單獨覆寫。擴充會將此物件轉成 JSON 字串後送交 API。

```json
"convertParams": {
  "modules": {
    "*": 0,
    "Naruto": 1,
    "Typo": 1
  }
}
```

### `userPreReplace`（轉換前取代）

在交給繁化姬**之前**，先把「鍵」替換成「值」。在 `settings.json` 中建議使用**物件**（鍵＝搜尋文字、值＝取代文字）；擴充會轉成 API 所需的 `搜尋=取代` 格式（每行一組）。

```json
"convertParams": {
  "userPreReplace": {
    "GUNDAM": "鋼彈",
    "公司內部代號X1": "正式名稱"
  }
}
```

### `userPostReplace`（轉換後取代）

繁化姬轉換完成後，再進行額外的搜尋／取代。

```json
"convertParams": {
  "userPostReplace": {
    "預設專案名": "正式產品名",
    "tmp": "temporary"
  }
}
```

### `userProtectReplace`（保護字詞）

列表中的字串在轉換過程中應維持不變。設定為**字串陣列**；擴充會以換行合併後送交 API。

```json
"convertParams": {
  "userProtectReplace": ["GitHub", "OpenCC", "某商標完整寫法"]
}
```

### 差異比對（`diff*`）

用於啟用或調整轉換前後的差異輸出（詳見 [convert API 說明](https://docs.zhconvert.org/api/convert/)）。

```json
"convertParams": {
  "diffEnable": true,
  "diffCharLevel": false,
  "diffContextLines": 2,
  "diffIgnoreCase": true,
  "diffIgnoreWhiteSpaces": false,
  "diffTemplate": "Unified"
}
```

`diffTemplate` 可選：`Inline`、`SideBySide`、`Unified`、`Context`、`Json`。

### 文字清理與格式

```json
"convertParams": {
  "cleanUpText": true,
  "ensureNewlineAtEof": true,
  "translateTabsToSpaces": 4,
  "trimTrailingWhiteSpaces": true,
  "unifyLeadingHyphen": true
}
```

- **`translateTabsToSpaces`**：`-1` 表示不轉換；`0` 表示移除行首 Tab；`1`～`8` 表示將行首 Tab 轉成對應數量的空格。

### 完整範例（多項合併）

```json
{
  "fanhuaji": {
    "server": "https://api.zhconvert.org",
    "key": "",
    "convertParams": {
      "ignoreTextStyles": "OPJP,OPCN",
      "jpTextStyles": "OPJP,*noAutoJpTextStyles",
      "jpStyleConversionStrategy": "protectOnlySameOrigin",
      "jpTextConversionStrategy": "protectOnlySameOrigin",
      "modules": {
        "*": -1,
        "Typo": 1
      },
      "userPreReplace": {
        "MS": "Mobile Suit"
      },
      "userPostReplace": {
        "臨時用語": "定稿用語"
      },
      "userProtectReplace": ["品牌A", "API_URL"],
      "diffEnable": false,
      "cleanUpText": false,
      "ensureNewlineAtEof": false,
      "translateTabsToSpaces": -1,
      "trimTrailingWhiteSpaces": false,
      "unifyLeadingHyphen": false
    }
  }
}
```

### 使用擴充時的行為

- 有選取範圍時：只轉換選取內容（支援多個選取區，會合併請求後再寫回各區）。
- 未選取時：轉換**整份**目前文件。
- 單次送出的文字長度有上限（約 5,000,000 **位元組**）。

## 商業使用

繁化姬的文字轉換服務在一般使用下為免費，但若是商業使用將酌收費用。
詳情請見[繁化姬商業使用](https://docs.zhconvert.org/commercial)。

## 錯誤回報

本插件僅使用繁化姬的網路 API ，並不實作文字轉換。
因此，如果您發現有「轉換錯誤」，請回報至以下任一位置。

- [繁化姬](https://zhconvert.org)
- [繁化姬 GitHub 討論頁](https://github.com/Fanhuaji/discussion/issues)
- [繁化姬 Telegram 群組](https://t.me/fanhuaji)

## 相關連結

- [繁化姬](https://zhconvert.org)
- [繁化姬 說明文件](https://docs.zhconvert.org)
