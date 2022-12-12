import {
  Connector,
  ConnectorSyncJobDocument,
  SyncStatus,
  TriggerMethod,
} from "../../connectors";

export function createSyncJob(
  connector: Connector,
  triggerMethod: TriggerMethod,
  now: string,
  cursor?: number
): ConnectorSyncJobDocument {
  return {
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
    count: cursor !== undefined ? 5 : null,
    cursor: cursor ?? null,
    deleted_document_count: 0,
    error: null,
    indexed_document_count: 0,
    indexed_document_volume: 0,
    last_seen: now,
    metadata: {},
    started_at: null,
    status: SyncStatus.PENDING,
    trigger_method: triggerMethod,
    worker_hostname: "",
  };
}
