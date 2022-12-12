import { ConnectorConfiguration } from "../../connectors";
import { SyncResponse } from "../connector_definitions";

export async function fetchSyncData(
  config: ConnectorConfiguration,
  cursor = 0
): Promise<SyncResponse<Array<Record<string, unknown>>, number>> {
  if (
    !config["username"]?.value ||
    !config["host_name"]?.value ||
    !config["api_key"]?.value
  ) {
    console.error("Incomplete configuration for connector");
    throw new Error("Incomplete configuration");
  }
  console.info(`Fetching documents for jira, cursor at ${cursor}`);
  const auth = Buffer.from(
    `${config["username"].value}:${config["api_key"].value}`
  ).toString("base64");
  const url = `${config["host_name"].value}/rest/api/3/search?maxResults=100&startAt=${cursor}`;
  const result = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
  });
  const body: { issues: Array<Record<string, unknown>>; total: number } =
    await result.json();
  return {
    cursor: cursor + body.issues.length,
    data: body.issues,
    final: body.issues.length === 0,
  };
}
