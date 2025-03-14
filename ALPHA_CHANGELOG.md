# Changelog

All notable changes to the alphas of this project will be documented in this
file.

The format is (mostly) based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This differs from CHANGELOG.md because it adds changes on every alpha. All
changes are experimental and may be or not in the final version.

## [4000.0.0-alpha.17] - TBD

### Added

- `obj.onTag` and `obj.onUnTag` - @mflerackers
- Added jsdoc to shader, area and follow properties - @ErikGXDev (**C**)
- Added `KAPLAYOpt.inspectOnlyActive?: boolean` for enable/disable inspect view
  in paused objects - @dragoncoder047
- Added `KAPLAYOpt.sapDirection?: "horizontal" | "vertical" | "both";` for
  change the direction of Sweep and Prune system

### Changed

- Now addLevel incorporates PosComp in type - @KeSuave (**C**)

### Fixed

- Fixed livequery in `tagsAsComponents` - @mflerackers
- AreaComp.onClick now returns the correct type, KEvent - @lajbel **(C)**
- Fixed wrong calculation in Vec.dot - @andrenanninga (**C**)
- Now errors happening on object creation also trigger blue screen, specially
  missing dependencies ones - @lajbel (#641) (**C**)
- Fixed pointer-lock undefined in some browsers - @imaginarny #632 (**C**)
