import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_INDEX } from "../constants";
import { Connector } from "../connectors";

export async function checkIn(client: Client, connector: Connector) {
  const now = new Date().toISOString();
  console.log("Writing check in date at", now);
  client.update({
    doc: {
      last_seen: now,
    },
    id: connector.id,
    index: CONNECTORS_INDEX,
  });
}
