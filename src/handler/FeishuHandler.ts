import RobotFeishu from "../robot/RobotFeishu";
import ProcessUtils from "../utils/ProcessUtil";
import Handler, { BuildInfo, BUILD_HISTROY_LIMIT, CustomData } from "./Handler";


const HEADER_TEMPLATE = ['grey', 'blue', 'wathet', 'turquoise', 'green', 'yellow', 'orange', 'red', 'carmine', 'violet', 'purple', 'indigo'];

export default class FeishuHandler extends Handler {

    private readonly headerColor: string;

    constructor(robotKey: string, taskName: string, projectDir: string, headerColor?: string, data?: string) {
        super(robotKey, taskName, projectDir, data);
        this.headerColor = headerColor && HEADER_TEMPLATE.includes(headerColor) ? headerColor : HEADER_TEMPLATE[0];
    }

    private gitHistroyToMD(logs: { name: string; title: string; }[]): string {
        let logString: string = '';
        for (let index = 0, length = Math.min(logs.length, BUILD_HISTROY_LIMIT); index < length; index++) {
            const { name, title } = logs[index];
            if (index !== 0) logString += '\n';
            const fixTitle = title.replace(new RegExp('\\#', 'gm'), '\\#').replace(new RegExp('\\*', 'gm'), '\\*');;
            logString += `**${name}** - ${fixTitle}`;
        }
        if (logs.length > BUILD_HISTROY_LIMIT) {
            logString += '\n'
            logString += `......`
        }
        return logString;
    }

    private customDataToElements(customData: CustomData[]): any[] {
        const elements: any[] = []
        let fields: any[] = [];
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
                        fields.push({ is_short: true, text: { tag: 'lark_md', content: item } })
                        break;
                    default:
                        fields.push({ is_short: false, text: { tag: 'lark_md', content: item } })
                        break;
                }
            } else {
                const content = `${item.key}: **${item.value}**`
                fields.push({ is_short: true, text: { tag: 'lark_md', content } })
            }
        })
        elements.push({ tag: 'div', fields });

        return elements;
    }

    public async onExceBegin(): Promise<void> {
        const customData = this.getCustomData();
        if (!customData || !customData.length) {
            RobotFeishu.send(this.robotKey, 'text', { text: `${this.taskName} 开始构建` })
            return;
        }
        const data: any = {
            config: { wide_screen_mode: true },
            header: {
                title: { tag: 'plain_text', content: `${this.taskName} 开始构建` },
                template: this.headerColor
            },
            elements: this.customDataToElements(customData)
        }

        RobotFeishu.send(this.robotKey, 'interactive', data);
    }

    public async onExceEnd(buildInfo: BuildInfo): Promise<void> {
        const customData = this.getCustomData();
        const data: any = {
            config: { wide_screen_mode: true },
            header: {
                title: { tag: 'plain_text', content: `${this.taskName} 构建完成` },
                template: this.headerColor
            },
            elements: this.customDataToElements(customData)
        }
        if (buildInfo && buildInfo.logs && buildInfo.logs.length) {
            data.elements.length && data.elements.push({ tag: 'hr' });
            const gitHistroyString = this.gitHistroyToMD(buildInfo.logs)
            data.elements.push({ tag: 'markdown', content: gitHistroyString });
        }

        const url = ProcessUtils.getArg('--url', value => value && value.startsWith('http'));
        if (url) {
            data.elements.push({
                tag: 'div', text: { tag: 'lark_md', content: '' },
                extra: { tag: 'button', text: { tag: 'lark_md', content: '查看/下载' }, type: 'primary', url }
            })
        }

        if (buildInfo) {
            data.elements.push({ tag: 'note', elements: [{ tag: 'plain_text', content: `构建耗时: ${this.timeFormat(buildInfo.time)}` }] });
        }
        RobotFeishu.send(this.robotKey, 'interactive', data);
    }


    private timeFormat(time: number): string {
        let ms = time;

        let s = Math.floor(time / 1000)
        if (s <= 0) return `${ms}毫秒`;
        ms -= s * 1000;

        const min = Math.floor(s / 60);
        if (min <= 0) return `${s}秒`;
        s -= min * 60;

        return `${min}分 ${s}秒`;
    }
}
