import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_JOBS_INDEX } from "../../constants";
import { Connector, TriggerMethod } from "../../connectors";
import { createSyncJob } from "./create_sync_job_document";

export async function addSyncJob(
  client: Client,
  connector: Connector,
  onDemand = false,
  cursor?: number
) {
  const syncJob = createSyncJob(
    connector,
    onDemand ? TriggerMethod.ON_DEMAND : TriggerMethod.SCHEDULED,
    new Date().toISOString(),
    cursor
  );

  const result = await client.index({
    index: CONNECTORS_JOBS_INDEX,
    document: syncJob,
  });
  console.info(
    `Created sync job ${result._id} with parameters: cursor ${cursor}, connector id ${connector.id}`
  );
}
