"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("request"));
var RobotWechat;
(function (RobotWechat) {
    const WEBHOOK_URL = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=';
    RobotWechat.send = (key, messageType, message) => {
        let messageData = { msgtype: messageType };
        messageData[messageType] = { content: message };
        let messageString = JSON.stringify(messageData);
        (0, request_1.default)({
            url: WEBHOOK_URL + key,
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: messageString
        });
    };
})(RobotWechat || (RobotWechat = {}));
exports.default = RobotWechat;
