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
const fs_1 = __importDefault(require("fs"));
const FeishuHandler_1 = __importDefault(require("./handler/FeishuHandler"));
const WechatHandler_1 = __importDefault(require("./handler/WechatHandler"));
const ProcessUtil_1 = __importDefault(require("./utils/ProcessUtil"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    const robotKey = ProcessUtil_1.default.getArg('--robot-key', value => !!value && !value.startsWith('--'));
    if (!robotKey) {
        console.error(`illegal parameter --robot-key`);
        return;
    }
    const robotType = ProcessUtil_1.default.getArg('--robot-type', value => ['wechat', 'feishu'].indexOf(value.toLocaleLowerCase()) >= 0);
    if (!robotType) {
        console.error(`illegal parameter --robot-type`);
        return;
    }
    const taskName = ProcessUtil_1.default.getArg('--name', value => value && !value.startsWith('--'));
    if (!taskName) {
        console.error(`illegal parameter --name`);
        return;
    }
    const projectDir = ProcessUtil_1.default.getArg('--project', fs_1.default.existsSync);
    if (!projectDir) {
        console.error(`illegal parameter --project or file not exists`);
        return;
    }
    const customDataArg = ProcessUtil_1.default.getArg('--data', value => value && !value.startsWith('--'));
    const handler = new (robotType.toLocaleLowerCase() === 'wechat' ? WechatHandler_1.default : FeishuHandler_1.default)(robotKey, taskName, projectDir, customDataArg);
    if (ProcessUtil_1.default.haveArg('--begin'))
        yield handler.begin();
    else if (ProcessUtil_1.default.haveArg('--end'))
        yield handler.end();
    else
        console.error(`Command Error! `);
}))();
