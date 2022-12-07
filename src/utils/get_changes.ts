import { Client } from "@elastic/elasticsearch";
import { isDeepEqual } from "./deep_equal";
import { Connector, ConnectorStatus } from "../connectors";
import { fetchConnectorById } from "../connectors/fetch_connector";
import { validateConfiguration } from "../connectors/jira/validate_configuration";
import { ConnectorDefinition } from "../connectors/connector_definitions";
import { CONNECTORS_INDEX } from "..";

export function getChanges<T extends object>(
  oldObject: T,
  newObject: T
): Partial<T> {
  if (!isDeepEqual(oldObject, newObject)) {
    const changes = Object.keys({
      ...oldObject,
      ...newObject,
    }).reduce(
      (prev: Partial<T>, curr) =>
        !isDeepEqual(oldObject[curr as keyof T], newObject[curr as keyof T])
          ? { ...prev, [curr]: newObject[curr as keyof T] }
          : prev,
      {}
    );
    // if (changes.configuration) {
    //   const validated = await connectorDefinition.validateConfiguration(
    //     changes.configuration
    //   );
    //   if (validated) {
    //     await client.update({
    //       doc: { status: ConnectorStatus.CONNECTED },
    //       id: cachedConnector.id,
    //       index: CONNECTORS_INDEX,
    //     });
    //   } else {
    //     // TODO: logic for failed configuration
    //   }
    // }
    return changes;
  }
  return {};
}
