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
const ProcessUtil_1 = __importDefault(require("../utils/ProcessUtil"));
class Handler {
    constructor(robotKey) {
        this.robotKey = robotKey;
    }
    getTitle() {
        const title = ProcessUtil_1.default.getArg('--title', value => value && !value.startsWith('--'));
        return title;
    }
    getColor() {
        const color = ProcessUtil_1.default.getArg('--color', value => value && !value.startsWith('--'));
        return color;
    }
    getContent() {
        const content = [];
        for (let i = 0, length = process.argv.length; i < length; i++) {
            const key = process.argv[i];
            switch (key) {
                case '--md':
                    {
                        const data = process.argv[i + 1];
                        content.push({ type: 'markdown', data });
                        i++; //skip data item
                    }
                    break;
                case '--blocks':
                    {
                        const data = process.argv[i + 1];
                        const blockArgs = data.split(';');
                        if (!blockArgs)
                            break;
                        const blocks = [];
                        blockArgs.forEach(item => {
                            if (!item || !item.length)
                                return;
                            item = item.replace('==', '|||||');
                            const data = item.split('=').map(value => value.replace('|||||', '='));
                            if (data.length === 1) {
                                blocks.push(data[0]);
                            }
                            else if (data.length === 2) {
                                blocks.push({ key: data[0], value: data[1] });
                            }
                        });
                        content.push({ type: 'blocks', data: blocks });
                        i++; //skip data item
                    }
                    break;
                case '--button':
                    {
                        const data = process.argv[i + 1];
                        const blockArgs = data.split(';');
                        if (blockArgs.length === 2) {
                            const button = { label: blockArgs[0], url: blockArgs[1] };
                            content.push({ type: 'button', data: button });
                            i++; //skip data item
                        }
                    }
                    break;
                case '--note':
                    {
                        const data = process.argv[i + 1];
                        content.push({ type: 'note', data });
                        i++; //skip data item
                    }
                    break;
                default:
                    break;
            }
        }
        return content;
    }
    exce() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.onExce();
        });
    }
}
exports.default = Handler;
