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

import { ErrorFormatter } from '@valkyrjaio/valkyrja/Cli/Interaction/Formatter/ErrorFormatter.ts';
import { HighlightedTextFormatter } from '@valkyrjaio/valkyrja/Cli/Interaction/Formatter/HighlightedTextFormatter.ts';
import { SuccessFormatter } from '@valkyrjaio/valkyrja/Cli/Interaction/Formatter/SuccessFormatter.ts';
import { WarningFormatter } from '@valkyrjaio/valkyrja/Cli/Interaction/Formatter/WarningFormatter.ts';
import { Header } from '@valkyrjaio/valkyrja/Cli/Interaction/Message/Header.ts';
import { Message } from '@valkyrjaio/valkyrja/Cli/Interaction/Message/Message.ts';
import { NewLine } from '@valkyrjaio/valkyrja/Cli/Interaction/Message/NewLine.ts';

import { CliRouteAttributeReader } from '../../Ast/CliRouteAttributeReader.ts';
import { ComponentProviderReader } from '../../Ast/ComponentProviderReader.ts';
import { ConfigReader } from '../../Ast/ConfigReader.ts';
import { HttpRouteAttributeReader } from '../../Ast/HttpRouteAttributeReader.ts';
import { ListenerAttributeReader } from '../../Ast/ListenerAttributeReader.ts';
import { ListenerProviderReader } from '../../Ast/ListenerProviderReader.ts';
import { RouteProviderReader } from '../../Ast/RouteProviderReader.ts';
import { ServiceProviderReader } from '../../Ast/ServiceProviderReader.ts';
import { AstCliDataFileGenerator } from '../../Generator/Ast/Cli/AstCliDataFileGenerator.ts';
import { AstContainerDataFileGenerator } from '../../Generator/Ast/Container/AstContainerDataFileGenerator.ts';
import { AstEventDataFileGenerator } from '../../Generator/Ast/Event/AstEventDataFileGenerator.ts';
import { AstHttpDataFileGenerator } from '../../Generator/Ast/Http/AstHttpDataFileGenerator.ts';
import { GenerateStatus } from '../../Generator/Enum/GenerateStatus.ts';
import { SindriInfo } from '../../Constant/SindriInfo.ts';

import type { CliDataFileGeneratorContract } from '../../Generator/Cli/Contract/CliDataFileGeneratorContract.ts';
import type { ContainerDataFileGeneratorContract } from '../../Generator/Container/Contract/ContainerDataFileGeneratorContract.ts';
import type { EventDataFileGeneratorContract } from '../../Generator/Event/Contract/EventDataFileGeneratorContract.ts';
import type { HttpDataFileGeneratorContract } from '../../Generator/Http/Contract/HttpDataFileGeneratorContract.ts';
import type { CliRouteAttributeReaderContract } from '../../Ast/Contract/CliRouteAttributeReaderContract.ts';
import type { ComponentProviderReaderContract } from '../../Ast/Contract/ComponentProviderReaderContract.ts';
import type { ConfigReaderContract } from '../../Ast/Contract/ConfigReaderContract.ts';
import type { HttpRouteAttributeReaderContract } from '../../Ast/Contract/HttpRouteAttributeReaderContract.ts';
import type { ListenerAttributeReaderContract } from '../../Ast/Contract/ListenerAttributeReaderContract.ts';
import type { ListenerProviderReaderContract } from '../../Ast/Contract/ListenerProviderReaderContract.ts';
import type { RouteProviderReaderContract } from '../../Ast/Contract/RouteProviderReaderContract.ts';
import type { ServiceProviderReaderContract } from '../../Ast/Contract/ServiceProviderReaderContract.ts';
import { ComponentProviderResult } from '../../Ast/Data/Result/ComponentProviderResult.ts';
import type { ConfigResult } from '../../Ast/Data/Result/ConfigResult.ts';
import type { OutputContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Contract/OutputContract.ts';
import type { OutputFactoryContract } from '@valkyrjaio/valkyrja/Cli/Interaction/Output/Factory/Contract/OutputFactoryContract.ts';
import type { ts } from 'ts-morph';
import type { HttpRouteData } from '../../Ast/Data/HttpRouteData.ts';
import type { RouteContract } from '@valkyrjaio/valkyrja/Cli/Routing/Data/Contract/RouteContract.ts';

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
    protected walkProvider(
        providerClass: string,
        config: ConfigResult,
        visited: Record<string, true>,
    ): ComponentProviderResult {
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

        return this.addMessagesForGenerateStatus(output, status).withAddedMessages(new NewLine()).writeMessages();
    }

    protected generateEventData(
        listenerProviders: readonly string[],
        config: ConfigResult,
        output: OutputContract,
    ): OutputContract {
        output = output
            .withAddedMessages(new Message('Generating Event Data..........................'))
            .writeMessages();

        const allListeners: Record<string, ts.Expression> = {};

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

        return this.addMessagesForGenerateStatus(output, status).withAddedMessages(new NewLine()).writeMessages();
    }

    protected generateCliData(
        cliRouteProviders: readonly string[],
        config: ConfigResult,
        output: OutputContract,
    ): OutputContract {
        output = output
            .withAddedMessages(new Message('Generating Cli Routes Data.....................'))
            .writeMessages();

        const allRoutes: Record<string, ts.Expression> = {};

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

        return this.addMessagesForGenerateStatus(output, status).withAddedMessages(new NewLine()).writeMessages();
    }

    protected generateHttpData(
        httpRouteProviders: readonly string[],
        config: ConfigResult,
        output: OutputContract,
    ): OutputContract {
        output = output
            .withAddedMessages(new Message('Generating Http Routes Data....................'))
            .writeMessages();

        const allRoutes: Record<string, ts.Expression> = {};
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

        return this.addMessagesForGenerateStatus(output, status).withAddedMessages(new NewLine()).writeMessages();
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
