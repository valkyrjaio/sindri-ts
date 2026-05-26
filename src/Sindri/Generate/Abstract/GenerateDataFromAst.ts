/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as fs from 'fs';
import * as path from 'path';

import { ErrorFormatter } from '@valkyrja/valkyrja/Cli/Interaction/Formatter/ErrorFormatter.js';
import { HighlightedTextFormatter } from '@valkyrja/valkyrja/Cli/Interaction/Formatter/HighlightedTextFormatter.js';
import { SuccessFormatter } from '@valkyrja/valkyrja/Cli/Interaction/Formatter/SuccessFormatter.js';
import { WarningFormatter } from '@valkyrja/valkyrja/Cli/Interaction/Formatter/WarningFormatter.js';
import { Header } from '@valkyrja/valkyrja/Cli/Interaction/Message/Header.js';
import { Message } from '@valkyrja/valkyrja/Cli/Interaction/Message/Message.js';
import { NewLine } from '@valkyrja/valkyrja/Cli/Interaction/Message/NewLine.js';

import { CliRouteAttributeReader } from '../../Ast/CliRouteAttributeReader.js';
import { ComponentProviderReader } from '../../Ast/ComponentProviderReader.js';
import { ConfigReader } from '../../Ast/ConfigReader.js';
import { HttpRouteAttributeReader } from '../../Ast/HttpRouteAttributeReader.js';
import { ListenerAttributeReader } from '../../Ast/ListenerAttributeReader.js';
import { ListenerProviderReader } from '../../Ast/ListenerProviderReader.js';
import { RouteProviderReader } from '../../Ast/RouteProviderReader.js';
import { ServiceProviderReader } from '../../Ast/ServiceProviderReader.js';
import { AstCliDataFileGenerator } from '../../Generator/Ast/Cli/AstCliDataFileGenerator.js';
import { AstContainerDataFileGenerator } from '../../Generator/Ast/Container/AstContainerDataFileGenerator.js';
import { AstEventDataFileGenerator } from '../../Generator/Ast/Event/AstEventDataFileGenerator.js';
import { AstHttpDataFileGenerator } from '../../Generator/Ast/Http/AstHttpDataFileGenerator.js';
import { GenerateStatus } from '../../Generator/Enum/GenerateStatus.js';
import { SindriInfo } from '../../Constant/SindriInfo.js';

import type { CliDataFileGeneratorContract } from '../../Generator/Cli/Contract/CliDataFileGeneratorContract.js';
import type { ContainerDataFileGeneratorContract } from '../../Generator/Container/Contract/ContainerDataFileGeneratorContract.js';
import type { EventDataFileGeneratorContract } from '../../Generator/Event/Contract/EventDataFileGeneratorContract.js';
import type { HttpDataFileGeneratorContract } from '../../Generator/Http/Contract/HttpDataFileGeneratorContract.js';
import type { CliRouteAttributeReaderContract } from '../../Ast/Contract/CliRouteAttributeReaderContract.js';
import type { ComponentProviderReaderContract } from '../../Ast/Contract/ComponentProviderReaderContract.js';
import type { ConfigReaderContract } from '../../Ast/Contract/ConfigReaderContract.js';
import type { HttpRouteAttributeReaderContract } from '../../Ast/Contract/HttpRouteAttributeReaderContract.js';
import type { ListenerAttributeReaderContract } from '../../Ast/Contract/ListenerAttributeReaderContract.js';
import type { ListenerProviderReaderContract } from '../../Ast/Contract/ListenerProviderReaderContract.js';
import type { RouteProviderReaderContract } from '../../Ast/Contract/RouteProviderReaderContract.js';
import type { ServiceProviderReaderContract } from '../../Ast/Contract/ServiceProviderReaderContract.js';
import { ComponentProviderResult } from '../../Ast/Data/Result/ComponentProviderResult.js';
import type { ConfigResult } from '../../Ast/Data/Result/ConfigResult.js';
import type { OutputContract } from '@valkyrja/valkyrja/Cli/Interaction/Output/Contract/OutputContract.js';
import type { OutputFactoryContract } from '@valkyrja/valkyrja/Cli/Interaction/Output/Factory/Contract/OutputFactoryContract.js';
import type { Expression } from 'typescript';
import type { HttpRouteData } from '../../Ast/Data/HttpRouteData.js';
import type { RouteContract } from '@valkyrja/valkyrja/Cli/Routing/Data/Contract/RouteContract.js';

export abstract class GenerateDataFromAst {
    public constructor(
        protected readonly outputFactory: OutputFactoryContract,
        protected readonly route: RouteContract,
        protected readonly title: string = 'Generating Data',
        protected readonly configReader: ConfigReaderContract = new ConfigReader(),
        protected readonly componentProviderReader: ComponentProviderReaderContract = new ComponentProviderReader(),
        protected readonly routeProviderReader: RouteProviderReaderContract = new RouteProviderReader(),
        protected readonly listenerProviderReader: ListenerProviderReaderContract = new ListenerProviderReader(),
        protected readonly serviceProviderReader: ServiceProviderReaderContract = new ServiceProviderReader(),
        protected readonly cliRouteAttributeReader: CliRouteAttributeReaderContract = new CliRouteAttributeReader(),
        protected readonly httpRouteAttributeReader: HttpRouteAttributeReaderContract = new HttpRouteAttributeReader(),
        protected readonly listenerAttributeReader: ListenerAttributeReaderContract = new ListenerAttributeReader(),
        protected readonly containerGenerator: ContainerDataFileGeneratorContract = new AstContainerDataFileGenerator(),
        protected readonly eventGenerator: EventDataFileGeneratorContract = new AstEventDataFileGenerator(),
        protected readonly cliGenerator: CliDataFileGeneratorContract = new AstCliDataFileGenerator(),
        protected readonly httpGenerator: HttpDataFileGeneratorContract = new AstHttpDataFileGenerator(),
    ) {}

    protected generateData(): OutputContract {
        let output = this.getOutput();
        const config = this.configReader.readFile(this.getConfigFilePath());

        const providers = this.walkComponentProviders(config);

        output = this.generateContainerData(providers.serviceProviders, config, output);
        output = this.generateEventData(providers.listenerProviders, config, output);
        output = this.generateCliData(providers.cliRouteProviders, config, output);
        output = this.generateHttpData(providers.httpRouteProviders, config, output);

        return output.withAddedMessages(new NewLine());
    }

    protected getOutput(): OutputContract {
        return this.outputFactory
            .createOutput()
            .withAddedMessages(
                new Header('Sindri', SindriInfo.VERSION, this.route, SindriInfo.ICON),
                new NewLine(),
                new NewLine(),
                new Message(`${this.title}:`, new HighlightedTextFormatter()),
                new NewLine(),
                new NewLine(),
            )
            .writeMessages();
    }

    /**
     * Walk the component provider tree and collect all provider class lists.
     *
     * Each entry in config.providers is fully expanded before moving to the
     * next, so the declaration order in the config controls the order providers
     * appear in the result. Already-visited classes are skipped to prevent loops.
     */
    protected walkComponentProviders(config: ConfigResult): ComponentProviderResult {
        let result = new ComponentProviderResult();
        const visited: Record<string, true> = {};

        for (const providerClass of config.providers) {
            result = result.merge(this.walkProvider(providerClass, config, visited));
        }

        return result;
    }

    /**
     * Recursively expand a single component provider.
     *
     * Sub-components are expanded inline in the order they are declared, then
     * the current provider's own lists are appended. The caller controls load
     * order entirely through the config — this method imposes no additional rules.
     */
    protected walkProvider(providerClass: string, config: ConfigResult, visited: Record<string, true>): ComponentProviderResult {
        if (visited[providerClass] === true) {
            return new ComponentProviderResult();
        }

        visited[providerClass] = true;

        const filePath = this.fqnToFilePath(providerClass, config.namespace, config.dir);

        if (filePath === '' || !fs.existsSync(filePath)) {
            return new ComponentProviderResult();
        }

        const providerResult = this.componentProviderReader.readFile(filePath);

        let aggregated = new ComponentProviderResult();

        for (const subProvider of providerResult.componentProviders) {
            aggregated = aggregated.merge(this.walkProvider(subProvider, config, visited));
        }

        return aggregated.merge(providerResult);
    }

    /**
     * Derive a file path from a class name or module specifier.
     *
     * For relative/absolute paths, resolves from srcDir.
     * For short class names, searches srcDir recursively for a matching .ts file.
     */
    protected fqnToFilePath(className: string, namespace: string, srcDir: string): string {
        if (className.startsWith('./') || className.startsWith('../')) {
            const resolved = path.resolve(srcDir, className.replace(/\.js$/, '.ts'));
            return fs.existsSync(resolved) ? resolved : '';
        }

        if (path.isAbsolute(className)) {
            return fs.existsSync(className) ? className : '';
        }

        return this.findFileInDir(className, srcDir);
    }

    /**
     * Recursively search srcDir for a TypeScript file whose basename matches className.
     */
    protected findFileInDir(className: string, dir: string): string {
        if (!fs.existsSync(dir)) {
            return '';
        }

        let entries: fs.Dirent[];

        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return '';
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const found = this.findFileInDir(className, fullPath);

                if (found !== '') {
                    return found;
                }
            } else if (entry.isFile() && entry.name === `${className}.ts`) {
                return fullPath;
            }
        }

        return '';
    }

    protected generateContainerData(
        serviceProviders: readonly string[],
        config: ConfigResult,
        output: OutputContract,
    ): OutputContract {
        output = output
            .withAddedMessages(new Message('Generating Container Data......................'))
            .writeMessages();

        const publishers: Record<string, readonly [string, string]> = {};

        for (const providerClass of serviceProviders) {
            const filePath = this.fqnToFilePath(providerClass, config.namespace, config.dir);

            if (filePath === '' || !fs.existsSync(filePath)) {
                continue;
            }

            const result = this.serviceProviderReader.readFile(filePath);

            Object.assign(publishers, result.publishers);
        }

        const status = this.containerGenerator.generateFile(
            config.dataPath,
            'AppContainerData',
            config.dataNamespace,
            publishers,
        );

        return this.addMessagesForGenerateStatus(output, status)
            .withAddedMessages(new NewLine())
            .writeMessages();
    }

    protected generateEventData(
        listenerProviders: readonly string[],
        config: ConfigResult,
        output: OutputContract,
    ): OutputContract {
        output = output
            .withAddedMessages(new Message('Generating Event Data..........................'))
            .writeMessages();

        const allListeners: Record<string, Expression> = {};

        for (const providerClass of listenerProviders) {
            const filePath = this.fqnToFilePath(providerClass, config.namespace, config.dir);

            if (filePath === '' || !fs.existsSync(filePath)) {
                continue;
            }

            const providerResult = this.listenerProviderReader.readFile(filePath);

            for (const listenerClass of providerResult.listenerClasses) {
                const listenerPath = this.fqnToFilePath(listenerClass, config.namespace, config.dir);

                if (listenerPath === '' || !fs.existsSync(listenerPath)) {
                    continue;
                }

                const attrResult = this.listenerAttributeReader.readFile(listenerPath);

                Object.assign(allListeners, attrResult.listeners);
            }
        }

        const status = this.eventGenerator.generateFile(
            config.dataPath,
            'AppEventData',
            config.dataNamespace,
            allListeners,
        );

        return this.addMessagesForGenerateStatus(output, status)
            .withAddedMessages(new NewLine())
            .writeMessages();
    }

    protected generateCliData(
        cliRouteProviders: readonly string[],
        config: ConfigResult,
        output: OutputContract,
    ): OutputContract {
        output = output
            .withAddedMessages(new Message('Generating Cli Routes Data.....................'))
            .writeMessages();

        const allRoutes: Record<string, Expression> = {};

        for (const providerClass of cliRouteProviders) {
            const filePath = this.fqnToFilePath(providerClass, config.namespace, config.dir);

            if (filePath === '' || !fs.existsSync(filePath)) {
                continue;
            }

            const providerResult = this.routeProviderReader.readFile(filePath);

            for (const controllerClass of providerResult.controllerClasses) {
                const controllerPath = this.fqnToFilePath(controllerClass, config.namespace, config.dir);

                if (controllerPath === '' || !fs.existsSync(controllerPath)) {
                    continue;
                }

                const attrResult = this.cliRouteAttributeReader.readFile(controllerPath);

                Object.assign(allRoutes, attrResult.routes);
            }
        }

        const status = this.cliGenerator.generateFile(
            config.dataPath,
            'AppCliRoutingData',
            config.dataNamespace,
            allRoutes,
        );

        return this.addMessagesForGenerateStatus(output, status)
            .withAddedMessages(new NewLine())
            .writeMessages();
    }

    protected generateHttpData(
        httpRouteProviders: readonly string[],
        config: ConfigResult,
        output: OutputContract,
    ): OutputContract {
        output = output
            .withAddedMessages(new Message('Generating Http Routes Data....................'))
            .writeMessages();

        const allRoutes: Record<string, Expression> = {};
        const allRouteData: Record<string, HttpRouteData> = {};

        for (const providerClass of httpRouteProviders) {
            const filePath = this.fqnToFilePath(providerClass, config.namespace, config.dir);

            if (filePath === '' || !fs.existsSync(filePath)) {
                continue;
            }

            const providerResult = this.routeProviderReader.readFile(filePath);

            for (const controllerClass of providerResult.controllerClasses) {
                const controllerPath = this.fqnToFilePath(controllerClass, config.namespace, config.dir);

                if (controllerPath === '' || !fs.existsSync(controllerPath)) {
                    continue;
                }

                const attrResult = this.httpRouteAttributeReader.readFile(controllerPath);

                Object.assign(allRoutes, attrResult.routes);
                Object.assign(allRouteData, attrResult.routeData);
            }
        }

        const status = this.httpGenerator.generateFile(
            config.dataPath,
            'AppHttpRoutingData',
            config.dataNamespace,
            allRoutes,
            allRouteData,
        );

        return this.addMessagesForGenerateStatus(output, status)
            .withAddedMessages(new NewLine())
            .writeMessages();
    }

    protected addMessagesForGenerateStatus(output: OutputContract, status: GenerateStatus): OutputContract {
        let text = 'Failed';
        let formatter = new ErrorFormatter();

        if (status === GenerateStatus.SUCCESS) {
            text = 'Success';
            formatter = new SuccessFormatter();
        }

        if (status === GenerateStatus.SKIPPED) {
            text = 'Skipped';
            formatter = new WarningFormatter();
        }

        return output.withAddedMessages(new Message(text, formatter), new NewLine());
    }

    protected abstract getConfigFilePath(): string;
}