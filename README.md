# CI Build Message

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