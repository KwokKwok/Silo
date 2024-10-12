[简体中文](https://github.com/KwokKwok/Silo)

> [!NOTE]
> Please note: The experience key is public, but please do not abuse the experience key. If you need to modify the code for self-deployment of this project, please modify the default experience key, and at least do not remove the experience key-related restrictions.
> 
> I can disable the current experience key, but I would prefer that everyone not let the trust be disappointed, thank you.

<p align="center"><a target="_blank" href="https://chat.kwok.ink" target="_blank" rel="noreferrer noopener"><img style="width:160px" alt="Silo" src="https://chat.kwok.ink/logo.svg"></a></p>
<h1 align="center">Silo - Pure front-end multi-model chat, text-to-image generation</h1>

<p align="center"><a target="_blank" rel="noreferrer noopener" href="https://chat.kwok.ink"><img alt="ONLINE" src="https://img.shields.io/badge/ONLINE-112418.svg?&style=for-the-badge&logo=safari&logoColor=white"></a></p>

<p align="center"><a target="_blank" rel="noreferrer noopener" href="https://chromewebstore.google.com/detail/nakohnjaacfmjiodegibhnepfmioejln"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome Web STORE-141e24.svg?&style=for-the-badge&logo=google-chrome&logoColor=white"></a> 
<a rel="noreferrer noopener" target="_blank" href="https://microsoftedge.microsoft.com/addons/detail/silo-siliconcloud-api-p/kjfjhcmdndibdlfofffhoehailbdlbod"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Edge Addons-141e24.svg?&style=for-the-badge&logo=microsoft-edge&logoColor=white"></a> 
<a target="_blank" rel="noreferrer noopener" href="https://vercel.com/new/clone?repository-url=https://github.com/KwokKwok/SiloChat.git&project-name=silo-chat&repository-name=SiloChat"><img alt="Deploy" src="https://img.shields.io/badge/Deploy To Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"></a></p>

<br/>
<p align="center">Silo is an application mainly based on the <a target="_blank" href="https://siliconflow.cn/zh-cn/siliconcloud" target="_blank">SiliconCloud</a> API, which currently supports multiple large models for simultaneous <b>chat、text to image</b>, with extremely fast response times. It supports model parameter adjustments and automatic balance refresh functions.</p>
<p align="center">You can also conveniently add models such as Google Gemini, Claude, OpenAI, and others.</p>
<br/>
<p align="center">And it does not require a backend/server.</p>

## Features

🌐 Browser extension and web access available, and you can chat with page by using extension<br>
🚀 Based on SiliconCloud API, rich models and fast response<br>
🔑 Simple configuration, you only need to configure the key once<br>
💰 Support SiliconCloud balance automatic refresh<br>
🧩 Provides the ability to add custom models to use models outside of the API。Quickly supports Gemini, Claude, DeepSeek, ZhiPu, and provides OpenAI-compatible configurations, as well as a hardcore method of writing your own code.<br>
🔄 Support adjusting model order<br>
🌙 Night Mode<br>
🧘‍♂️ Zen mode<br>
🇬🇧 i18n support<br>
📱 Mobile phone support (limited by screen size, a simpler version is provided)<br>
📦 Pure front-end implementation (convenient for migration, CDN deployment, etc., does not rely on server transfer)<br>
🔧 Model parameter adjustment<br>
💬 Optimized input experience<br>

<!-- ![dark](./docs/dark.png)
![light](./docs/light.png)
<img src="./docs/mobile.jpg" alt="mobile" width="250"> -->

## Browser Extension

<p align="left"><a target="_blank" rel="noreferrer noopener" href="https://chromewebstore.google.com/detail/nakohnjaacfmjiodegibhnepfmioejln"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome Web Store-141e24.svg?&style=for-the-badge&logo=google-chrome&logoColor=white"></a>
<a rel="noreferrer noopener" target="_blank" href="https://microsoftedge.microsoft.com/addons/detail/silo-siliconcloud-api-p/kjfjhcmdndibdlfofffhoehailbdlbod"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Edge Addons-141e24.svg?&style=for-the-badge&logo=microsoft-edge&logoColor=white"></a> 
<a target="_blank" rel="noreferrer noopener" href="https://github.com/KwokKwok/SiloChat/releases"><img alt="github releases" src="https://img.shields.io/badge/RELEASES-181717.svg?&style=for-the-badge&logo=github&logoColor=white"></a></p>

When the version of this project changes, it will be automatically packaged and submitted to the Chrome App Store and Edge Addons, and the generated zip file will be uploaded to [GitHub Releases](https://github.com/KwokKwok/SiloChat/releases). You can also download it directly and install it in the browser.

## Docker deployment

``` yaml
version: '3.8'

services:
  frontend:
    image: ghcr.io/KwokKwok/silo:latest
    ports:
      - "3000:3000"
    environment:
      # Set the default SiliconFlow API key.
      # - VITE_DEFAULT_SK=
      # Is it allowed to use a trial key for the paid model?
      - VITE_ALLOW_TRIAL_KEY_PAID=false
      # Default activated model
      - VITE_DEFAULT_ACTIVE_MODELS=Qwen/Qwen2.5-7B-Instruct,THUDM/glm-4-9b-chat,01-ai/Yi-1.5-9B-Chat-16K
```

## Acknowledgments

1. Thanks to [SiliconCloud](https://siliconflow.cn/zh-cn/siliconcloud).
1. The chat page was referenced from [Vercel AI Playground](https://sdk.vercel.ai/playground), and the column division was referenced from [ChatHub](https://chathub.gg/).
1. The translation used the default prompt of [Immersive Translate](https://immersivetranslate.com/zh-Hans/), which was very effective.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.

## More

<details>
<summary>Buy Me A Coffee</summary>

### Buy me a coffee

> Thanks to the suggestion from [黄少侠@Jike](https://m.okjike.com/users/18C4EC79-964F-4DF5-8D63-033A2345B2ED). This project is open source and completely free. If you find this project useful, feel free to Buy me a coffee~

<img src="https://i.imgur.com/Z8zXeSP.jpeg" alt="Buy Me A Coffee" width="224">
</details>
