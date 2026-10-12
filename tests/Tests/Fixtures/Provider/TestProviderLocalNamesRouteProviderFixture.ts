// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
// One declaration of every kind the provider can declare for itself, named here so each kind is
// asserted by name. The provider class comes first, because the reader reads the file's first class.
const moduleConstant = '/';

function moduleFunction() {}

enum ModuleEnum {
    Home = '/',
}

namespace ModuleNamespace {
    export const home = () => undefined;
}

export class TestProviderLocalNamesRouteProviderFixture {
    getRoutes() {
        const methodConstant = '/';

        function methodFunction() {}

        class MethodClass {}

        return [new Route('/', 'home', TestProviderLocalNamesRouteProviderFixture.handle)];
    }
}

class ModuleClass {}
