import { ConnectorConfiguration } from "../../connectors";

export async function fetchJobCursors(
  config: ConnectorConfiguration
): Promise<number[]> {
  const MAX_LENGTH = 100;
  if (
    !config["username"]?.value ||
    !config["host_name"]?.value ||
    !config["api_key"]?.value
  ) {
    console.error("Incomplete configuration for connector");
    throw new Error("Incomplete configuration");
  }
  console.info(`Fetching cursors for jira`);
  const auth = Buffer.from(
    `${config["username"].value}:${config["api_key"].value}`
  ).toString("base64");
  const url = `${config["host_name"].value}/rest/api/3/search?maxResults=0`;
  const result = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
  });
  const { total }: { total: number } = await result.json();
  const cursors = Array.from(Array(Math.ceil(total / MAX_LENGTH))).map(
    (_, index) => index * MAX_LENGTH
  );
  console.info(`Found ${cursors.length} jobs`);
  return cursors;
}
