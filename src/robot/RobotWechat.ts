import request from 'request';

namespace RobotWechat {

    const WEBHOOK_URL = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=';
    type MESSAGE_DATA = { msgtype: 'text' | 'markdown', text?: { content: string }, markdown?: { content: string } }

    export const send = (key: string, messageType: 'text' | 'markdown', message: string): void => {
        let messageData: MESSAGE_DATA = { msgtype: messageType };
        messageData[messageType] = { content: message };
        let messageString = JSON.stringify(messageData);
        request({
            url: WEBHOOK_URL + key,
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: messageString
        });
    }
}

export default RobotWechat;