"use strict";
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
const Handler_1 = __importDefault(require("./Handler"));
const HEADER_TEMPLATE = ['grey', 'blue', 'wathet', 'turquoise', 'green', 'yellow', 'orange', 'red', 'carmine', 'violet', 'purple', 'indigo'];
class FeishuHandler extends Handler_1.default {
    constructor(robotKey) {
        super(robotKey);
    }
    blockToElements(customData) {
        const elements = [];
        let fields = [];
        customData.forEach((item, index) => {
            if (typeof item === 'string') {
                switch (true) {
                    case item === 'hr' || item === 'line':
                        //分块，创建新的fields，忽略结尾分割线
                        if (index < customData.length - 1) {
                            elements.push({ tag: 'div', fields });
                            elements.push({ tag: 'hr' });
                            fields = [];
                        }
                        break;
                    case item.startsWith('[short]'):
                        fields.push({ is_short: true, text: { tag: 'lark_md', content: item } });
                        break;
                    default:
                        fields.push({ is_short: false, text: { tag: 'lark_md', content: item } });
                        break;
                }
            }
            else {
                const content = `${item.key}: **${item.value}**`;
                fields.push({ is_short: true, text: { tag: 'lark_md', content } });
            }
        });
        elements.push({ tag: 'div', fields });
        return elements;
    }
    onExce() {
        return __awaiter(this, void 0, void 0, function* () {
            const content = this.getContent();
            const elements = [];
            content.forEach((item, index) => {
                switch (item.type) {
                    case 'blocks':
                        return this.blockToElements(item.data);
                    case 'markdown':
                        elements.push({ tag: 'markdown', content: item.data });
                        break;
                    case 'button':
                        elements.push({
                            tag: 'div', text: { tag: 'lark_md', content: '' },
                            extra: { tag: 'button', text: { tag: 'lark_md', content: item.data.label }, type: 'primary', url: item.data.url }
                        });
                        break;
                    case 'note':
                        elements.push({
                            tag: 'note',
                            elements: [{ tag: 'plain_text', content: item.data }]
                        });
                        break;
                }
            });
            const color = this.getColor();
            const headerColor = color && HEADER_TEMPLATE.includes(color) ? color : HEADER_TEMPLATE[0];
            const data = {
                config: { wide_screen_mode: true },
                header: {
                    title: { tag: 'plain_text', content: this.getTitle() },
                    template: headerColor
                },
                elements
            };
            yield RobotFeishu_1.default.send(this.robotKey, 'interactive', data);
        });
    }
}
exports.default = FeishuHandler;
