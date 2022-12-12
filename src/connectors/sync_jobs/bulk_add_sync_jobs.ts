import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_JOBS_INDEX } from "../../constants";
import { Connector, TriggerMethod } from "../../connectors";
import { createSyncJob } from "./create_sync_job_document";

export async function bulkAddSyncJobs(
  client: Client,
  connector: Connector,
  onDemand = false,
  cursors: number[]
) {
  const syncJobs = cursors.map((cursor) =>
    createSyncJob(
      connector,
      onDemand ? TriggerMethod.ON_DEMAND : TriggerMethod.SCHEDULED,
      new Date().toISOString(),
      cursor
    )
  );
  const operations = syncJobs.flatMap((doc) => [
    { index: { _index: CONNECTORS_JOBS_INDEX } },
    doc,
  ]);
  const result = await client.bulk({
    operations,
    refresh: true,
  });
  console.info(
    `Created ${result.items} sync jobs for connector ${connector.id} with ${
      result.errors ? "no" : "some"
    } errors. Expected to create ${cursors.length} jobs.`
  );
}
