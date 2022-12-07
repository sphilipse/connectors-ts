import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_INDEX, CONNECTORS_JOBS_INDEX } from "../..";
import { ConnectorDocument, SyncStatus } from "../../connectors";

export async function updateSyncJob(
  client: Client,
  syncJobId: string,
  counts: {
    deleted_document_count: number;
    indexed_document_count: number;
    indexed_document_volume: number;
  },
  final: boolean,
  connectorId: string
) {
  console.info(
    `Updating sync job ${syncJobId} with ${counts.deleted_document_count} deleted, ${counts.indexed_document_count} indexed and ${counts.indexed_document_volume} bytes indexed`
  );
  const now = new Date().toISOString();
  const finalDoc = final
    ? {
        completed_at: now,
      }
    : {};
  await client.update({
    index: CONNECTORS_JOBS_INDEX,
    id: syncJobId,
    doc: {
      ...counts,
      status: final ? SyncStatus.COMPLETED : SyncStatus.IN_PROGRESS,
      last_seen: now,
      ...finalDoc,
    },
  });
  if (final) {
    await client.update<ConnectorDocument>({
      index: CONNECTORS_INDEX,
      doc: {
        last_sync_error: null,
        last_sync_status: SyncStatus.COMPLETED,
        last_synced: now,
      },
      id: connectorId,
    });
  }
}
