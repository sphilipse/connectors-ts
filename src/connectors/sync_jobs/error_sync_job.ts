import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_INDEX, CONNECTORS_JOBS_INDEX } from "../..";
import {
  ConnectorDocument,
  ConnectorStatus,
  ConnectorSyncJobDocument,
  SyncStatus,
} from "../../connectors";

export async function errorSyncJob(
  client: Client,
  syncJobId: string,
  connectorId: string,
  error: string
) {
  const now = new Date().toISOString();
  await client.update<ConnectorSyncJobDocument>({
    index: CONNECTORS_JOBS_INDEX,
    id: syncJobId,
    doc: {
      status: SyncStatus.ERROR,
      error,
      completed_at: now,
      canceled_at: now,
    },
  });
  await client.update<ConnectorDocument>({
    index: CONNECTORS_INDEX,
    id: connectorId,
    doc: {
      status: ConnectorStatus.ERROR,
      error,
      last_seen: now,
      last_sync_status: SyncStatus.ERROR,
      last_sync_error: error,
    },
  });
}
