import fs from 'fs';
import FeishuHandler from './handler/FeishuHandler';
import Handler from './handler/Handler';
import WechatHandler from './handler/WechatHandler';
import ProcessUtil from './utils/ProcessUtil';


(async () => {


    const robotKey = ProcessUtil.getArg('--robot-key', value => !!value && !value.startsWith('--'));
    if (!robotKey) {
        console.error(`illegal parameter --robot-key`);
        return;
    }
    const robotType = ProcessUtil.getArg('--robot-type', value => ['wechat', 'feishu'].indexOf(value.toLocaleLowerCase()) >= 0);
    if (!robotType) {
        console.error(`illegal parameter --robot-type`);
        return;
    }
    const taskName = ProcessUtil.getArg('--name', value => value && !value.startsWith('--'));
    if (!taskName) {
        console.error(`illegal parameter --name`);
        return;
    }

    const projectDir = ProcessUtil.getArg('--project', fs.existsSync);
    if (!projectDir) {
        console.error(`illegal parameter --project or file not exists`);
        return;
    }

    const customDataArg = ProcessUtil.getArg('--data', value => value && !value.startsWith('--'));

    var handler: Handler;
    switch (robotType.toLocaleLowerCase()) {
        case 'wechat':
            handler = new WechatHandler(robotKey, taskName, projectDir, customDataArg);
            break;
        case 'feishu':
            const headerColor = ProcessUtil.getArg('--header', value => value && !value.startsWith('--'));
            const urlLabel = ProcessUtil.getArg('--url-label', value => value && !value.startsWith('--'));

            handler = new FeishuHandler(robotKey, taskName, projectDir, headerColor, urlLabel, customDataArg);
            break;
        default:
            process.exit(1);
    }


    if (ProcessUtil.haveArg('--begin')) await handler.begin();
    else if (ProcessUtil.haveArg('--end')) await handler.end();
    else console.error(`Command Error! `);

})();