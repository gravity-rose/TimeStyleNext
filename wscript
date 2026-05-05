#
# This file is the default set of rules to compile a Pebble application.
#
# Feel free to customize this to your needs.
#
import os.path

top = '.'
out = 'build'


def options(ctx):
    ctx.load('pebble_sdk')


def configure(ctx):
    """
    This method is used to configure your build. ctx.load(`pebble_sdk`) automatically configures
    a build for each valid platform in `targetPlatforms`. Platform-specific configuration: add your
    change after calling ctx.load('pebble_sdk') and make sure to set the correct environment first.
    Universal configuration: add your change prior to calling ctx.load('pebble_sdk').
    """
    _patch_clay_for_new_platforms()
    ctx.load('pebble_sdk')


def _patch_clay_for_new_platforms():
    """Patch pebble-clay to support flint and gabbro platforms."""
    import shutil
    clay_base = os.path.join('node_modules', 'pebble-clay', 'dist')
    for subdir in ['include/pebble-clay', 'binaries']:
        # flint uses diorite's clay files
        src = os.path.join(clay_base, subdir, 'diorite')
        dst = os.path.join(clay_base, subdir, 'flint')
        if os.path.isdir(src) and not os.path.isdir(dst):
            shutil.copytree(src, dst)
        # gabbro uses chalk's clay files (round)
        src = os.path.join(clay_base, subdir, 'chalk')
        dst = os.path.join(clay_base, subdir, 'gabbro')
        if os.path.isdir(src) and not os.path.isdir(dst):
            shutil.copytree(src, dst)

def build(ctx):
    _patch_clay_for_new_platforms()
    ctx.load('pebble_sdk')

    build_worker = os.path.exists('worker_src')
    binaries = []

    cached_env = ctx.env
    for platform in ctx.env.TARGET_PLATFORMS:
        ctx.env = ctx.all_envs[platform]
        ctx.set_group(ctx.env.PLATFORM_NAME)
        app_elf = '{}/pebble-app.elf'.format(ctx.env.BUILD_DIR)
        ctx.pbl_build(source=ctx.path.ant_glob('src/c/**/*.c'), target=app_elf, bin_type='app')

        if build_worker:
            worker_elf = '{}/pebble-worker.elf'.format(ctx.env.BUILD_DIR)
            binaries.append({'platform': platform, 'app_elf': app_elf, 'worker_elf': worker_elf})
            ctx.pbl_build(source=ctx.path.ant_glob('worker_src/c/**/*.c'),
                          target=worker_elf,
                          bin_type='worker')
        else:
            binaries.append({'platform': platform, 'app_elf': app_elf})
    ctx.env = cached_env

    ctx.set_group('bundle')
    ctx.pbl_bundle(binaries=binaries,
                   js=ctx.path.ant_glob(['src/pkjs/**/*.js',
                                         'src/pkjs/**/*.json',
                                         'src/common/**/*.js']),
                   js_entry_file='src/pkjs/index.js')
