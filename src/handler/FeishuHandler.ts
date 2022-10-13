import RobotFeishu from "../robot/RobotFeishu";
import ProcessUtils from "../utils/ProcessUtil";
import Handler, { BuildInfo, BUILD_HISTROY_LIMIT } from "./Handler";


const HEAD_TEMPLATE = ['blue', 'wathet', 'turquoise', 'green', 'yellow', 'orange', 'red', 'carmine', 'violet', 'purple', 'indigo', 'grey'];

export default class FeishuHandler extends Handler {

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

    public async onExceBegin(): Promise<void> {
        const customData = this.getCustomData();
        if (customData && customData.length) {
            const data: any = {
                config: { wide_screen_mode: true },
                header: {
                    title: { tag: 'plain_text', content: `${this.taskName} 开始构建` },
                    template: 'grey'
                },
                elements: []
            }
            const fields: any[] = [];
            customData.forEach(item => {
                if (typeof item === 'string')
                    fields.push({ is_short: false, text: { tag: 'lark_md', content: item } })
                else
                    fields.push({ is_short: true, text: { tag: 'lark_md', content: `${item.key}: **${item.value}**` } })
            })
            data.elements.push({ tag: 'div', fields });
            RobotFeishu.send(this.robotKey, 'interactive', data);
        } else {
            RobotFeishu.send(this.robotKey, 'text', { text: `${this.taskName} 开始构建` })
        }
    }

    public async onExceEnd(buildInfo: BuildInfo): Promise<void> {

        const data: any = {
            config: { wide_screen_mode: true },
            header: {
                title: { tag: 'plain_text', content: `${this.taskName} 构建完成` },
                template: 'grey'
            },
            elements: []
        }

        const customData = this.getCustomData();
        if (customData && customData.length) {
            data.elements.length && data.elements.push({ tag: 'hr' });
            const fields: any[] = [];
            customData.forEach(item => {
                if (typeof item === 'string')
                    fields.push({ is_short: false, text: { tag: 'lark_md', content: item } })
                else
                    fields.push({ is_short: true, text: { tag: 'lark_md', content: `${item.key}: **${item.value}**` } })
            })
            data.elements.push({ tag: 'div', fields });
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

    public async beforeExceSleep(continueUrl: string): Promise<void> {
        const data: any = {
            config: { wide_screen_mode: true },
            header: {
                title: { tag: 'plain_text', content: `${this.taskName} 构建暂停` },
                template: 'grey'
            },
            elements: []
        }
        const customData = this.getCustomData();
        if (customData && customData.length) {
            data.elements.length && data.elements.push({ tag: 'hr' });
            const fields: any[] = [];
            customData.forEach(item => {
                if (typeof item === 'string')
                    fields.push({ is_short: false, text: { tag: 'lark_md', content: item } })
                else
                    fields.push({ is_short: true, text: { tag: 'lark_md', content: `${item.key}: **${item.value}**` } })
            })
            data.elements.push({ tag: 'div', fields });
        }
        data.elements.push({
            tag: 'div', text: { tag: 'lark_md', content: '' },
            extra: { tag: 'button', text: { tag: 'lark_md', content: '继续构建' }, type: 'primary', url: continueUrl }
        })
        RobotFeishu.send(this.robotKey, 'interactive', data);
    }

    public async afterExceSleep(): Promise<void> {
        await RobotFeishu.send(this.robotKey, 'text', { text: `${this.taskName} 构建恢复` })
    }


    private timeFormat(time: number): string {
        let ms = time;

        let s = Math.floor(time / 1000)
        if (s <= 0) return `${ms}毫秒`;
        ms -= s * 1000;

        const min = Math.floor(s / 60);
        if (min <= 0) return `${s}秒 ${ms}毫秒`;
        s -= min * 60;

        return `${min}分 ${s}秒 ${ms}毫秒`;
    }
}
