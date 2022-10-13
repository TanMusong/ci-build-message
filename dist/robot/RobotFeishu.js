"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("request"));
var RobotFeishu;
(function (RobotFeishu) {
    const WEBHOOK_URL = 'https://open.larksuite.com/open-apis/bot/v2/hook/';
    function send(key, messageType, content) {
        const promise = new Promise(resolve => {
            const messageData = { msg_type: messageType };
            if (messageType === 'interactive')
                messageData.card = content;
            else
                messageData.content = content;
            const body = JSON.stringify(messageData);
            request_1.default.post({
                url: WEBHOOK_URL + key, method: "POST",
                headers: { "content-type": "application/json", },
                body
            }, (error, response, body) => resolve({ error, response, body }));
        });
        return promise;
    }
    RobotFeishu.send = send;
})(RobotFeishu || (RobotFeishu = {}));
exports.default = RobotFeishu;
