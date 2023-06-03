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
  stopAfterPlugin
} from "./helpers";
export type { TContext, TPlugin } from "./helpers";

async function createContext(userPlugins?: TPlugin[]) {
  const outPlugins = userPlugins || [];
  outPlugins.push(config);
  const buildInPlugins: TPlugin[] = [
    beforePublish,
    beforeRelease,
    afterPublish,
    success,
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
  ctx.log = initLog<TMessageKey>(ctx.config.runAt);
  ctx.restart = () => {
    cli(userPlugins);
  };
  const keys = Object.keys(executeTypes)
  let typeChinese = ''
  const type = await ctx.prompt.select(keys, {
    result(value:keyof (typeof executeTypes)) {
      typeChinese = value
      return executeTypes[value];
    },
  });
  ctx.queueHead = typeChinese
  if (type === 1) await ctx.publishNpm();
  if (type === 2) await ctx.createRelease();
  if (type === 3) await ctx.createTag();
  await ctx.runPluginTasks("success");
  return ctx;
}
