import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.info(`API listening on http://localhost:${config.port}`);
  });
}

export default app;
