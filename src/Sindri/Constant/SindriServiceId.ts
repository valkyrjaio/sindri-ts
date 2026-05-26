/*
 * This file is part of the Sindri package.
 *
 * (c) Melech Mizrachi <melechmizrachi@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class SindriServiceId {
    static readonly CliRouteAttributeReaderContract = 'Sindri.Ast.Contract.CliRouteAttributeReaderContract' as const;
    static readonly CliRouteParameterReaderContract = 'Sindri.Ast.Contract.CliRouteParameterReaderContract' as const;
    static readonly ComponentProviderReaderContract = 'Sindri.Ast.Contract.ComponentProviderReaderContract' as const;
    static readonly ConfigReaderContract = 'Sindri.Ast.Contract.ConfigReaderContract' as const;
    static readonly HttpRouteAttributeReaderContract = 'Sindri.Ast.Contract.HttpRouteAttributeReaderContract' as const;
    static readonly HttpRouteMiddlewareReaderContract = 'Sindri.Ast.Contract.HttpRouteMiddlewareReaderContract' as const;
    static readonly HttpRouteParameterReaderContract = 'Sindri.Ast.Contract.HttpRouteParameterReaderContract' as const;
    static readonly ListenerAttributeReaderContract = 'Sindri.Ast.Contract.ListenerAttributeReaderContract' as const;
    static readonly ListenerProviderReaderContract = 'Sindri.Ast.Contract.ListenerProviderReaderContract' as const;
    static readonly RouteProviderReaderContract = 'Sindri.Ast.Contract.RouteProviderReaderContract' as const;
    static readonly ServiceProviderReaderContract = 'Sindri.Ast.Contract.ServiceProviderReaderContract' as const;
    static readonly CliDataFileGeneratorContract = 'Sindri.Generator.Cli.Contract.CliDataFileGeneratorContract' as const;
    static readonly ContainerDataFileGeneratorContract = 'Sindri.Generator.Container.Contract.ContainerDataFileGeneratorContract' as const;
    static readonly EventDataFileGeneratorContract = 'Sindri.Generator.Event.Contract.EventDataFileGeneratorContract' as const;
    static readonly HttpDataFileGeneratorContract = 'Sindri.Generator.Http.Contract.HttpDataFileGeneratorContract' as const;
    static readonly GenerateDataFromConfigCommand = 'Sindri.Cli.Command.GenerateDataFromConfigCommand' as const;
}