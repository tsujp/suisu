const std = @import("std");

// @import("foo") -- imports _module_ foo.
// packages are pieces of code downloaded and/or depended on in the Zig package manager
// libraries are explicitly C-style static or dynamic libraries (.so, .dll) etc

// `build` declaratively constructs a build graph to be executed by an external
//   runner (e.g. the `zig build` command).
pub fn build(b: *std.Build) void {
    // `standardTargetOptions` et al narrow the targets and optimisations the
    //   runner can provide, these particular ones do not narrow at all and so
    //   allow all the defaults. If we only wanted to allow building WASM we
    //   could define and then set them in-place of `standardTargetOptions`.
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Build httpz with standard optimisations (it's not a dependency _yet_).
    //   see further down this file (`addModule`).
    const httpz_dep = b.dependency("httpz", .{
        .target = target,
        .optimize = optimize,
    });

    // TODO: Better name for REST API wrapper?
    const bin = b.addExecutable(.{
        .name = "rest_wrapper",
        .root_source_file = .{ .path = "src/main.zig" },
        .target = target,
        .optimize = optimize,
    });

    // Add module `httpz` under name `httpz` (and which we just built) as a
    //   dependency for our executable.
    bin.addModule("httpz", httpz_dep.module("httpz"));

    // TODO: `b.installArtifact(bin)` step when this is ready for distribution.

    // Creates a run step. This can be executed when another step is evaluated
    //   that depends on it; done-so by exposing it as a build step (visible in
    //   `zig build --help`) using `b.step()`.
    const run_cmd = b.addRunArtifact(bin);

    // Creates a build step (visible in `zig build --help`) and declares a
    //   dependency on the `run_cmd` run step. Now executing `zig build run`
    //   allows us to build and execute `bin`.
    const run_step = b.step("run", "Do the thing");
    run_step.dependOn(&run_cmd.step);

    // Creates a test step which will build the test executable (but not run it).
    const unit_tests = b.addTest(.{
        .root_source_file = .{ .path = "src/main.zig" },
        .target = target,
        .optimize = optimize,
    });

    // Creates a run step for our test executable.
    const run_unit_tests_cmd = b.addRunArtifact(unit_tests);

    // Crates a build step for unit tests executable.
    const test_step = b.step("test", "Test the thing");
    test_step.dependOn(&run_unit_tests_cmd.step);
}
