import SentryCli from "@sentry/cli";
import type { AstroIntegration } from "astro";
import { unlink } from "fs/promises";
import { globby } from "globby";

// The integration portion of this solution handles sending sourcemaps to Sentry.

// I want my plugin options to be the Sentry CLI options plus a release string.
type PluginOptions = ConstructorParameters<typeof SentryCli>[1] & {
  release: string;
};

export default function sentryIntegration(opts: PluginOptions): AstroIntegration {
  // As of publishing, I haven't found a way to programatically set environment variables,
  // which is necessary to be able to pass the release to the Framework Component that loads sentry.
  // Instead, we pass that in manually when running the build script and load it here.
  const { authToken, org, project, release } = opts || {};
  return {
    name: "Sentry",
    hooks: {
      // Before the build we configure Vite to produce sourcemaps. 'hidden' is chosen in this example
      // because we're uploading our sourcemaps to sentry and don't need to include their urls in the
      // associated JavaScript.
      "astro:build:setup": async ({ vite }) => {
        if (!!authToken) {
          vite.build ||= {};
          vite.build.sourcemap = true;
        }
      },
      "astro:build:done": async ({ dir }) => {
        if (!!authToken) {
          // Astro compliation produces a lot of .mjs.map files which I *believe* are
          // for assets that are involved in static compliation — things like the compiled
          // JavaScript version of .astro page files. We don't need to send those to Sentry
          // because they aren't relevant to runtime, so we remove them here before we
          // create the Sentry release.
          const mjsMaps = await globby([`${dir.pathname}/**/*.mjs.map`]);
          await Promise.all(mjsMaps.map((x) => unlink(x)));

          // Submit the sourcemaps to Sentry
          const { releases } = new SentryCli(null, { org, project, authToken });
          await releases.new(release);
          await releases.uploadSourceMaps(release, { include: [dir.pathname] });
          await releases.finalize(release);
          // Delete all the sourcemap files so they don't get published. Unfortunatelly,
          // we don't have access to Vite's glob helper so I'm using globby here.
          const maps = await globby([`${dir.pathname}/**/*.map`]);
          await Promise.all(maps.map((x) => unlink(x)));
        }
      },
    },
  };
}
