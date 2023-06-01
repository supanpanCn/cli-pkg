import prompt from "./prompt";
import pkgHooks from "./pkg";
import publish from "./publish";
import release from "./release";
import tag from "./tag";
import validate from "./validate";
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
  TInnerContext,
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
  const ctx: TInnerContext = {
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
    release,
    publish,
    tag,
  };
  ctx.pkg = pkgHooks.load(ctx);
  ctx.runPluginTasks = createDoPlugin(ctx);
  return ctx as Required<TInnerContext>;
}

export async function cli(userPlugins?: TPlugin[]) {
  const ctx = await createContext(userPlugins);
  await ctx.runPluginTasks("config");
  ctx.log = initLog<TMessageKey>(ctx.config.runAt);
  ctx.restart = () => {
    cli(userPlugins);
  };
  const type = await prompt.executeType();
  if (type === 1) await publish.call(ctx);
  if (type === 2) await release.call(ctx);
  if (type === 3) await tag.call(ctx);
  await ctx.runPluginTasks("success");
  return ctx;
}
