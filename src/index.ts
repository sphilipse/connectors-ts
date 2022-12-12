/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Client } from "@elastic/elasticsearch";
import { Connector } from "./connectors";
import { getChanges } from "./utils/get_changes";
import { checkIn } from "./connectors/connector_check_in";
import { fetchConnectorById } from "./connectors/fetch_connector";
import { updateConnectorConfiguration } from "./connectors/update_connector_configuration";
import { CONNECTOR_DEFINITIONS } from "./connectors/connector_definitions";
import { processConnectorChanges } from "./connectors/process_connector";
import { syncJobTask } from "./connectors/sync_jobs/sync_job_task";
import { checkConnectorTask } from "./connectors/check_connector_task";

const client = new Client({
  auth: { apiKey: "apiKey" },
  node: "URL",
  tls: { rejectUnauthorized: false },
});

export interface Timers {
  checkConnector?: NodeJS.Timer;
  checkIn?: NodeJS.Timer;
  checkSyncJobs?: NodeJS.Timer;
  nextScheduledSync?: NodeJS.Timer;
}

const activeTimers: Timers = {};
let connectorCheckInProgress = false;
let connectorCache: Connector;
fetchConnectorById(client, "connectorId")
  .then(async (newConnector) => {
    if (!newConnector.value) throw new Error("Connector not found");
    connectorCache = newConnector.value;
    const connectorDefinition = CONNECTOR_DEFINITIONS["jira"];
    if (!connectorDefinition)
      throw new Error("Could not find connector definition");

    await updateConnectorConfiguration(
      client,
      connectorCache,
      connectorDefinition.configuration
    );
    await checkIn(client, connectorCache);
    activeTimers.checkIn = setInterval(
      () => {
        checkIn(client, connectorCache);
      },
      25 * 60 * 1000 // 25 minutes
    );
    const changes = getChanges({} as Connector, connectorCache);
    await processConnectorChanges(
      client,
      connectorCache,
      changes,
      connectorDefinition
    );

    activeTimers.checkConnector = setInterval(async () => {
      if (!connectorCheckInProgress) {
        try {
          connectorCheckInProgress = true;
          const newConnector = await checkConnectorTask(
            client,
            connectorCache,
            connectorDefinition
          );
          connectorCache = newConnector;
          connectorCheckInProgress = false;
        } catch (error) {
          console.error(error);
          connectorCheckInProgress = false;
        }
      }
    }, 1000);
    activeTimers.checkSyncJobs = setInterval(
      async () =>
        syncJobTask(client, connectorId, connectorDefinition.fetchSyncData),
      1000
    );
  })
  .catch((error) =>
    console.error(`Could not fetch connector with id ${connectorId}`, error)
  );
