import * as Lark from "@larksuiteoapi/node-sdk";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(import.meta.dirname, "../../.env") });

const client = new Lark.Client({
  appId: process.env.FEISHU_APP_ID!,
  appSecret: process.env.FEISHU_APP_SECRET!,
  appType: Lark.AppType.SelfBuild,
  domain: Lark.Domain.Feishu,
});

async function setup() {
  console.log("Creating Bitable app...");

  // Step 1: Create app
  const appRes = await client.bitable.app.create({
    data: { name: "宝宝记录" },
  });

  if (appRes.code !== 0) {
    throw new Error(`Failed to create app: ${appRes.msg}`);
  }

  const appToken = appRes.data?.app?.app_token!;
  console.log(`App created: ${appToken}`);
  console.log(`URL: ${appRes.data?.app?.url}`);

  // Step 2: Get default table
  const tablesRes = await client.bitable.appTable.list({
    path: { app_token: appToken },
  });

  if (tablesRes.code !== 0) {
    throw new Error(`Failed to list tables: ${tablesRes.msg}`);
  }

  const tableId = tablesRes.data?.items?.[0]?.table_id!;
  console.log(`Default table: ${tableId}`);

  // Step 3: Clean up default fields (keep primary, delete others)
  const fieldsRes = await client.bitable.appTableField.list({
    path: { app_token: appToken, table_id: tableId },
  });

  if (fieldsRes.code === 0 && fieldsRes.data?.items) {
    // Rename primary field
    const primary = fieldsRes.data.items.find((f) => f.is_primary);
    if (primary?.field_id) {
      await client.bitable.appTableField.update({
        path: { app_token: appToken, table_id: tableId, field_id: primary.field_id },
        data: { field_name: "记录", type: 1 },
      });
      console.log("Renamed primary field to '记录'");
    }

    // Delete non-primary default fields
    for (const f of fieldsRes.data.items) {
      if (!f.is_primary && f.field_id) {
        try {
          await client.bitable.appTableField.delete({
            path: { app_token: appToken, table_id: tableId, field_id: f.field_id },
          });
        } catch {}
      }
    }
  }

  // Step 4: Clean up default empty rows
  const recordsRes = await client.bitable.appTableRecord.list({
    path: { app_token: appToken, table_id: tableId },
    params: { page_size: 100 },
  });

  if (recordsRes.code === 0 && recordsRes.data?.items) {
    const ids = recordsRes.data.items.map((r) => r.record_id).filter(Boolean) as string[];
    if (ids.length > 0) {
      await client.bitable.appTableRecord.batchDelete({
        path: { app_token: appToken, table_id: tableId },
        data: { records: ids },
      });
      console.log(`Cleaned ${ids.length} default rows`);
    }
  }

  // Step 5: Create custom fields
  const fields = [
    {
      field_name: "事件类型",
      type: 3,
      property: {
        options: [
          { name: "喂奶", color: 0 },
          { name: "换尿布", color: 1 },
          { name: "拉屎", color: 2 },
          { name: "洗澡", color: 3 },
        ],
      },
    },
    { field_name: "时间", type: 5 },
    { field_name: "备注", type: 1 },
    { field_name: "创建时间", type: 1001 },
  ];

  for (const field of fields) {
    const res = await client.bitable.appTableField.create({
      path: { app_token: appToken, table_id: tableId },
      data: field as any,
    });

    if (res.code !== 0) {
      console.error(`Failed to create field '${field.field_name}': ${res.msg}`);
    } else {
      console.log(`Created field: ${field.field_name}`);
    }
  }

  console.log("\n========================================");
  console.log("Setup complete! Add these to your .env:");
  console.log(`BITABLE_APP_TOKEN=${appToken}`);
  console.log(`BITABLE_TABLE_ID=${tableId}`);
  console.log("========================================\n");
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
