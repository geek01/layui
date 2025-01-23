# 🍀 Layui 貢獻指南

為了提升溝通效率，請花幾分鐘時間仔細閱讀本文檔。遵循這些指南有助於表達您尊重管理和開發這個開源項目的貢獻者。作為回報，他們也會以同樣的尊重來處理或評估您的 Issue 和 Pull Request。

## Issue

### 創建 Issue 之前

Layui 的 issue 只受理 「Bug 報告」和「功能請求」。如果是關於如何使用、功能疑惑或其他業務相關的問題建議在 Discussions 尋找社區幫助。若 issue 不符合規定或違背社區行為準則，它將會被立即關閉。

**在正式創建 Issue 之前，您應當確保已完成以下前置工作**：

- 仔細查看 Layui 官方文檔和每個版本的更新日誌：https://layui.dev
- 在 Issues 中搜索相似問題，找到解決方案，但應避免在舊的 Issue 中留言。
- 通過其他技術社區搜索相關資料、或充分利用當前主流的人工智能大模型

**為什麼要有嚴格的 issue 規定**：

維護開源項目是一項艱辛的工作，它崇高而又略顯卑微。加上 Layui 的使用門檻相對較低，隨著受眾的廣為推崇，我們每天疲於應對各種技術反饋，包括：bug 報告，功能需求和 Pull Requests。

作為一個免費使用的開源項目，Layui 的維護人手是有限的。這意味著想要讓項目可持續發展，我們必須：

1. 給予更具體的工作、更高的優先級（如 bug 修復和新功能的開發）；
2. 提高 issue 處理的效率。

針對 (1)，我們決定將 GitHub issue 嚴格地限制在有具體目標和內容的工作。問題和討論應當發送到更適合它們的場合。比如關於「如何使用」，建議發到 Layui 討論區，或者把它細化成更具體的 Bug 和 Feature Request。這兩者的區別是，「如何使用」是一個未經思考和調研的問句，而 Bug 和 Feature Request 需要提問者進一步明確這是一個缺陷或者未支持的特性。

針對 (2)，我們發現影響 issue 處理效率最大兩點因素是：a) 用戶開 issue 之前並沒有做好前置工作，這導致大量重複且初級的 issue 不斷出現；b) 用戶開 issue 時沒有提供足夠有效的信息，這導致我們需要花費大量的時間去跟用戶來回溝通，只為了獲得一些基本信息好讓我們對 issue 進行真正的分析。因此，為了減少不必要的資源消耗，嚴格要求 Issue 規定是迫切和必要的。尤其對於 Layui 核心維護者，應當讓他們的主要精力投入到項目更重要的工作中去。

**最重要的是，請明白一件事：開源項目的用戶和維護者之間並不是甲方和乙方的關係，issue 也不是客服。在開 issue 的時候，請抱著「一起合作來解決這個問題」的心態，避免期待社區單方面地為你服務。**

> 以上借鑑了 Ant Design 社區的成熟經驗，並做了適用於 Layui 社區的相關修改。

### 正式創建 issue

當您已對上述事項充分閱讀並理解，在正式創建過程中，您應當遵循 Issue 提供表單規範仔細填寫，儘可能將您所遇到的 Bug 或 Feature Request 描述詳細。

### 創建 issue 之後

- 在 issue 交流過程中，若議題已經得到解決，請主動關閉 issue。
- 大家本著相互尊重、理解和友善的態度，共同維護 Layui 來之不易的良好的社區氛圍，謝謝 💖。


### 其他參考資料
1. [**貢獻者行為準則**](CODE_OF_CONDUCT.md)
2. [**提問的智慧**](https://github.com/tvvocold/How-To-Ask-Questions-The-Smart-Way) @tvvocold
3. [**為什麼需要最小重現**](https://antfu.me/posts/why-reproductions-are-required-zh) @antfu


## Pull Request

Layui 採用靈活的分支管理策略，我們鼓勵您直接在對應的分支上提 Pull Request。為了使得 Reivew 和 Merge 的工作流程更加流暢，請仔細閱讀以下說明：

### 分支說明

- `main` 作為主幹分支，代表的是項目當前穩定的最新版本，接受 feature 和 hotfix 。
- `*.x` 作為歷史穩定版本分支，如 `2.x` 即代表 2.x 系列穩定版本，只接受 hotfix，不接受 feature 。
- `*-dev` 作為未來大版本開發分支，如 `3.0-dev` 即代表 3.0 的開發版本，接受 feature 和 hotfix，但不保證穩定性。

### Commits 規範

Layui 遵循 [Conventional Commits 規範](https://www.conventionalcommits.org/zh-hans/v1.0.0/)，您的 `git commit` 和 PR title 都應遵循這一規範。

### 操作步驟

1. **創建 PR 前**，請按照上述分支規則說明，拉取項目最新代碼後，基於對應的分支進行開發。
2. 在項目根目錄下運行 `npm install` 安裝依賴。
3. 完成開發後，運行 `npm run checks`，確保您的代碼通過了 test, lint 等工具測試。（2.x 分支不支持）
4. **創建 PR 時**，請在 title 項按照 Commits 規範填寫。並請在 description 項嚴格遵循給出的「內容模板」規範填寫，以提供必要的信息，如本次 PR 的具體變更說明、可供預覽的在線演示地址等。
5. **提交 PR 後**，確保已通過 Github CI 檢查，若失敗，可查看具體原因進行調整。
6. 確保以上所有步驟都符合要求後，即可等待項目成員對您的代碼進行 Review 及合併評估。

### 其他參考資料

- [約定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)
