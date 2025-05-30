# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [6.0.2](../../tags/v6.0.2) - 2025-05-24
### Changed
- Fixed path to templates

## [6.0.1](../../tags/v6.0.1) - 2025-05-19
### Changed
- Fixed expecting refresh_token in temporary credentials

## [6.0.0](../../tags/v6.0.0) - 2025-05-18
__(BREAKING) Dropped support for NodeJS 18 (EOL). Minimum required version is now NodeJS 20.__

### Changed
- Migrated to NodeJS 20.19
- Migrated to ESLint V9 flat configs
- Updated dependencies

## [5.0.1](../../tags/v5.0.1) - 2024-03-20
### Changed
- Update dependencies

## [5.0.0](../../tags/v5.0.0) - 2024-03-16
### Changed
- Update eslint config and raise minimum supported NodeJS version to match one in typescript-eslint plugin
- Update .npmignore
- Unify jest.config.js by removing redundant patterns and providing support for both ts and tsx

## [4.0.6](../../tags/v4.0.6) - 2024-02-01
### Changed
- Fix README.md

## [4.0.5](../../tags/v4.0.5) - 2024-02-01
### Changed
- Fix README.md

## [4.0.4](../../tags/v4.0.4) - 2024-01-31
### Changed
- Migrate to GitHub

## [4.0.3](../../tags/v4.0.3) - 2024-01-29
### Changed
- Explicitly specify ignores from .gitignore in .eslintrc.js

## [4.0.2](../../tags/v4.0.2) - 2024-01-19
### Changed
- Update `@anmiles/google-api-wrapper`

## [4.0.1](../../tags/v4.0.1) - 2024-01-16
### Changed
- Speed-up tests by isolating modules

## [4.0.0](../../tags/v4.0.0) - 2024-01-16
### Changed
- Update project configurations
- Update dependencies

## [3.1.1](../../tags/v3.1.1) - 2023-11-12
### Changed
- Update dependencies

## [3.1.0](../../tags/v3.1.0) - 2023-10-26
### Changed
- Small visual improvements for auth page

## [3.0.0](../../tags/v3.0.0) - 2023-09-12
### Changed
- Move jest extensions to a separate package
- Update dependencies (breaking)

## [2.1.4](../../tags/v2.1.4) - 2023-08-06
### Changed
- Update `@anmiles/google-api-wrapper` and use `filterProfiles`

## [2.1.3](../../tags/v2.1.3) - 2023-06-11
### Changed
- Update `@anmiles/google-api-wrapper`

## [2.1.2](../../tags/v5.1.1) - 2023-06-01
### Changed
- Update `@anmiles/google-api-wrapper`

## [2.1.1](../../tags/v2.1.1) - 2023-05-31
### Added
- New jest matcher to expect function
### Changed
- Update `@anmiles/google-api-wrapper` with breaking change

## [2.1.0](../../tags/v2.1.0) - 2023-05-26
### Changed
- Update `@anmiles/google-api-wrapper` in order to queue authentication in case of concurrent applications

## [2.0.0](../../tags/v2.0.0) - 2023-05-15
### Changed
- Update `@anmiles/logger` with breaking change (removing timestamps for colored logs)

## [1.1.6](../../tags/v1.1.6) - 2023-05-08
### Changed
- Fixed tests

## [1.0.2](../../tags/v1.0.2) - 2023-05-08
### Changed
- Use shared eslint config
- Update package info
- Use `@anmiles/logger` instead of old built-in logger

## [1.0.1](../../tags/v1.0.1) - 2023-03-20
### Changed
- Upgraded `@anmiles/google-api-wrapper` to v6.0.0

## [1.0.0](../../tags/v1.0.0) - 2023-03-12
### Added
- Initial commit
