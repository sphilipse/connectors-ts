import { Client } from "@elastic/elasticsearch";
import { ConnectorSyncJob, SyncStatus } from "../connectors";
import { SyncFunction } from "./connector_definitions";
import { updateSyncJob } from "./sync_jobs/update_sync_job";
import { claimSyncJob } from "./sync_jobs/claim_sync_job";
import { OptimisticConcurrency } from "../utils/optimistic_concurrency";
import { fetchSyncJob } from "./sync_jobs/fetch_sync_job";
import { cancelSyncJob } from "./sync_jobs/cancel_sync_job";
import { errorSyncJob } from "./sync_jobs/error_sync_job";

export async function executeSync(
  client: Client,
  syncJob: OptimisticConcurrency<ConnectorSyncJob>,
  fetchSyncData: SyncFunction<number>
) {
  console.log({ syncJob });
  const connector = syncJob.value.connector;
  await claimSyncJob(
    client,
    syncJob.value.id,
    syncJob.seqNo,
    syncJob.primaryTerm,
    connector.id
  );
  let cursor = 0;
  let shouldStopSync = false;
  const counts = {
    deleted_document_count: 0,
    indexed_document_count: 0,
    indexed_document_volume: 0,
  };

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
      await updateSyncJob(
        client,
        syncJob.value.id,
        counts,
        final,
        connector.id
      );
      const newSyncJob = await fetchSyncJob(client, syncJob.value.id);
      if (newSyncJob.status === SyncStatus.CANCELING) {
        await cancelSyncJob(client, newSyncJob.id, connector.id);
      }
      shouldStopSync = final || newSyncJob.status === SyncStatus.CANCELING;
    }
  } catch (error) {
    console.error(error);
    errorSyncJob(client, syncJob.value.id, connector.id, `${error}`);
  }
}
