# CHANGELOG.md

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
