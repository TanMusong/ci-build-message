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
exports.BUILD_HISTROY_LIMIT = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const FileUtil_1 = __importDefault(require("../utils/FileUtil"));
const GitLogUtil_1 = __importDefault(require("../utils/GitLogUtil"));
exports.BUILD_HISTROY_LIMIT = 20;
class Handler {
    constructor(robotKey, taskName, projectDir, data) {
        this.robotKey = robotKey;
        this.taskName = taskName;
        this.projectDir = projectDir;
        this.data = data;
        const hash = crypto_1.default.createHash('md5');
        hash.update(projectDir, 'utf8');
        const hex = hash.digest('hex');
        console.log(`Project Hex: ${hex}`);
        this.configFilePath = path_1.default.join(__dirname, '..', '..', '.__build_start_mark', `${hex}.json`);
        FileUtil_1.default.mkdir(path_1.default.dirname(this.configFilePath));
    }
    markBuildStart() {
        return __awaiter(this, void 0, void 0, function* () {
            let config;
            if (fs_1.default.existsSync(this.configFilePath)) {
                const configString = fs_1.default.readFileSync(this.configFilePath).toString();
                config = JSON.parse(configString);
                console.log(`Read Cache Git Version: ${config.version} From ${this.configFilePath}`);
            }
            else {
                config = {};
                config.version = yield GitLogUtil_1.default.readGitVersion(this.projectDir);
                console.log(`Get Git Version: ${config.version}`);
            }
            config.timestamp = Date.now();
            fs_1.default.writeFileSync(this.configFilePath, JSON.stringify(config));
        });
    }
    getBuildInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            // 读取工程构建前记录的提交版本
            if (!fs_1.default.existsSync(this.configFilePath)) {
                console.log(`Config File Not Exist`);
                return null;
            }
            const configString = fs_1.default.readFileSync(this.configFilePath).toString();
            const config = JSON.parse(configString);
            FileUtil_1.default.rm(this.configFilePath);
            const logs = config.version ? yield GitLogUtil_1.default.readGitLog(this.projectDir, config.version) : [];
            const time = config.timestamp ? (Date.now() - config.timestamp) : 0;
            return { logs, time };
        });
    }
    getCustomData() {
        const customData = [];
        if (!this.data)
            return customData;
        const customDataArray = this.data.split(';');
        if (!customDataArray)
            return customData;
        customDataArray.forEach(item => {
            if (!item || !item.length)
                return;
            item = item.replace('==', '|||||');
            const data = item.split('=').map(value => value.replace('|||||', '='));
            if (data.length === 1)
                customData.push(data[0]);
            else if (data.length === 2)
                customData.push({ key: data[0], value: data[1] });
        });
        return customData;
    }
    begin() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.markBuildStart();
            yield this.onExceBegin();
        });
    }
    end() {
        return __awaiter(this, void 0, void 0, function* () {
            const buildInfo = yield this.getBuildInfo();
            yield this.onExceEnd(buildInfo);
        });
    }
}
exports.default = Handler;
