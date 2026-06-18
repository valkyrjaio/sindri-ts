<p align="center"><a href="https://valkyrja.io" target="_blank">
    <img src="https://raw.githubusercontent.com/valkyrjaio/art/refs/heads/master/long-banner/orange/typescript.png" width="100%">
</a></p>

# Sindri

[Sindri][github sindri] is the build tool for the [Valkyrja][Valkyrja url]
TypeScript framework.

Sindri reads your TypeScript source and generates pre-computed data files for
faster runtime performance, handling build-time concerns across the Valkyrja
ecosystem. Named after the dwarven smith in Norse mythology who forged
Mjölnir and other divine artifacts, Sindri does for your Valkyrja app what
his namesake did for the gods: crafts the artifacts that make it all work
faster and better.

<p>
    <a href="https://www.npmjs.com/package/@valkyrjaio/sindri"><img src="https://img.shields.io/npm/v/@valkyrjaio/sindri.svg" alt="Latest Version on npm"></a>
    <a href="https://www.npmjs.com/package/@valkyrjaio/sindri"><img src="https://img.shields.io/node/v/@valkyrjaio/sindri.svg" alt="Supported Node.js Version"></a>
    <a href="https://www.npmjs.com/package/@valkyrjaio/sindri"><img src="https://img.shields.io/npm/l/@valkyrjaio/sindri.svg" alt="License"></a>
    <a href="https://github.com/valkyrjaio/sindri-ts/actions/workflows/ci.yml?query=branch%3A26.x"><img src="https://github.com/valkyrjaio/sindri-ts/actions/workflows/ci.yml/badge.svg?branch=26.x" alt="CI Status"></a>
</p>

## What Sindri Does

- **Generates data files** — reads your TypeScript source and produces
  pre-computed container, routing, and event data files so your application
  skips discovery work at runtime
- **Optimizes runtime performance** — the generated data lets Valkyrja boot
  without reflecting over providers and configuration on every invocation
- **Handles build-time concerns** — centralizes the code-generation steps
  across the Valkyrja ecosystem

## Installation

### Via npm

Add Sindri to an existing Valkyrja project as a dev dependency:

```
npm install --save-dev @valkyrjaio/sindri
```

## Getting Started

### Generating Data Files

Once your application's providers and configuration are in place, generate the
pre-computed data files:

```
npx sindri data:generate
```

Run `npx sindri` with no command to see usage and the list of available
commands.

## Documentation

Full Sindri [documentation][docs url] is available on the Valkyrja website.

For framework-level questions about Valkyrja itself, see the
[Valkyrja framework repository][framework url].

## Versioning and Release Process

Sindri follows [semantic versioning][semantic versioning url] with a major
release every year, and support for each major version for 2 years from the
date of release.

For more information see our
[Versioning and Release Process documentation][Versioning and Release Process url].

### Supported Versions

Bug fixes are provided until 3 months after the next major release. Security
fixes are provided for 2 years after the initial release.

| Version | Node | Release        | Bug Fixes Until | Security Fixes Until |
| :------ | :--- | :------------- | :-------------- | :------------------- |
| 26      | 22+  | March 31, 2026 | Q2 2027         | Q1 2028              |

## Contributing

Sindri is an open-source, community-driven project. Thank you for your
interest in helping develop, maintain, and release it.

See [`CONTRIBUTING.md`][contributing url] for the submission process and
[`VOCABULARY.md`][vocabulary url] for the terminology used across Valkyrja.

## Security Issues

If you discover a security vulnerability within Sindri, please follow our
[disclosure procedure][security vulnerabilities url].

## License

Sindri is open-source software licensed under the
[MIT license][MIT license url]. See [`LICENSE.md`](./LICENSE.md).

[Valkyrja url]: https://valkyrja.io
[framework url]: https://github.com/valkyrjaio/valkyrja-ts
[github sindri]: https://github.com/valkyrjaio/sindri-ts
[docs url]: https://valkyrja.io
[Versioning and Release Process url]: https://github.com/valkyrjaio/.github/blob/master/VERSIONING_AND_RELEASE_PROCESS.md
[contributing url]: https://github.com/valkyrjaio/.github/blob/master/CONTRIBUTING.md
[vocabulary url]: https://github.com/valkyrjaio/.github/blob/master/VOCABULARY.md
[security vulnerabilities url]: https://github.com/valkyrjaio/.github/blob/master/SECURITY.md
[semantic versioning url]: https://semver.org/
[MIT license url]: https://opensource.org/licenses/MIT
[license url]: ./LICENSE.md
