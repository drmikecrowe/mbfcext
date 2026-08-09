# 官方媒体偏见/事实核查扩展程序

<!-- hy-mt2-i18n:start -->
[English](./README.md) | **中文** | [日本語](./README_ja.md) | [Español](./README_es.md)
<!-- hy-mt2-i18n:end -->


## 最新动态

### 4.1 版本新功能

- **已恢复对 Facebook 动态内容的标注功能** — 随着 Facebook 最近对 DOM 结构的调整，偏见标签现在能正确显示在新闻文章上
- **新闻搜索按钮** — 可直接通过偏见标签搜索相关文章的更多信息（可在设置中关闭该功能）
- **性能提升** — 采用延迟处理的 MutationObserver 机制，进一步提升效率

### 4.0 版本亮点

- **赞助内容控制选项** — 可选择折叠或隐藏推送流中的赞助内容
- **已移除对 Twitter/X 的支持** — 因平台 API 发生变更
- **现代化的扩展架构** — 已升级至基于 Manifest v3 的 Plasmo 框架

### 新的支持渠道

虽然该子版块仍会保持活跃，但我们将把主要支持渠道转移到我们的[Facebook 页面](https://www.facebook.com/mbfcext)上。

## 构建说明

请参阅 [BUILD.md](BUILD.md) 文档。

## 简介

感谢您安装了[官方媒体偏见/事实核查扩展程序](https://drmikecrowe.github.io/mbfcext/)！非常感谢您使用我们的扩展程序！

在浏览 Facebook 动态时即可获取相关资讯。我们是互联网上最全面的媒体偏见查询资源，目前数据库中已收录 1100 多家媒体来源，且数量仍在每日增加。切勿被虚假新闻来源误导。该扩展是完全开源的，其源代码托管在[此处](https://github.com/drmikecrowe/mbfcext)。

如果您发现该扩展存在任何问题，或有改进它的想法，或是仅仅想就此进行讨论，我们还有[r/MediaBiasFactCheck subreddit](https://www.reddit.com/r/MediaBiasFactCheck/)可供使用。

## 我们需要您的帮助！

如果您喜欢这个扩展程序，欢迎协助我们：

- 请在[Chrome Web 商店](https://chromewebstore.google.com/detail/media-bias-fact-check/ganicjnkcddicfioohdaegodjodcbkkh)或[Firefox 插件页面](https://addons.mozilla.org/en-US/firefox/addon/media-bias-fact-check/)留下好评，这有助于我们吸引更多用户。
- 务必将此扩展推荐给您的朋友。如果您想分享到 Facebook，[立即点击这里](https://www.facebook.com/sharer/sharer.php?u=https%3A//chromewebstore.google.com/detail/media-bias-fact-check/ganicjnkcddicfioohdaegodjodcbkkh)。

## 4.1 版本发布说明

- 在 Facebook 的 DOM 发生变化后恢复了其信息流标注功能  
- 添加了用于查找文章的新闻搜索按钮（可自定义配置）  
- 升级至 Node 24 及最新版本的 TypeScript 5.9  
- 通过延迟触发 MutationObserver 提升性能  
- 增加了 Google Analytics 跟踪功能，以便了解功能使用情况

# 版本 4.0 的发布说明

- 升级至 Node 18  
- 迁移为以 Plasmo 作为扩展基础  
- 升级至 manifest v3  
- 将 Google Analytics 升级至 v4

# 版本 3.0 的发布说明

- 现已支持新的 Facebook 页面布局  
- 对代码进行了全面重构  
- 现已可针对 Firefox 和 Opera 浏览器开发扩展程序

# 版本 2.0 的发布说明

### 现已为被举报的网站显示偏见图标

- 浏览经过 Media Bias/Fact Check 审核的网站时，扩展程序的图标将会变为反映该网站偏见的样式  
- 如果您在设置中已折叠该网站，该图标会闪烁以引起您的注意

## 版本 1.0.15 的发布说明

### 现在可显示更详细的信息：

- 报告分析：由[Media Bias/Fact Check](https://mediabiasfactcheck.com)提供的报告分析结果  
- 参考度：此处指的是[Moz的链接权值](https://moz.com/learn/seo/what-is-link-equity)，该概念过去曾被俗称为“链接汁液”，是一种基于某些链接能够将价值与权威从一页传递到另一页这一理念的搜索引擎排名因素。这一数值会受到诸多因素的影响，比如链接页面的权威性、主题相关性、HTTP状态等。能够传递权值的链接是谷歌及其他搜索引擎用于确定页面在搜索结果页中排名的众多信号之一。即Moz的链接权值分析结果。  
- 流行度：在2000多个经MBFC分析的网站中，该数值反映了该网站在所有分析网站中的位置。参考度（链接权值）较低的网站，其流行度接近0%；而拥有300万条参考链接的网站则流行度为100%。这一百分比有助于你判断应对该网站给予多大的重视程度。  
- 搜索功能：点击此链接将在我们的姊妹网站[https://factualsearch.news](https://factualsearch.news)打开新窗口，尝试搜索相关标语内容。这有助于你开始针对特定主题及其准确性展开研究。

### 新功能：

- 现已支持折叠“综合”类事实报道来源

## 1.0.13 版本更新说明

我们非常高兴地宣布一项新功能：**可折叠新闻**。

- 点击左侧的“折叠”选项  
- 选择要在信息流中折叠哪些新闻类别  
- 摆脱那些极端脸书好友带来的压力，享受轻松体验
