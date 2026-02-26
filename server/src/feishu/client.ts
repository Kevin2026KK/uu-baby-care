import * as Lark from "@larksuiteoapi/node-sdk";
import { config } from "../config.js";

export const feishuClient = new Lark.Client({
  appId: config.feishu.appId,
  appSecret: config.feishu.appSecret,
  appType: Lark.AppType.SelfBuild,
  domain: Lark.Domain.Feishu,
});
