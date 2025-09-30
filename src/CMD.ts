import fs from 'fs';
import FeishuHandler from './handler/FeishuHandler';
import Handler from './handler/Handler';
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

    var handler: Handler;
    switch (robotType.toLocaleLowerCase()) {
        case 'feishu':
            handler = new FeishuHandler(robotKey);
            break;
        default:
            process.exit(1);
    }


    await handler.exce();

})();