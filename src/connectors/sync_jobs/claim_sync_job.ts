import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_INDEX, CONNECTORS_JOBS_INDEX } from "../../constants";
import { ConnectorStatus, SyncStatus } from "../../connectors";

export async function claimSyncJob(
  client: Client,
  syncJobId: string,
  seqNo: number | undefined,
  primaryTerm: number | undefined,
  connectorId: string
) {
  const now = new Date().toISOString();
  await client.update({
    index: CONNECTORS_JOBS_INDEX,
    doc: {
      started_at: now,
      status: SyncStatus.IN_PROGRESS,
    },
    id: syncJobId,
    if_seq_no: seqNo,
    if_primary_term: primaryTerm,
  });
  await client.update({
    index: CONNECTORS_INDEX,
    id: connectorId,
    doc: {
      error: null,
      status: ConnectorStatus.CONNECTED,
      last_sync_status: SyncStatus.IN_PROGRESS,
      last_sync_error: null,
    },
  });
  console.log(`Claimed sync job ${syncJobId}`);
}
