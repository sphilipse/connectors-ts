import * as http from "node:http";
import * as path from "node:path";

const PORT = 8000;

const mockTicket = (index: number) => `{
  "self": "https://workplace-search.atlassian.net/rest/api/3/issue/${index}",
  "expand": "operations,versionedRepresentations,editmeta,changelog,customfield_10010.requestTypePractice,renderedFields",
  "id": ${index},
  "fields": {
    "statuscategorychangedate": "2022-02-11T06:40:30.428-0600",
    "issuetype": {
      "avatarId": 10318,
      "hierarchyLevel": 0,
      "name": "Task",
      "self": "https://workplace-search.atlassian.net/rest/api/3/issuetype/10002",
      "description": "A small, distinct piece of work.",
      "id": "10002",
      "iconUrl": "https://workplace-search.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
      "subtask": false
    },
    "timespent": null,
    "project": {
      "simplified": false,
      "avatarUrls": {
        "48x48": "https://workplace-search.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10403",
        "24x24": "https://workplace-search.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10403?size=small",
        "16x16": "https://workplace-search.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10403?size=xsmall",
        "32x32": "https://workplace-search.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10403?size=medium"
      },
      "name": "workplace-search",
      "self": "https://workplace-search.atlassian.net/rest/api/3/project/10000",
      "id": "10000",
      "projectTypeKey": "software",
      "key": "SMWS"
    },
    "customfield_10032": null,
    "fixVersions": [],
    "customfield_10033": null,
    "customfield_10034": null,
    "aggregatetimespent": null,
    "customfield_10035": null,
    "resolution": null,
    "customfield_10036": null,
    "customfield_10037": null,
    "customfield_10027": null,
    "resolutiondate": null,
    "workratio": -1,
    "lastViewed": "2022-12-06T12:06:34.782-0600",
    "watches": {
      "self": "https://workplace-search.atlassian.net/rest/api/3/issue/SMWS-24/watchers",
      "isWatching": true,
      "watchCount": 1
    },
    "created": "2022-02-11T06:40:29.601-0600",
    "customfield_10020": null,
    "customfield_10021": null,
    "customfield_10022": null,
    "customfield_10023": null,
    "priority": {
      "name": "Medium",
      "self": "https://workplace-search.atlassian.net/rest/api/3/priority/3",
      "iconUrl": "https://workplace-search.atlassian.net/images/icons/priorities/medium.svg",
      "id": "3"
    },
    "customfield_10024": null,
    "customfield_10025": [],
    "customfield_10026": null,
    "labels": [],
    "customfield_10016": null,
    "customfield_10017": null,
    "customfield_10018": {
      "hasEpicLinkFieldDependency": false,
      "showField": false,
      "nonEditableReason": {
        "reason": "PLUGIN_LICENSE_ERROR",
        "message": "The Parent Link is only available to Jira Premium users."
      }
    },
    "customfield_10019": "0|i000wf:",
    "aggregatetimeoriginalestimate": null,
    "timeestimate": null,
    "versions": [],
    "issuelinks": [],
    "assignee": null,
    "updated": "2022-02-11T06:49:08.130-0600",
    "status": {
      "name": "To Do",
      "self": "https://workplace-search.atlassian.net/rest/api/3/status/10000",
      "description": "",
      "iconUrl": "https://workplace-search.atlassian.net/",
      "id": "10000",
      "statusCategory": {
        "colorName": "blue-gray",
        "name": "To Do",
        "self": "https://workplace-search.atlassian.net/rest/api/3/statuscategory/2",
        "id": 2,
        "key": "new"
      }
    },
    "components": [],
    "timeoriginalestimate": null,
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "text": "content from description",
              "type": "text"
            }
          ]
        }
      ]
    },
    "customfield_10010": null,
    "customfield_10014": null,
    "customfield_10015": null,
    "customfield_10005": null,
    "customfield_10006": null,
    "customfield_10007": null,
    "security": null,
    "customfield_10008": null,
    "aggregatetimeestimate": null,
    "customfield_10009": null,
    "summary": "Attachment Test",
    "creator": {
      "accountId": "5dd6bd2ab5933d0eefaf6fdb",
      "emailAddress": "workplace-search@elastic.co",
      "avatarUrls": {
        "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5dd6bd2ab5933d0eefaf6fdb/1c803373-e627-4163-8543-67f27192f662/48",
        "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5dd6bd2ab5933d0eefaf6fdb/1c803373-e627-4163-8543-67f27192f662/24",
        "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5dd6bd2ab5933d0eefaf6fdb/1c803373-e627-4163-8543-67f27192f662/16",
        "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5dd6bd2ab5933d0eefaf6fdb/1c803373-e627-4163-8543-67f27192f662/32"
      },
      "displayName": "Randy Swift",
      "accountType": "atlassian",
      "self": "https://workplace-search.atlassian.net/rest/api/3/user?accountId=5dd6bd2ab5933d0eefaf6fdb",
      "active": true,
      "timeZone": "UTC"
    },
    "subtasks": [],
    "reporter": {
      "accountId": "5dd6bd2ab5933d0eefaf6fdb",
      "emailAddress": "workplace-search@elastic.co",
      "avatarUrls": {
        "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5dd6bd2ab5933d0eefaf6fdb/1c803373-e627-4163-8543-67f27192f662/48",
        "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5dd6bd2ab5933d0eefaf6fdb/1c803373-e627-4163-8543-67f27192f662/24",
        "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5dd6bd2ab5933d0eefaf6fdb/1c803373-e627-4163-8543-67f27192f662/16",
        "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5dd6bd2ab5933d0eefaf6fdb/1c803373-e627-4163-8543-67f27192f662/32"
      },
      "displayName": "Randy Swift",
      "accountType": "atlassian",
      "self": "https://workplace-search.atlassian.net/rest/api/3/user?accountId=5dd6bd2ab5933d0eefaf6fdb",
      "active": true,
      "timeZone": "UTC"
    },
    "aggregateprogress": {
      "total": 0,
      "progress": 0
    },
    "customfield_10001": null,
    "customfield_10002": null,
    "customfield_10003": null,
    "customfield_10004": null,
    "customfield_10038": null,
    "environment": null,
    "duedate": null,
    "progress": {
      "total": 0,
      "progress": 0
    },
    "votes": {
      "hasVoted": false,
      "self": "https://workplace-search.atlassian.net/rest/api/3/issue/SMWS-24/votes",
      "votes": 0
    }
  },
  "key": "SMWS-24"
}`;

http
  .createServer(async (req, res) => {
    console.log(req.url);
    const url = new URL(`localhost:8000/${req.url}`);
    const maxResults = Number(url.searchParams.get("maxResults")) ?? 10;
    const startAt = Number(url.searchParams.get("startAt")) ?? 0;
    const statusCode = 200;
    const mimeType = "application/json";
    res.writeHead(statusCode, { "Content-Type": mimeType });
    res.write(`{"total": ${1000000}, "issues": [`);
    for (let index = 0; index < maxResults; index += 1) {
      res.write(mockTicket(index + startAt));
      if (index < maxResults - 1) {
        res.write(",");
      }
    }
    res.write("]}");
    res.end();
    console.log(`${req.method} ${req.url} ${statusCode}`);
  })
  .listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
