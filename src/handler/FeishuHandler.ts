import RobotFeishu from "../robot/RobotFeishu";
import ProcessUtil from "../utils/ProcessUtil";
import ProcessUtils from "../utils/ProcessUtil";
import Handler, { Block } from "./Handler";


const HEADER_TEMPLATE = ['grey', 'blue', 'wathet', 'turquoise', 'green', 'yellow', 'orange', 'red', 'carmine', 'violet', 'purple', 'indigo'];

export default class FeishuHandler extends Handler {


    constructor(robotKey: string) {
        super(robotKey);


    }

    private blockToElements(customData: Block[]): any[] {
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


    public async onExce(): Promise<void> {
        const content = this.getContent();
        const elements: any[] = []
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
                    })
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
        const data: any = {
            config: { wide_screen_mode: true },
            header: {
                title: { tag: 'plain_text', content: this.getTitle() },
                template: headerColor
            },
            elements
        }

        await RobotFeishu.send(this.robotKey, 'interactive', data);
    }



}
