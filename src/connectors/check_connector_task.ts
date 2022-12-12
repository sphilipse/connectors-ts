import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_INDEX } from "../constants";
import { Connector } from "../connectors";
import { getChanges } from "../utils/get_changes";
import { ConnectorDefinition } from "./connector_definitions";
import { fetchConnectorById } from "./fetch_connector";
import { processConnectorChanges } from "./process_connector";
import { addSyncJob } from "./sync_jobs/add_sync_job";
import { bulkAddSyncJobs } from "./sync_jobs/bulk_add_sync_jobs";

export async function checkConnectorTask(
  client: Client,
  connector: Connector,
  connectorDefinition: ConnectorDefinition
): Promise<Connector> {
  const newConnector = await fetchConnectorById(client, connector.id);
  const changes = getChanges(connector, newConnector.value);
  await processConnectorChanges(
    client,
    connector,
    changes,
    connectorDefinition
  );
  const hasChanges = Object.keys(changes).length;

  if (newConnector.value.sync_now) {
    await client.update({
      index: CONNECTORS_INDEX,
      doc: { sync_now: false },
      id: connector.id,
      if_seq_no: newConnector.seqNo,
      if_primary_term: newConnector.primaryTerm,
      refresh: true,
    });
    if (connectorDefinition.fetchJobCursors) {
      const cursors = await connectorDefinition.fetchJobCursors(
        newConnector.value.configuration
      );
      await bulkAddSyncJobs(
        client,
        hasChanges ? newConnector.value : connector,
        true,
        cursors
      );
    } else {
      addSyncJob(client, hasChanges ? newConnector.value : connector, true);
    }
  }
  return hasChanges ? newConnector.value : connector;
}
