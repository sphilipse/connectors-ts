import { ConnectorConfiguration } from "../../connectors";

export async function validateConfiguration(
  config: ConnectorConfiguration
): Promise<boolean> {
  try {
    if (
      !config["username"]?.value ||
      !config["host_name"]?.value ||
      !config["api_key"]?.value
    ) {
      console.error("Incomplete configuration for connector");
      return false;
    }
    const username = config["username"].value;
    const hostname = config["host_name"].value;
    const apiKey = config["api_key"].value;
    const auth = Buffer.from(`${username}:${apiKey}`).toString("base64");

    const url = `${hostname}/rest/api/2/issue/createmeta`;

    const result = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authentication: `Basic ${auth}`,
      },
    });
    if (result.status < 400) {
      console.info("Configuration validated with successful connection");
      return true;
    }
    console.error(
      `Error ${result.status}. Could not connect to data source with provided configuration`
    );
    console.error(result.statusText);
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}
