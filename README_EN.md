[简体中文](https://github.com/KwokKwok/Silo)

<p align="center"><a target="_blank" href="https://silo-chat.vercel.app" target="_blank" rel="noreferrer noopener"><img style="width:160px" alt="Silo" src="https://silo-chat.vercel.app/logo.svg"></a></p>
<h1 align="center">Silo - Pure front-end multi-model chat, text-to-image generation</h1>

<p align="center"><a target="_blank" rel="noreferrer noopener" href="https://silo-chat.vercel.app"><img alt="ONLINE" src="https://img.shields.io/badge/ONLINE-112418.svg?&style=for-the-badge&logo=safari&logoColor=white"></a></p>

<p align="center"><a target="_blank" rel="noreferrer noopener" href="https://chromewebstore.google.com/detail/nakohnjaacfmjiodegibhnepfmioejln"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome Web STORE-141e24.svg?&style=for-the-badge&logo=google-chrome&logoColor=white"></a> 
<!-- <a rel="noreferrer noopener" target="_blank" href="https://microsoftedge.microsoft.com/addons/detail/silo-siliconcloud-api-p/kjfjhcmdndibdlfofffhoehailbdlbod"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Edge Addons-141e24.svg?&style=for-the-badge&logo=microsoft-edge&logoColor=white"></a>  -->
<a target="_blank" rel="noreferrer noopener" href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKwokKwok%2FSilo.git&project-name=silo&repository-name=silo&env=SILO_EXPERIENCE_SK&envDescription=You%20can%20input%200%20indicate%20not%20providing%20trial%20way%EF%BC%8Ccheck%20GitHub%20README%20for%20more%20environment%20variables&envLink=https%3A%2F%2Fgithub.com%2FKwokKwok%2FSilo%2Fblob%2Fmain%2FREADME_EN.md%23environment-variables"><img alt="Deploy" src="https://img.shields.io/badge/Deploy To Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"></a></p>

<br/>
<p align="center">Silo is an application mainly based on the <a target="_blank" href="https://siliconflow.cn/zh-cn/siliconcloud" target="_blank">SiliconCloud</a> API, which currently supports multiple large models for simultaneous <b>chat、text to image</b>, with extremely fast response times. It supports model parameter adjustments and automatic balance refresh functions.</p>
<p align="center">You can also conveniently add models such as Google Gemini, Claude, X-AI/Grok, OpenAI, and others.</p>
<br/>
<p align="center">And it does not require a backend/server.</p>

## Features

🌐 Browser extension and web access available, and you can chat with page by using extension<br>
📱 Support PWA, can be installed as a local application<br>
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

## Setting Parameters via URL

Silo supports getting parameters through URLs, which allows it to be used as a search engine. For example, you can add `https://silo-chat.vercel.app/#/chat?q=%s` as a search engine in Chrome.

Additionally, you can temporarily set the model and system prompt for the new conversation page by specifying `active_models` or `system_prompt_id`.

Available parameters:

```js
- q: Conversation question, suitable for search engines
- active_models: Activated chat model IDs, multiple models separated by commas. Model IDs can be copied from the chat panel
- system_prompt_id: Activated system prompt ID. System prompt IDs can be copied from the selection page
```

> [!NOTE]
> For example, you can use the default English Translator system prompt to provide a translation engine by specifying `system_prompt_id`<br>`https://silo-chat.vercel.app/#/chat?q=%s&system_prompt_id=preset-english-translator`

## Browser Extension

<p align="left"><a target="_blank" rel="noreferrer noopener" href="https://chromewebstore.google.com/detail/nakohnjaacfmjiodegibhnepfmioejln"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome Web Store-141e24.svg?&style=for-the-badge&logo=google-chrome&logoColor=white"></a>
<!-- <a rel="noreferrer noopener" target="_blank" href="https://microsoftedge.microsoft.com/addons/detail/silo-siliconcloud-api-p/kjfjhcmdndibdlfofffhoehailbdlbod"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Edge Addons-141e24.svg?&style=for-the-badge&logo=microsoft-edge&logoColor=white"></a>  -->
<a target="_blank" rel="noreferrer noopener" href="https://github.com/KwokKwok/SiloChat/releases"><img alt="github releases" src="https://img.shields.io/badge/RELEASES-181717.svg?&style=for-the-badge&logo=github&logoColor=white"></a></p>

When the version of this project changes, it will be automatically packaged and submitted to the Chrome App Store, and the generated zip file will be uploaded to [GitHub Releases](https://github.com/KwokKwok/SiloChat/releases). You can also download it directly and install it in the browser.

## Docker deployment

```yaml
version: '3.8'

services:
  frontend:
    image: ghcr.io/KwokKwok/silo:latest
    restart: always
    ports:
      - '3000:3000'
    environment:
      # Set the default experience SiliconFlow API key.
      - SILO_EXPERIENCE_SK=
      # Default activated chat model
      - SILO_DEFAULT_ACTIVE_CHAT_MODELS=Qwen/Qwen2.5-7B-Instruct,THUDM/glm-4-9b-chat,01-ai/Yi-1.5-9B-Chat-16K
```

## Environment Variables

> [!NOTE]
> This section is not of concern to regular users, only those who are deploying the project themselves may need to understand it. Environment variables configured may need to be restarted or re-deployed. Please verify whether it is effective.

> [!NOTE]
> As a reminder, this project is purely frontend-based, and the configured keys may be maliciously used, so please configure with caution.

```js
- SILO_EXPERIENCE_SK: SiliconFlow experience API key; you can enter '0' indicate not providing this option
- SILO_PAID_SK: SiliconFlow paid API key; when set, there will be no experience key notification or restrictions
- PAID_SK_PASSWORD: Password to protect the paid key, after setting, users can automatically use the paid key by entering the password in the user interface. It is strongly recommended to set this variable at the same time as SILO_PAID_SK. Please note that this variable does not start with SILO_
- SILO_AFF_LINK: Registration link in the SiliconFlow key popup
- SILO_DEFAULT_ACTIVE_CHAT_MODELS: Default activated chat models, multiple models separated by commas
- SILO_DEFAULT_ACTIVE_IMAGE_MODELS: Default activated text-to-image models, multiple models separated by commas
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
