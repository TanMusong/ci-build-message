import RobotFeishu from '../robot/RobotFeishu';
import RobotWechat from '../robot/RobotWechat';
import Handler, { BuildInfo, BUILD_HISTROY_LIMIT } from './Handler';
export default class WechatHandler extends Handler {



    private sendTextMessage(text: string): void {
        const data: any = {
            config: { wide_screen_mode: true },
            header: {
                title: { tag: 'plain_text', content: this.taskName },
                template: 'grey'
            },
            elements: [{ tag: 'markdown', content: text }]
        }
        RobotFeishu.send(this.robotKey, 'interactive', data);
    }


    public async onExceBegin(): Promise<void> {
        this.sendTextMessage(`开始构建`);
    }
    public async onExceEnd(buildInfo: BuildInfo): Promise<void> {

        let message = `${this.taskName}构建完成`;
        const customData = this.getCustomData();
        if (customData && customData.length) {
            customData.forEach(item => {
                message += '\n';
                if (typeof item === 'string') message += item;
                else message += `${item.key}:: **${item.value}**`
            })
        }

        if (buildInfo && buildInfo.logs && buildInfo.logs.length) {
            for (let index = 0, length = Math.min(buildInfo.logs.length, BUILD_HISTROY_LIMIT); index < length; index++) {
                const { name, title } = buildInfo.logs[index];
                if (index !== 0) message += '\n';
                const fixTitle = title.replace(new RegExp('\\#', 'gm'), '\\#').replace(new RegExp('\\*', 'gm'), '\\*');;
                message += `>**${name}** - ${fixTitle}`;
            }
            if (buildInfo.logs.length > BUILD_HISTROY_LIMIT) message += `\n>......`
        }
        RobotWechat.send(this.robotKey, 'markdown', message);
    }

    public async beforeExceSleep(continueUrl: string): Promise<void> { }
    public async afterExceSleep(): Promise<void> { }
}

