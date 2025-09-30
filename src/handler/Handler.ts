import ProcessUtil from "../utils/ProcessUtil";


export type Block = (string | { key: string; value: string; });
export type Markdown = string;
export type Button = { label: string, url: string };
export type Note = string;

export type Content = (
    { type: 'blocks', data: Block[] }
    | { type: 'markdown', data: Markdown }
    | { type: 'button', data: Button }
    | { type: 'note', data: Note }
)[];

export default abstract class Handler {


    constructor(
        protected readonly robotKey: string,
    ) {

    }

    protected getTitle(): string {
        const title = ProcessUtil.getArg('--title', value => value && !value.startsWith('--'));
        return title;
    }


    protected getColor(): string {
        const color = ProcessUtil.getArg('--color', value => value && !value.startsWith('--'));
        return color;
    }


    protected getContent(): Content {

        const content: Content = [];

        for (let i = 0, length = process.argv.length; i < length; i++) {
            const key = process.argv[i];
            switch (key) {
                case '--md':
                    {
                        const data = process.argv[i + 1];
                        content.push({ type: 'markdown', data });
                        i++;//skip data item
                    }
                    break;
                case '--blocks':
                    {
                        const data = process.argv[i + 1];
                        const blockArgs = data.split(';');
                        if (!blockArgs) break;
                        const blocks: Block[] = [];
                        blockArgs.forEach(item => {
                            if (!item || !item.length) return;
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
                        i++;//skip data item
                    }
                    break;
                case '--button':
                    {
                        const data = process.argv[i + 1];
                        const blockArgs = data.split(';');
                        if (blockArgs.length === 2) {
                            const button: Button = { label: blockArgs[0], url: blockArgs[1] };
                            content.push({ type: 'button', data: button });
                            i++;//skip data item
                        }
                    }
                    break;
                case '--note':
                    {
                        const data = process.argv[i + 1];
                        content.push({ type: 'note', data });
                        i++;//skip data item
                    }
                    break;
                default:
                    break;
            }
        }
        return content;
    }

    public async exce(): Promise<void> {
        await this.onExce();
    }

    protected abstract onExce(): Promise<void>;
}