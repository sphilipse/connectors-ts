import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_JOBS_INDEX } from "../..";
import {
  ConnectorSyncJob,
  ConnectorSyncJobDocument,
  SyncStatus,
} from "../../connectors";
import { OptimisticConcurrency } from "../../utils/optimistic_concurrency";

export async function checkSyncJobs(
  client: Client,
  connectorId: string
): Promise<OptimisticConcurrency<ConnectorSyncJob> | undefined> {
  const syncJobsResponse = await client.search<ConnectorSyncJobDocument>({
    index: CONNECTORS_JOBS_INDEX,
    query: {
      bool: {
        filter: [
          { term: { "connector.id": connectorId } },
          { term: { status: SyncStatus.PENDING } },
        ],
      },
    },
    seq_no_primary_term: true,
  });
  const hit = syncJobsResponse.hits.hits[0]?._source
    ? {
        ...syncJobsResponse.hits.hits[0]._source,
        id: syncJobsResponse.hits.hits[0]._id,
      }
    : undefined;
  return hit
    ? {
        value: hit,
        primaryTerm: syncJobsResponse.hits.hits[0]?._primary_term,
        seqNo: syncJobsResponse.hits.hits[0]?._seq_no,
      }
    : undefined;
}
