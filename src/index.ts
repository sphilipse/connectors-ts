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
import { executeSync } from "./connectors/execute_sync";
import { addSyncJob } from "./connectors/sync_jobs/add_sync_job";
import { checkSyncJobs } from "./connectors/sync_jobs/check_sync_jobs";

export const CONNECTORS_INDEX = ".elastic-connectors";
export const CURRENT_CONNECTORS_INDEX = ".elastic-connectors-v1";
export const CONNECTORS_JOBS_INDEX = ".elastic-connectors-sync-jobs";
export const CONNECTORS_VERSION = 1;
export const CRAWLERS_INDEX = ".ent-search-actastic-crawler2_configurations_v2";
export const ANALYTICS_COLLECTIONS_INDEX = ".elastic-analytics-collections";
export const ANALYTICS_VERSION = "1";

const apiKey = "T2JqZXZZUUJOV2NzR2YyU0FiTUs6RG9DRXdfUkFSaTZ5UkFUZWwwbHEzQQ==";
const connectorId = "N7jdvYQBNWcsGf2S47NX";

const client = new Client({
  auth: { apiKey },
  node: "http://localhost:9200",
  tls: { rejectUnauthorized: false },
});

const jiraApiToken = "O45wwBD6SgO8cmzYtTXE8E86";
const jiraUser = "workplace-search@elastic.co";
const hostname = "https://workplace-search.atlassian.net";

export interface Timers {
  checkConnector?: NodeJS.Timer;
  checkIn?: NodeJS.Timer;
  checkSyncJobs?: NodeJS.Timer;
  nextScheduledSync?: NodeJS.Timer;
}

const activeTimers: Timers = {};
let connectorCache: Connector;
fetchConnectorById(client, connectorId)
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
      const newConnector = await fetchConnectorById(client, connectorCache.id);
      const changes = getChanges(connectorCache, newConnector.value);
      await processConnectorChanges(
        client,
        connectorCache,
        changes,
        connectorDefinition
      );
      if (Object.keys(changes).length) {
        connectorCache = newConnector.value;
      }

      if (connectorCache.sync_now) {
        await addSyncJob(client, connectorCache, true);
        client.update({
          index: CONNECTORS_INDEX,
          doc: { sync_now: false },
          id: connectorCache.id,
        });
      }
    }, 1000);
    activeTimers.checkSyncJobs = setInterval(async () => {
      const syncJob = await checkSyncJobs(client, connectorId);
      if (syncJob) {
        await executeSync(client, syncJob, connectorDefinition.fetchSyncData);
      }
    }, 1000);
  })
  .catch((error) =>
    console.error(`Could not fetch connector with id ${connectorId}`, error)
  );
