import pkgHooks from "./pkg";
import validate from "./validate";
import prompt from "./prompt";
import {
  initGithubActions,
  publishNpm,
  createRelease,
  createTag,
} from "./steps";
import {
  config,
  beforePublish,
  afterPublish,
  beforeRelease,
  createDoPlugin,
  success,
} from "./plugin";
import {
  initLog,
  exec,
  createDefaultConfig,
  TContext,
  TPlugin,
  TMessageKey,
  initSpinner,
  executeTypes,
  yarnrc,
  stopAfterPlugin,
  getNextVersion
} from "./helpers";
export type { TContext, TPlugin } from "./helpers";

async function setBaseVersion(ctx:TContext){
  const guessVersion = getNextVersion(ctx.pkg?.version);
  const version = await ctx.prompt.input(
    `请确认要发布的版本号`,
    guessVersion
  );
  ctx.shared.nextVersion = version
}

async function createContext(userPlugins?: TPlugin[]) {
  const outPlugins = userPlugins || [];
  outPlugins.push(...[config,success]);
  const buildInPlugins: TPlugin[] = [
    beforePublish,
    beforeRelease,
    afterPublish,
  ];
  const plugins: TPlugin[] = [...buildInPlugins, ...outPlugins];
  const ctx: TContext = {
    lifecycle: "config",
    config: createDefaultConfig(),
    spinner: initSpinner(),
    restart: () => {},
    quit: function () {
      this.spinner.stop();
      yarnrc.unlink()
      process.exit(1);
    },
    shared: {},
    exec,
    prompt,
    plugins,
    validate,
    initGithubActions,
    publishNpm,
    createTag,
    createRelease,
    stopAfterPlugin
  };
  ctx.pkg = pkgHooks.load(ctx);
  ctx.runPluginTasks = createDoPlugin(ctx);
  return ctx as Required<TContext>;
}

export async function cli(userPlugins?: TPlugin[]) {
  const ctx = await createContext(userPlugins);
  await ctx.runPluginTasks("config");
  ctx.log = initLog<TMessageKey>(ctx.config.runAt)
  ctx.restart = () => {
    cli(userPlugins);
  };
  const keys = Object.keys(executeTypes)
  const type = await ctx.prompt.select(keys, {
    result(value:keyof (typeof executeTypes)) {
      return executeTypes[value];
    },
  });
  if (type === 1){
    await setBaseVersion(ctx)
    await ctx[ctx.config.firstCall!]();
  }
  if (type === 2) {
    ctx.log?.("CUSTOM","yellow","当前版本尚不支持,请重新选择")
    ctx.restart()
    return
  };
  await ctx.runPluginTasks("success");
  return ctx;
}
