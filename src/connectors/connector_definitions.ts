import { ConnectorConfiguration } from "../connectors";
import { fetchSyncData as jiraFetchSyncData } from "./jira/fetch_sync_data";
import { validateConfiguration as jiraValidateConfiguration } from "./jira/validate_configuration";

export type SyncFunction<T> = (
  requestDetails: ConnectorConfiguration,
  cursor?: T
) => Promise<SyncResponse<Array<Record<string, unknown>>, T>>;

export interface SyncResponse<T, U> {
  cursor: U;
  data: T;
  final: boolean;
}

export interface ConnectorDefinition {
  configuration: ConnectorConfiguration;
  fetchSyncData: SyncFunction<number>;
  validateConfiguration: (
    requestDetails: ConnectorConfiguration
  ) => Promise<boolean>;
}

export const CONNECTOR_DEFINITIONS: Partial<
  Record<string, ConnectorDefinition>
> = {
  jira: {
    configuration: {
      api_key: {
        label: "API key",
        value: "",
      },
      host_name: {
        label: "Hostname",
        value: "",
      },
      username: {
        label: "Username",
        value: "",
      },
    },
    fetchSyncData: jiraFetchSyncData,
    validateConfiguration: jiraValidateConfiguration,
  },
};
