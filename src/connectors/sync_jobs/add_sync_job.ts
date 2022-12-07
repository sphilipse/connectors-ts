import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_JOBS_INDEX } from "../..";
import {
  Connector,
  ConnectorSyncJobDocument,
  SyncStatus,
  TriggerMethod,
} from "../../connectors";

export async function addSyncJob(
  client: Client,
  connector: Connector,
  onDemand = false
) {
  const now = new Date().toISOString();
  const syncJob: ConnectorSyncJobDocument = {
    cancelation_requested_at: null,
    canceled_at: null,
    completed_at: null,
    connector: {
      configuration: connector.configuration,
      filtering: connector.filtering[0] ? [connector.filtering[0]?.active] : [],
      id: connector.id,
      index_name: connector.index_name,
      language: connector.language ?? "",
      pipeline: connector.pipeline ?? null,
      service_type: connector.service_type ?? "",
    },
    created_at: now,
    deleted_document_count: 0,
    error: null,
    indexed_document_count: 0,
    indexed_document_volume: 0,
    last_seen: now,
    metadata: {},
    started_at: null,
    status: SyncStatus.PENDING,
    trigger_method: onDemand
      ? TriggerMethod.ON_DEMAND
      : TriggerMethod.SCHEDULED,
    worker_hostname: "",
  };
  await client.index({ index: CONNECTORS_JOBS_INDEX, document: syncJob });
}
