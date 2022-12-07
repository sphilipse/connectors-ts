/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Client } from "@elastic/elasticsearch";
import { isDeepEqual } from "../utils/deep_equal";
import { CONNECTORS_INDEX } from "..";
import {
  Connector,
  ConnectorConfiguration,
  ConnectorStatus,
} from "../connectors";

export async function updateConnectorConfiguration(
  client: Client,
  connector: Connector,
  configuration: ConnectorConfiguration
) {
  console.log("Updating connector configuration");
  const expectedKeys = Object.keys(connector.configuration);
  const actualKeys = Object.keys(configuration);
  if (!isDeepEqual(expectedKeys, actualKeys)) {
    console.log("updating config");
    await client.update({
      id: connector.id,
      index: CONNECTORS_INDEX,
      doc: {
        configuration,
        last_seen: new Date().toISOString(),
        status: ConnectorStatus.NEEDS_CONFIGURATION,
      },
    });
  }
}
