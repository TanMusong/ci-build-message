
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import FileUtil from '../utils/FileUtil';
import GitLogUtil from '../utils/GitLogUtil';

export const BUILD_HISTROY_LIMIT = 20;
export type BuildInfo = { logs: { name: string; title: string; }[], time: number }
export type CustomData = (string | { key: string; value: string; });

type StartBuildMark = { version?: string, timestamp?: number }

export default abstract class Handler {

    private readonly configFilePath: string;

    constructor(
        protected readonly robotKey: string,
        protected readonly taskName: string,
        protected readonly projectDir: string,
        protected readonly data?: string
    ) {
        const hash = crypto.createHash('md5');
        hash.update(projectDir, 'utf8');
        const hex = hash.digest('hex');
        console.log(`Project Hex: ${hex}`);

        this.configFilePath = path.join(__dirname, '..', '..', '.__build_start_mark', `${hex}.json`);
        FileUtil.mkdir(path.dirname(this.configFilePath))

    }


    private async markBuildStart(): Promise<void> {
        let config: StartBuildMark;
        if (fs.existsSync(this.configFilePath)) {
            const configString = fs.readFileSync(this.configFilePath).toString();
            config = JSON.parse(configString);
            console.log(`Read Cache Git Version: ${config.version} From ${this.configFilePath}`);

        } else {
            config = {};
            config.version = await GitLogUtil.readGitVersion(this.projectDir);
            console.log(`Get Git Version: ${config.version}`);
        }

        config.timestamp = Date.now();
        fs.writeFileSync(this.configFilePath, JSON.stringify(config));
    }

    private async getBuildInfo(): Promise<BuildInfo> {
        // 读取工程构建前记录的提交版本
        if (!fs.existsSync(this.configFilePath)) {
            console.log(`Config File Not Exist`);
            return null;
        }
        const configString = fs.readFileSync(this.configFilePath).toString();
        const config: StartBuildMark = JSON.parse(configString);
        FileUtil.rm(this.configFilePath);

        const logs = config.version ? await GitLogUtil.readGitLog(this.projectDir, config.version) : [];
        const time = config.timestamp ? (Date.now() - config.timestamp) : 0;
        return { logs, time };
    }

    protected getCustomData(): CustomData[] {
        const customData:CustomData[] = [];
        if (!this.data) return customData;
        const customDataArray = this.data.split(';');
        if (!customDataArray) return customData;
        customDataArray.forEach(item => {
            if (!item || !item.length) return;
            item = item.replace('==', '|||||');
            const data = item.split('=').map(value => value.replace('|||||', '='));
            if (data.length === 1)
                customData.push(data[0]);
            else if (data.length === 2)
                customData.push({ key: data[0], value: data[1] });
        });
        return customData;
    }

    public async begin(): Promise<void> {
        await this.markBuildStart();
        await this.onExceBegin();
    }
    public async end(): Promise<void> {
        const buildInfo = await this.getBuildInfo();
        await this.onExceEnd(buildInfo);
    }

    public abstract onExceBegin(): Promise<void>;
    public abstract onExceEnd(buildInfo: BuildInfo): Promise<void>;
}