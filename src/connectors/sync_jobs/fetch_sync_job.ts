import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_JOBS_INDEX } from "../../index";
import { ConnectorSyncJob, ConnectorSyncJobDocument } from "../../connectors";

export async function fetchSyncJob(
  client: Client,
  syncJobId: string
): Promise<ConnectorSyncJob> {
  const result = await client.get<ConnectorSyncJobDocument>({
    index: CONNECTORS_JOBS_INDEX,
    id: syncJobId,
  });
  if (result._source) {
    return { ...result._source, id: result._id };
  }
  throw `Could not find syncJob`;
}
