import * as program from 'commander';
import * as chalk from 'chalk';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';

interface ConnectQnaArgs extends IQnAService{
    bot: string;
    secret: string;
}

program
    .description('Connect the bot to a QnA knowledgebase')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-n, --name <name>', 'name for the QNA database')
    .option('-k, --kbid <kbid>', 'QnA Knowledgebase Id ')
    .option('--subscriptionKey <subscriptionKey>', 'subscriptionKey for calling the QnA service')
    .action((cmd, actions) => {

    });

program.parse(process.argv);

let args = <ConnectQnaArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {
    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd())
            .then(processConnectQnaArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    } else {
        BotConfig.Load(args.bot)
            .then(processConnectQnaArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    }
}

async function processConnectQnaArgs(config: BotConfig): Promise<BotConfig> {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;

    if (args.secret) {
        config.cryptoPassword = args.secret;
    }

    if (!args.kbid)
        throw new Error("missing kbid");

    if (!args.hasOwnProperty('name'))
        throw new Error("missing name");

    if (!args.subscriptionKey)
        throw new Error('missing subscriptionKey');

    // add the service
    config.connectService(<IQnAService>{
        type: ServiceType.QnA,
        name: args.name,
        id: args.kbid,
        kbid: args.kbid,
        subscriptionKey: args.subscriptionKey
    });

    await config.Save();
    return config;
}
