# CI Build Message
[![Node.js Package](https://github.com/TanMusong/ci-build-message/actions/workflows/npm-publish-github-packages.yml/badge.svg)](https://github.com/TanMusong/ci-build-message/actions/workflows/npm-publish-github-packages.yml)
[![NPM version](https://img.shields.io/npm/v/ci-build-message.svg)](https://www.npmjs.com/package/ci-build-message)


### Requirements

* git

### Install
```bash
npm install -g ci-build-message
```
### Usage

```bash
cibm/cibuildmessage --begin\
    --project <project path> \
    --robot-type [wechat|feishu] \
    --robot-key <webhook key> \
    --name <ci key> \
    --data <custom data like "text;value=key;value2=key2;text2">
```

```bash
cibm/cibuildmessage --end\
    --project <project path> \
    --robot-type [wechat|feishu] \
    --robot-key <webhook key> \
    --name <ci key> \
    --url <preview or download url>
    --data <custom data like "text;value=key;value2=key2;text2">
```