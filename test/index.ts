import path from "path";
import { copyTemplate } from "../src/utils";

copyTemplate(['template/a'], path.resolve(import.meta.dirname, './dest/')).then(() => {
  console.log('Copy completed successfully.');
}).catch((err) => {
  console.error(err);
})