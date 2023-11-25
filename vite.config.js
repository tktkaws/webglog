import { defineConfig } from "vite";
import { resolve } from "path";
import { splitVendorChunkPlugin } from "vite";
import glslify from "rollup-plugin-glslify";

const root = "src";

export default defineConfig({
  root,
  base: "/",
  publicDir: "../public",
  plugins: [
    splitVendorChunkPlugin(),
    glslify({
      compress(code) {
        // Based on https://github.com/vwochnik/rollup-plugin-glsl
        // Modified to remove multiline comments. See #16
        let needNewline = false;
        return code
          .replace(
            /\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/gs,
            ""
          )
          .split(/\n+/)
          .reduce((result, line) => {
            line = line.trim().replace(/\s{2,}|\t/, " "); // lgtm[js/incomplete-sanitization]
            if (line.charAt(0) === "#" || /else/.test(line)) {
              if (needNewline) {
                result.push("\n");
              }
              result.push(line, "\n");
              needNewline = false;
            } else {
              result.push(
                line.replace(
                  /\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|-|!|;)\s*/g,
                  "$1"
                )
              );
              needNewline = true;
            }
            return result;
          }, [])
          .join(process.env.NODE_ENV === "development" ? "\n" : "")
          .replace(/\n+/g, "\n");
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: "#",
        replacement: "/scripts",
      },
    ],
  },
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        render_target: resolve(root, "render_target/index.html"),
        render_target_shader: resolve(root, "render_target_shader/index.html"),
        film: resolve(root, "postprocessing/film/index.html"),
        dotscreen: resolve(root, "postprocessing/dotscreen/index.html"),
        glitch: resolve(root, "postprocessing/glitch/index.html"),
        pp_shader_pass: resolve(root, "pp_shader_pass/index.html"),
        pp_custom_shader: resolve(root, "pp_custom_shader/index.html"),
        integration: resolve(root, "integration/index.html"),
        load_texture: resolve(root, "texture/01_load_texture/index.html"),
        texture_sizing: resolve(root, "texture/02_texture_sizing/index.html"),
        loading_progress: resolve(root, "loading_progress/index.html"),
        video_texture: resolve(root, "video_texture/index.html"),
        shader_material: resolve(
          root,
          "basic_shader/01_shader_material/index.html"
        ),
        shader_texture: resolve(
          root,
          "basic_shader/02_shader_texture/index.html"
        ),
      },
    },
  },
  server: {
    host: true,
  },
});
