import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_INDEX } from "../constants";
import { ConnectorStatus, SyncStatus } from "../connectors";

export async function logError(
  client: Client,
  connectorId: string,
  error: string,
  isSyncError: boolean
) {
  const errorText = `Encountered an error for connector ${connectorId}, ${error}`;
  console.log(errorText);
  const syncError = isSyncError
    ? { last_sync_status: SyncStatus.ERROR, last_sync_error: error }
    : {};
  const doc = { error, status: ConnectorStatus.ERROR, ...syncError };
  client.update({
    doc,
    index: CONNECTORS_INDEX,
    id: connectorId,
  });
}
