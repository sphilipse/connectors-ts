import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_INDEX, CONNECTORS_JOBS_INDEX } from "../../constants";
import {
  ConnectorDocument,
  ConnectorSyncJobDocument,
  SyncStatus,
} from "../../connectors";

export async function cancelSyncJob(
  client: Client,
  syncJobId: string,
  connectorId: string
) {
  const now = new Date().toISOString();
  await client.update<ConnectorSyncJobDocument>({
    index: CONNECTORS_JOBS_INDEX,
    id: syncJobId,
    doc: {
      canceled_at: now,
      completed_at: now,
      last_seen: now,
      status: SyncStatus.CANCELED,
    },
  });
  await client.update<ConnectorDocument>({
    index: CONNECTORS_INDEX,
    id: connectorId,
    doc: {
      last_sync_status: SyncStatus.CANCELED,
    },
  });
}
