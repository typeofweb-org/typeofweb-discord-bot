// tslint:disable:no-var-requires
if (process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: ".env" });
} else {
  require("dotenv").config({ path: ".env.dev" });
}
require("./app");
