// Fixture parsed by ts-morph (never executed).
/* eslint-disable */
// @ts-nocheck
import { AppServiceProviderFixture } from './AppServiceProviderFixture.ts';
import { AppListenerProviderFixture } from './AppListenerProviderFixture.ts';
import { AppCliRouteProviderFixture } from './AppCliRouteProviderFixture.ts';
import { AppHttpRouteProviderFixture } from './AppHttpRouteProviderFixture.ts';

export class AppComponentProviderFixture {
    getComponentProviders() {
        return [];
    }
    getContainerProviders() {
        return [AppServiceProviderFixture];
    }
    getEventProviders() {
        return [AppListenerProviderFixture];
    }
    getCliProviders() {
        return [AppCliRouteProviderFixture];
    }
    getHttpProviders() {
        return [AppHttpRouteProviderFixture];
    }
}
