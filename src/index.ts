import prompt from "./prompt";
import pkgHooks from "./pkg";
import validate from "./validate";
import { initGithubActions, publishNpm, createRelease, createTag } from "./steps";
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
      process.exit(1);
    },
    shared: {},
    exec,
    plugins,
    validate,
    initGithubActions,
    publishNpm,
    createTag,
    createRelease,
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
  const type = await prompt.executeType();
  if (type === 1) await ctx.publishNpm();
  if (type === 2) await ctx.createRelease();
  if (type === 3) await ctx.createTag();
  if (type === 4) await ctx.initGithubActions();
  await ctx.runPluginTasks("success");
  return ctx;
}
