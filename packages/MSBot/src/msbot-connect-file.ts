/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable:no-console
import { BotConfiguration, FileService, IFileService } from 'botframework-config';
import * as chalk from 'chalk';
import * as program from 'commander';
import * as path from 'path';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    showErrorHelp();
};

interface ConnectFileArgs extends IFileService {
    bot: string;
    secret: string;
}

program
    .name('msbot connect file <path>')
    .description('Connect a file to the bot')
    .option('-b, --bot <path>', 'path to bot file.  If omitted, local folder will look for a .bot file')
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .action((filePath, actions) => {
        if (filePath)
            actions.filePath = filePath;
    });

let args = <ConnectFileArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {
    if (!args.bot) {
        BotConfiguration.loadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectFile)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    } else {
        BotConfiguration.load(args.bot, args.secret)
            .then(processConnectFile)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    }
}

async function processConnectFile(config: BotConfiguration): Promise<BotConfiguration> {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;

    if (!args.hasOwnProperty('filePath'))
        throw new Error('Bad or missing file');

    // add the service
    let newService = new FileService({
        name: path.basename(args.path),
        path: args.path
    } as IFileService);
    let id = config.connectService(newService);
    await config.save(args.secret);
    process.stdout.write(JSON.stringify(config.findService(id), null, 2));
    return config;
}

function showErrorHelp()
{
    program.outputHelp((str) => {
        console.error(str);
        return '';
    });
    process.exit(1);
}