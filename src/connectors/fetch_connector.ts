/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Client } from "@elastic/elasticsearch";
import { CONNECTORS_INDEX } from "../constants";
import { Connector, ConnectorDocument } from "../connectors";
import { OptimisticConcurrency } from "../utils/optimistic_concurrency";

export const fetchConnectorById = async (
  client: Client,
  connectorId: string
): Promise<OptimisticConcurrency<Connector>> => {
  const connectorResult = await client.get<ConnectorDocument>({
    id: connectorId,
    index: CONNECTORS_INDEX,
  });
  if (!connectorResult._source) {
    throw new Error(`Connector with id ${connectorId} does not exist`);
  }
  return {
    primaryTerm: connectorResult._primary_term,
    seqNo: connectorResult._seq_no,
    value: { ...connectorResult._source, id: connectorResult._id },
  };
};
