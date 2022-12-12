import { Client } from "@elastic/elasticsearch";
import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { JobResponse } from "../connectors";
import {
  ConnectorDefinition,
  CONNECTOR_DEFINITIONS,
} from "../connectors/connector_definitions";
import { syncJobTask } from "../connectors/sync_jobs/sync_job_task";

export const consumeJobsHandler: Handler<
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2<JobResponse>
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

    const response = await syncJobTask(
      client,
      connectorId,
      connectorDefinition.fetchSyncData
    );
    return {
      body: JSON.stringify(response),
      statusCode: 200,
    };
  } catch (error) {
    console.error(error);
    return {
      body: `${typeof error === "object" ? JSON.stringify(error) : error}`,
      statusCode: 500,
    };
  }
};
