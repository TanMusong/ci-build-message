import request from 'request';


namespace RobotFeishu {

    const WEBHOOK_URL = 'https://open.larksuite.com/open-apis/bot/v2/hook/';

    export type SendResult = { error: any, response: request.Response, body: any }

    export type MessageText = { text: string };
    export type MessageInteractive = any;

    export type MessagePostTagText = { tag: 'text', text: string, un_escape?: boolean };
    export type MessagePostTagA = { tag: 'a', text: string, href: string };
    export type MessagePostTagAt = { tag: 'at', user_id: string, user_name?: string };
    export type MessagePostTagImg = { tag: 'img', image_key: string, height?: number, width: number };
    export type MessagePost = [(MessagePostTagText | MessagePostTagA | MessagePostTagAt | MessagePostTagImg)[]];


    type MESSAGE_DATA = { content?: string, card?: any, msg_type: string }

    export function send(key: string, messageType: 'text', content: MessageText): Promise<SendResult>;
    export function send(key: string, messageType: 'post', content: MessagePost): Promise<SendResult>;
    export function send(key: string, messageType: 'interactive', content: MessageInteractive): Promise<SendResult>;
    export function send(key: string, messageType: 'text' | 'post' | 'interactive', content: MessageText | MessagePost | MessageInteractive): Promise<SendResult> {
        const promise: Promise<SendResult> = new Promise(resolve => {
            const messageData: MESSAGE_DATA = { msg_type: messageType };
            if (messageType === 'interactive') messageData.card = content;
            else messageData.content = content;
            const body = JSON.stringify(messageData);
            request.post({
                url: WEBHOOK_URL + key, method: "POST",
                headers: { "content-type": "application/json", },
                body
            }, (error: any, response: request.Response, body: any): void => resolve({ error, response, body }));
        });
        return promise;
    }
}

export default RobotFeishu;