import { Client } from "@elastic/elasticsearch";
import { JobResponse, SyncStatus } from "../../connectors";
import { SyncFunction } from "../connector_definitions";
import { checkSyncJobs } from "./check_sync_jobs";
import { executeSync } from "./execute_sync";

export async function syncJobTask(
  client: Client,
  connectorId: string,
  fetchSyncData: SyncFunction<number>
): Promise<JobResponse> {
  const syncJob = await checkSyncJobs(client, connectorId);
  console.info(
    syncJob
      ? `Found sync job ${syncJob.value.id} for connector ${connectorId}`
      : `Couldn't find a sync job for connector ${connectorId}`
  );
  if (!syncJob)
    return {
      indexed_document_count: 0,
      deleted_document_count: 0,
      indexed_document_volume: 0,
      status: SyncStatus.ERROR,
      error: `Couldn't find a sync job for connector ${connectorId}`,
    };
  return await executeSync(client, syncJob, fetchSyncData);
}
