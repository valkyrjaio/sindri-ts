/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Argument } from '@valkyrjaio/valkyrja/Cli/Interaction/Argument/Argument.ts';
import { CliInteractionConfig } from '@valkyrjaio/valkyrja/Cli/Interaction/Data/CliInteractionConfig.ts';
import { OutputFactory } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Factory/OutputFactory.ts';
import { ArgumentParameter } from '@valkyrjaio/valkyrja/Cli/Routing/Data/ArgumentParameter.ts';
import { Route } from '@valkyrjaio/valkyrja/Cli/Routing/Data/Route.ts';

import { GenerateDataFromConfigCommand } from '../src/Sindri/Cli/Command/GenerateDataFromConfigCommand.ts';
import { CommandName } from '../src/Sindri/Constant/CommandName.ts';

import type { OutputContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Contract/OutputContract.ts';

const [subcommand, configPath] = process.argv.slice(2);

if (subcommand !== 'generate' || configPath === undefined || configPath === '') {
    process.stdout.write('Usage: sindri generate <path-to-Config.ts>\n');
    process.exit(1);
}

const route = new Route(
    CommandName.DATA_GENERATE,
    'Generate component data from a config',
    (): OutputContract => new OutputFactory().createOutput(),
).withArguments(
    new ArgumentParameter('config', 'Path to the application Config').withArguments(new Argument(configPath)),
);

new GenerateDataFromConfigCommand(route, new OutputFactory(new CliInteractionConfig())).run();
