# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2026-04-21

### Added
- Added status badges to "Target Endpoints" list for better delivery visibility.
- Added quick "Resend" action directly to individual delivery attempts and target endpoints.
- Added descriptive empty state message when no target endpoints match a message's filters.

### Changed
- Renamed "Destinations" to "Target Endpoints" throughout the application for better clarity and consistency with Svix terminology.

## [1.0.1] - 2026-04-14

### Added
- Added support for Message Producers.
- Added screenshots to documentation.
- Automatic version loading from `package.json` into the UI.
- Change history (`CHANGELOG.md`).

### Changed
- Optimized message polling and data loading in `SvixAdmin`.
- Improved API resilience, state management, and documentation.
- Streamlined UI: added timestamps to delivery attempts, improved event filters.
- User-friendly menu (close on double-click).
- Security: Docker ports are now bound to localhost.

### Fixed
- Fixed message count display when total amount is unknown.
- Fixed Docker configuration errors and missing files.
- Resolved dependency conflicts in Docker build.

## [1.0.0] - 2026-04-14
- Initial release of Svix Admin UI.
