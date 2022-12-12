import { Client } from "@elastic/elasticsearch";
import {
  ConnectorSyncJob,
  Counts,
  JobResponse,
  SyncStatus,
} from "../../connectors";
import { SyncFunction } from "../connector_definitions";
import { updateSyncJob } from "./update_sync_job";
import { claimSyncJob } from "./claim_sync_job";
import { OptimisticConcurrency } from "../../utils/optimistic_concurrency";
import { fetchSyncJob } from "./fetch_sync_job";
import { cancelSyncJob } from "./cancel_sync_job";
import { errorSyncJob } from "./error_sync_job";

export async function executeSync(
  client: Client,
  syncJob: OptimisticConcurrency<ConnectorSyncJob>,
  fetchSyncData: SyncFunction<number>
): Promise<JobResponse> {
  const connector = syncJob.value.connector;
  const counts: Counts = {
    deleted_document_count: 0,
    indexed_document_count: 0,
    indexed_document_volume: 0,
  };
  try {
    await claimSyncJob(
      client,
      syncJob.value.id,
      syncJob.seqNo,
      syncJob.primaryTerm,
      connector.id
    );
  } catch {
    const error = `Could not claim sync job ${syncJob.value.id}, this is usually because it has already been claimed`;
    console.error(error);
    return {
      ...counts,
      error,
      status: SyncStatus.ERROR,
    };
  }
  let cursor = syncJob.value.cursor ?? 0;
  const count = syncJob.value.count;
  let shouldStopSync = false;

  try {
    while (!shouldStopSync) {
      const {
        data,
        cursor: newCursor,
        final,
      } = await fetchSyncData(connector.configuration, cursor);
      cursor = newCursor;
      if (data.length) {
        const operations = data.flatMap((doc) => [
          { index: { _index: connector.index_name, _id: doc["id"] } },
          doc,
        ]);
        console.info(`Indexing ${data.length} documents`);
        const result = await client.bulk({
          operations,
          pipeline: connector.pipeline?.name,
          refresh: true,
        });
        if (result.errors) {
          console.error("Encountered errors during bulk index");
        }
        counts.indexed_document_count += data.length;
        counts.indexed_document_volume += data
          .map((doc) => Buffer.byteLength(JSON.stringify(doc)))
          .reduce((prev, curr) => prev + curr, 0);
      }
      shouldStopSync =
        final || !!(count && counts.indexed_document_count >= count);
      const newSyncJob = await fetchSyncJob(client, syncJob.value.id);
      if (newSyncJob.status === SyncStatus.CANCELING) {
        await cancelSyncJob(client, newSyncJob.id, connector.id);
        return { ...counts, status: SyncStatus.CANCELED };
      }
      await updateSyncJob(
        client,
        syncJob.value.id,
        counts,
        shouldStopSync,
        connector.id
      );
    }
    return { ...counts, status: SyncStatus.COMPLETED };
  } catch (error) {
    console.error(error);
    errorSyncJob(
      client,
      syncJob.value.id,
      syncJob.value.connector.id,
      `${error}`
    );
    return { ...counts, status: SyncStatus.ERROR };
  }
}
