import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_INDEX } from "..";
import { Connector, ConnectorStatus } from "../connectors";
import { ConnectorDefinition } from "./connector_definitions";

export async function processConnectorChanges(
  client: Client,
  connector: Connector,
  changes: Partial<Connector>,
  connectorDefinition: ConnectorDefinition
) {
  if (changes.configuration) {
    const validated = await connectorDefinition.validateConfiguration(
      changes.configuration
    );
    if (validated) {
      await client.update({
        doc: { status: ConnectorStatus.CONNECTED },
        id: connector.id,
        index: CONNECTORS_INDEX,
      });
    } else {
      // TODO: logic for failed configuration
    }
  }
}
