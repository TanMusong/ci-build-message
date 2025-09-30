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
const FeishuHandler_1 = __importDefault(require("./handler/FeishuHandler"));
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
    var handler;
    switch (robotType.toLocaleLowerCase()) {
        case 'feishu':
            handler = new FeishuHandler_1.default(robotKey);
            break;
        default:
            process.exit(1);
    }
    yield handler.exce();
}))();
