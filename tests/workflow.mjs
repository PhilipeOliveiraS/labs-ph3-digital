import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(
  fs.readFileSync(
    new URL("./fixtures/schema-original.sql", import.meta.url),
    "utf8",
  ),
);
await db.exec(
  fs.readFileSync(
    new URL("../database/002-operation-recovery.sql", import.meta.url),
    "utf8",
  ),
);
const workflows = ["02-execute-offboarding", "03-scheduled-reset"].map((n) =>
  JSON.parse(
    fs.readFileSync(
      new URL("../automation/n8n/n8n-" + n + ".json", import.meta.url),
    ),
  ),
);
for (const w of workflows) {
  const names = new Set(w.nodes.map((n) => n.name));
  assert.equal(names.size, w.nodes.length);
  for (const [name, c] of Object.entries(w.connections)) {
    assert(names.has(name));
    for (const out of c.main)
      for (const edge of out) assert(names.has(edge.node));
  }
  for (const n of w.nodes) {
    if (n.type.endsWith(".httpRequest")) {
      const response = n.parameters.options.response.response;
      assert.equal(response.responseFormat, "text");
      assert.equal(response.fullResponse, true);
      assert.equal(
        response.outputPropertyName,
        "body",
        `${w.name}: ${n.name} must expose body`,
      );
    }
    if (n.onError === "continueErrorOutput")
      assert(w.connections[n.name].main[1].length);
    if (n.parameters.onError) throw Error("Misplaced onError");
  }
}
// n8n text responses use data unless outputPropertyName explicitly overrides it.
function httpResponse(node, statusCode, body) {
  const options = node.parameters.options?.response?.response ?? {};
  assert.equal(options.responseFormat, "text");
  assert.equal(options.fullResponse, true);
  return {
    statusCode,
    [options.outputPropertyName ?? "data"]: JSON.stringify(body),
  };
}
const defaultNode = {
  parameters: {
    options: {
      response: { response: { responseFormat: "text", fullResponse: true } },
    },
  },
};
assert.deepEqual(httpResponse(defaultNode, 200, { ok: true }), {
  statusCode: 200,
  data: '{"ok":true}',
});
const customNode = structuredClone(defaultNode);
customNode.parameters.options.response.response.outputPropertyName = "custom";
assert.deepEqual(httpResponse(customNode, 200, { ok: true }), {
  statusCode: 200,
  custom: '{"ok":true}',
});
let execution = 0;
const external = { erp: false, gcp: false };
let failGcp = true;
const writes = { erp: 0, gcp: 0 };
async function run(w, body = {}) {
  const outputs = {};
  const $execution = { id: "sim-" + ++execution };
  const $ = (name) => ({ first: () => ({ json: outputs[name] }) });
  const env = { GCP_PROJECT_ID: "test-project" };
  const evaluate = (v, $json) =>
    typeof v === "string" && v.startsWith("={{")
      ? new Function(
          "$json",
          "$",
          "$execution",
          "$env",
          "return (" + v.slice(3, -2) + ");",
        )($json, $, $execution, env)
      : v;
  let name = "Receive Request",
    input = { body, webhookUrl: "http://test" };
  let hops = 0;
  while (name) {
    assert(++hops < 90, "Graph did not terminate");
    const n = w.nodes.find((n) => n.name === name);
    let value = input,
      branch = 0;
    if (n.type.endsWith(".code"))
      value = new Function(
        "$json",
        "$",
        "$execution",
        "$env",
        n.parameters.jsCode,
      )(input, $, $execution, env)[0].json;
    else if (n.type.endsWith(".if"))
      branch = evaluate(n.parameters.conditions.conditions[0].leftValue, input)
        ? 0
        : 1;
    else if (n.type.endsWith(".postgres"))
      value = (
        await db.query(
          n.parameters.query,
          evaluate(n.parameters.options.queryReplacement, input),
        )
      ).rows[0];
    else if (n.type.endsWith(".httpRequest")) {
      const erp = n.name.startsWith("ERP"),
        connector = erp ? "erp" : "gcp";
      const reset = w.name.endsWith("Reset");
      if (n.parameters.method === "GET")
        value = httpResponse(
          n,
          200,
          erp
            ? reset
              ? { reset_baseline: !external.erp }
              : { license_status: external.erp ? "REVOKED" : "ACTIVE" }
            : {
                email:
                  "demo-employee-identity@test-project.iam.gserviceaccount.com",
                disabled: external.gcp,
              },
        );
      else {
        writes[connector]++;
        if (!erp && failGcp) value = httpResponse(n, 403, {});
        else {
          external[connector] = !reset;
          value = httpResponse(
            n,
            200,
            erp
              ? reset
                ? { reset: true }
                : { license_status: "REVOKED" }
              : {},
          );
        }
      }
    } else if (n.type.endsWith(".respondToWebhook"))
      return evaluate(n.parameters.responseBody, input);
    outputs[name] = value;
    const edge = w.connections[name]?.main[branch]?.[0];
    input = value;
    name = edge?.node;
  }
  throw Error("No response");
}
const first = await run(workflows[0], {
  target_email: "john.carter@demo-corp.com",
});
assert.equal(first.operation.status, "partial");
assert.equal(first.dashboard.employees[0].status, "PARTIAL");
failGcp = false;
const second = await run(workflows[0], {
  target_email: "john.carter@demo-corp.com",
  operation_id: first.operation.id,
});
assert.equal(second.success, true);
assert.equal(second.dashboard.employees[0].status, "OFFBOARDED");
assert.deepEqual(writes, { erp: 1, gcp: 2 });
await run(workflows[0], { target_email: "john.carter@demo-corp.com" });
assert.deepEqual(writes, { erp: 1, gcp: 2 });
const reset = await run(workflows[1]);
assert.equal(reset.operation.status, "succeeded");
assert(reset.dashboard.employees.every((e) => e.status === "ACTIVE"));
const stale = await run(workflows[0], {
  target_email: "john.carter@demo-corp.com",
  operation_id: first.operation.id,
});
assert.equal(stale.code, "OPERATION_EXPIRED");
const invalid = await run(workflows[0], { target_email: "not an email" });
assert.equal(invalid.http_status, 400);
// Reproduce the original missing-body defect through the graph, not a forced body fixture.
const brokenOffboard = structuredClone(workflows[0]);
delete brokenOffboard.nodes.find((n) => n.name === "ERP Inspect").parameters
  .options.response.response.outputPropertyName;
const broken = await run(brokenOffboard, {
  target_email: "ellen.ripley@demo-corp.com",
});
assert.equal(broken.success, false);
assert.equal(broken.operation.status, "partial");
const brokenErp = broken.operation.connectors.find((c) => c.name === "erp");
assert.equal(brokenErp.status, "failed");
assert.equal(brokenErp.writes, 0);
assert.equal(brokenErp.detail.code, "STATE_READ_FAILED");
const brokenReset = structuredClone(workflows[1]);
delete brokenReset.nodes.find((n) => n.name === "ERP Inspect").parameters
  .options.response.response.outputPropertyName;
const resetFailure = await run(brokenReset);
assert.equal(resetFailure.success, false);
assert.equal(resetFailure.operation.status, "partial");
assert.equal(
  resetFailure.operation.connectors.find((c) => c.name === "erp").detail.code,
  "STATE_READ_FAILED",
);
const getWorkflow = JSON.parse(
  fs.readFileSync(
    new URL(
      "../automation/n8n/n8n-01-get-dashboard-data.json",
      import.meta.url,
    ),
  ),
);
const dashboard = (
  await db.query(
    getWorkflow.nodes.find((n) => n.type.endsWith(".postgres")).parameters
      .query,
  )
).rows[0].data;
assert.equal(dashboard.maintenance, true);
assert.equal(dashboard.employees.length, 7);
console.log(
  "PASS: eight explicit body mappings; default data and custom response properties; missing-body regressions in offboarding/reset; workflow 01 dashboard.",
);
console.log(
  "PASS: workflow graph simulation with PostgreSQL functions and mocked HTTP: first attempt, selective resume, repeated delivery, reset, stale cycle, invalid input.",
);
await db.close();
