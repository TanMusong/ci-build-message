"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RobotFeishu_1 = __importDefault(require("../robot/RobotFeishu"));
const ProcessUtil_1 = __importDefault(require("../utils/ProcessUtil"));
const Handler_1 = __importStar(require("./Handler"));
const HEAD_TEMPLATE = ['blue', 'wathet', 'turquoise', 'green', 'yellow', 'orange', 'red', 'carmine', 'violet', 'purple', 'indigo', 'grey'];
class FeishuHandler extends Handler_1.default {
    gitHistroyToMD(logs) {
        let logString = '';
        for (let index = 0, length = Math.min(logs.length, Handler_1.BUILD_HISTROY_LIMIT); index < length; index++) {
            const { name, title } = logs[index];
            if (index !== 0)
                logString += '\n';
            const fixTitle = title.replace(new RegExp('\\#', 'gm'), '\\#').replace(new RegExp('\\*', 'gm'), '\\*');
            ;
            logString += `**${name}** - ${fixTitle}`;
        }
        if (logs.length > Handler_1.BUILD_HISTROY_LIMIT) {
            logString += '\n';
            logString += `......`;
        }
        return logString;
    }
    onExceBegin() {
        return __awaiter(this, void 0, void 0, function* () {
            const customData = this.getCustomData();
            if (customData && customData.length) {
                const data = {
                    config: { wide_screen_mode: true },
                    header: {
                        title: { tag: 'plain_text', content: `${this.taskName} 开始构建` },
                        template: 'grey'
                    },
                    elements: []
                };
                const fields = [];
                customData.forEach(item => {
                    if (typeof item === 'string')
                        fields.push({ is_short: false, text: { tag: 'lark_md', content: item } });
                    else
                        fields.push({ is_short: true, text: { tag: 'lark_md', content: `${item.key}: **${item.value}**` } });
                });
                data.elements.push({ tag: 'div', fields });
                RobotFeishu_1.default.send(this.robotKey, 'interactive', data);
            }
            else {
                RobotFeishu_1.default.send(this.robotKey, 'text', { text: `${this.taskName} 开始构建` });
            }
        });
    }
    onExceEnd(buildInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                config: { wide_screen_mode: true },
                header: {
                    title: { tag: 'plain_text', content: `${this.taskName} 构建完成` },
                    template: 'grey'
                },
                elements: []
            };
            const customData = this.getCustomData();
            if (customData && customData.length) {
                data.elements.length && data.elements.push({ tag: 'hr' });
                const fields = [];
                customData.forEach(item => {
                    if (typeof item === 'string')
                        fields.push({ is_short: false, text: { tag: 'lark_md', content: item } });
                    else
                        fields.push({ is_short: true, text: { tag: 'lark_md', content: `${item.key}: **${item.value}**` } });
                });
                data.elements.push({ tag: 'div', fields });
            }
            if (buildInfo && buildInfo.logs && buildInfo.logs.length) {
                data.elements.length && data.elements.push({ tag: 'hr' });
                const gitHistroyString = this.gitHistroyToMD(buildInfo.logs);
                data.elements.push({ tag: 'markdown', content: gitHistroyString });
            }
            const url = ProcessUtil_1.default.getArg('--url', value => value && value.startsWith('http'));
            if (url) {
                data.elements.push({
                    tag: 'div', text: { tag: 'lark_md', content: '' },
                    extra: { tag: 'button', text: { tag: 'lark_md', content: '查看/下载' }, type: 'primary', url }
                });
            }
            if (buildInfo) {
                data.elements.push({ tag: 'note', elements: [{ tag: 'plain_text', content: `构建耗时: ${this.timeFormat(buildInfo.time)}` }] });
            }
            RobotFeishu_1.default.send(this.robotKey, 'interactive', data);
        });
    }
    beforeExceSleep(continueUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                config: { wide_screen_mode: true },
                header: {
                    title: { tag: 'plain_text', content: `${this.taskName} 构建暂停` },
                    template: 'grey'
                },
                elements: []
            };
            const customData = this.getCustomData();
            if (customData && customData.length) {
                data.elements.length && data.elements.push({ tag: 'hr' });
                const fields = [];
                customData.forEach(item => {
                    if (typeof item === 'string')
                        fields.push({ is_short: false, text: { tag: 'lark_md', content: item } });
                    else
                        fields.push({ is_short: true, text: { tag: 'lark_md', content: `${item.key}: **${item.value}**` } });
                });
                data.elements.push({ tag: 'div', fields });
            }
            data.elements.push({
                tag: 'div', text: { tag: 'lark_md', content: '' },
                extra: { tag: 'button', text: { tag: 'lark_md', content: '继续构建' }, type: 'primary', url: continueUrl }
            });
            RobotFeishu_1.default.send(this.robotKey, 'interactive', data);
        });
    }
    afterExceSleep() {
        return __awaiter(this, void 0, void 0, function* () {
            yield RobotFeishu_1.default.send(this.robotKey, 'text', { text: `${this.taskName} 构建恢复` });
        });
    }
    timeFormat(time) {
        let ms = time;
        let s = Math.floor(time / 1000);
        if (s <= 0)
            return `${ms}毫秒`;
        ms -= s * 1000;
        const min = Math.floor(s / 60);
        if (min <= 0)
            return `${s}秒 ${ms}毫秒`;
        s -= min * 60;
        return `${min}分 ${s}秒 ${ms}毫秒`;
    }
}
exports.default = FeishuHandler;
