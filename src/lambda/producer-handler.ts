import { Client } from "@elastic/elasticsearch";
import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import {
  ConnectorDefinition,
  CONNECTOR_DEFINITIONS,
} from "../connectors/connector_definitions";
import { fetchConnectorById } from "../connectors/fetch_connector";
import { addSyncJob } from "../connectors/sync_jobs/add_sync_job";
import { CONNECTORS_INDEX } from "../constants";

export const produceJobsHandler: Handler<
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2<void>
> = async (event) => {
  try {
    if (!event.body) {
      throw new Error("No body provided");
    }
    const { apiKey, connectorId, url } = JSON.parse(event.body);
    const client = new Client({
      auth: { apiKey },
      node: url,
      tls: { rejectUnauthorized: false },
    });

    const connectorDefinition: ConnectorDefinition =
      CONNECTOR_DEFINITIONS["jira"]!;

    const connector = await fetchConnectorById(client, connectorId);
    if (connector.value.sync_now) {
      await client.update({
        index: CONNECTORS_INDEX,
        doc: { sync_now: false },
        id: connector.value.id,
        if_seq_no: connector.seqNo,
        if_primary_term: connector.primaryTerm,
        refresh: true,
      });
      const cursors = await connectorDefinition.fetchJobCursors(
        connector.value.configuration
      );
      for (const cursor of cursors) {
        await addSyncJob(client, connector.value, true, cursor);
      }
      return {
        statusCode: 200,
        body: `Added ${cursors.length} sync jobs for connector ${connector.value.id}`,
      };
    }
    return {
      statusCode: 200,
      body: `No sync needed for connector ${connector.value.id}`,
    };
  } catch (error) {
    console.error(error);
    return {
      body: `${typeof error === "object" ? JSON.stringify(error) : error}`,
      statusCode: 500,
    };
  }
};
