# AB 复读机

这是一个静态网页 MP3 复读机。用户选择本地 MP3 文件后，可以锁定 A/B 片段、循环播放，并在 0.25x 到 4x 之间调节速度。

## 本地打开

直接双击 `index.html`，或把整个文件夹部署到任意静态网站服务。

## GitHub Pages 上线

1. 新建一个 GitHub 仓库，例如 `ab-repeat-player`。
2. 上传 `index.html`、`styles.css`、`app.js` 和 `README.md`。
3. 进入仓库的 Settings。
4. 打开 Pages。
5. Source 选择 `Deploy from a branch`。
6. Branch 选择 `main`，目录选择 `/root`。
7. 保存后等待 GitHub 生成网址。

这个项目没有后端和数据库，适合直接放在 GitHub Pages 这类静态网站服务上。

## 域名选择

优先选短、好拼、好记的 `.com`，比如围绕 `abrepeat`、`mp3repeat`、`listenloop` 这类词组合。购买前重点看：

- 首年价格和续费价格，不要只看第一年促销价。
- 是否包含 WHOIS 隐私保护。
- DNS 管理是否方便。
- 是否容易设置 `www` 和根域名。

推荐先看 Cloudflare Registrar 或 Porkbun。Cloudflare 的优势是接近成本价和 DNS 稳；Porkbun 的优势是界面直观、价格透明。买完域名后，在 GitHub 仓库 Settings -> Pages 里填写 Custom domain，再到域名商后台添加 DNS：

- 根域名使用 GitHub Pages 的 `A` 记录。
- `www` 子域名使用 `CNAME` 指向你的 GitHub Pages 默认域名。
- DNS 生效后打开 `Enforce HTTPS`。

## 广告变现

这个工具适合做轻量广告位，但前期收益通常不会高。更现实的路线是先把网站做得稳定、可分享，再通过搜索流量、教程内容、社群传播慢慢积累访问量。

后期接 Google AdSense 时，建议补几个内容页，例如：

- 英语听力 AB 复读练习方法
- 如何用慢速播放练口语跟读
- MP3 本地复读和在线上传音频的隐私差别

只有一个工具页也能上线，但广告平台更喜欢有原创内容、隐私政策、联系方式和稳定访问量的网站。页面底部已经预留两个广告位，后期可以接入 Google AdSense 或其他广告平台。
