// 使用 ts-node 載入設定，避免 @swc-node 與專案鎖定的 @swc/core 版本不相容（decoratorVersion 等欄位）
require("ts-node/register/transpile-only")
module.exports = require("./webpack.config.ts").default
