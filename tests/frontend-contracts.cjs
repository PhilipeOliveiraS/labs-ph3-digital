const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const repo = require("node:path").resolve(__dirname, "..");
const localRequire = createRequire(repo + "/package.json");
const ts = localRequire("typescript");
const { PGlite } = require("@electric-sql/pglite");
let checks = 0;
let transport;
let timerCallback;
let timerCleared = false;
const fakeEnvironment = {
  N8N_GET_DATA_URL: "https://automation.invalid/dashboard",
  N8N_OFFBOARD_URL: "https://automation.invalid/offboard",
  N8N_REPORT_URL: "https://automation.invalid/report",
};
function load(relative, overrides = {}) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(repo + "/" + relative, "utf8"),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  vm.runInNewContext(
    code,
    {
      exports,
      Error,
      URL,
      Request,
      Response,
      AbortController,
      DOMException,
      process: { env: fakeEnvironment },
      setTimeout: (callback) => {
        timerCallback = callback;
        timerCleared = false;
        return 1;
      },
      clearTimeout: () => {
        timerCleared = true;
      },
      fetch: (...args) => transport(...args),
      require: (name) =>
        name === "@/lib/iam-hr" ? library : localRequire(name),
      ...overrides,
    },
    { filename: relative },
  );
  return exports;
}
const library = load("lib/iam-hr.ts");
const route = load("app/api/iam-hr/route.ts");
const check = async (name, fn) => {
  await fn();
  checks++;
  console.log("PASS:", name);
};
const respond = (data, status = 200) => {
  transport = async () => Response.json(data, { status });
};
const post = (type, body) =>
  route.POST(
    new Request("http://local.invalid/api/iam-hr?type=" + type, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
const email = "john.carter@demo-corp.com";
(async () => {
  const db = new PGlite();
  try {
    await db.exec(
      fs.readFileSync(__dirname + "/fixtures/schema-original.sql", "utf8"),
    );
    await db.exec(
      fs.readFileSync(
        __dirname + "/../database/002-operation-recovery.sql",
        "utf8",
      ),
    );
    const call = async (sql, args = []) =>
      (await db.query(sql, args)).rows[0].data;
    const dashboard = () => call("SELECT iam_dashboard() data");
    const next = (id, owner) =>
      call("SELECT iam_next($1,$2) data", [id, owner]);
    const record = (id, owner, connector, status) =>
      call("SELECT iam_record($1,$2,$3,$4,$5) data", [
        id,
        owner,
        connector,
        status,
        "{}",
      ]);
    await check(
      "workflow 01 SQL dashboard normalizes twice and retains recovery metadata",
      async () => {
        const raw = await dashboard();
        respond(raw);
        const response = await route.GET();
        assert.equal(response.status, 200);
        const normalized = library.normalizeDashboard(await response.json());
        assert.equal(normalized.employees.length, 7);
        assert.equal(library.hasRecoveryContract(normalized), true);
        assert.equal(normalized.metrics.avg_processing_ms, null);
        assert.equal(response.headers.get("cache-control"), "no-store");
      },
    );
    const begin = await call("SELECT iam_begin($1,$2,$3,$4) data", [
      "offboard",
      email,
      null,
      "contract-1",
    ]);
    const id = begin.operation_id;
    await next(id, "contract-1");
    await record(id, "contract-1", "erp", "succeeded");
    await next(id, "contract-1");
    await record(id, "contract-1", "gcp", "failed");
    const partial = (await next(id, "contract-1")).operation;
    const partialReply = {
      success: false,
      operation: partial,
      status: "partial",
      dashboard: await dashboard(),
    };
    await check(
      "HTTP 200 partial snapshot remains partial and operation_id is forwarded",
      async () => {
        transport = async (url, init) => {
          assert.equal(JSON.parse(init.body).operation_id, String(id));
          assert.equal(init.cache, "no-store");
          return Response.json(partialReply);
        };
        const response = await post("offboard", {
          target_email: email,
          operation_id: String(id),
        });
        assert.equal(response.status, 200);
        const data = await response.json();
        assert.equal(data.success, false);
        assert.equal(
          library.normalizeOffboarding(data, email).employees[0].Status,
          "PARTIAL",
        );
      },
    );
    await check(
      "legacy offboarding success without operation/dashboard is rejected",
      async () => {
        respond({ success: true, message: "Offboarding Complete" });
        assert.equal(
          (await post("offboard", { target_email: email })).status,
          502,
        );
      },
    );
    await check("contradictory success is rejected", async () => {
      respond({ ...partialReply, success: true });
      assert.equal(
        (await post("offboard", { target_email: email })).status,
        502,
      );
    });
    await check(
      "mismatched selected employee cannot populate the dashboard",
      async () => {
        respond(partialReply);
        assert.equal(
          (await post("offboard", { target_email: "other@example.com" }))
            .status,
          502,
        );
      },
    );
    await check("malformed connector list is rejected", async () => {
      const raw = structuredClone(partialReply);
      raw.dashboard.employees[0].operation.connectors = [];
      respond(raw);
      assert.equal(
        (await post("offboard", { target_email: email })).status,
        502,
      );
    });
    await call("SELECT iam_begin($1,$2,$3,$4) data", [
      "offboard",
      email,
      id,
      "contract-2",
    ]);
    await next(id, "contract-2");
    await record(id, "contract-2", "gcp", "unknown");
    const unknown = (await next(id, "contract-2")).operation;
    await check(
      "unknown operation remains uncertain, without invented success",
      async () => {
        respond({
          success: false,
          operation: unknown,
          dashboard: await dashboard(),
        });
        const response = await post("offboard", {
          target_email: email,
          operation_id: String(id),
        });
        assert.equal(response.status, 200);
        assert.equal(
          (await response.json()).dashboard.employees[0].Status,
          "UNKNOWN",
        );
      },
    );
    await call("SELECT iam_resolve_unknown($1,$2,$3) data", [
      id,
      "gcp",
      "Simulated stopped execution and inspected state.",
    ]);
    await call("SELECT iam_begin($1,$2,$3,$4) data", [
      "offboard",
      email,
      id,
      "contract-3",
    ]);
    await next(id, "contract-3");
    await record(id, "contract-3", "gcp", "succeeded");
    const complete = (await next(id, "contract-3")).operation;
    const completeDashboard = await dashboard();
    await check(
      "completed operation and real processing metric agree",
      async () => {
        respond({
          success: true,
          operation: complete,
          dashboard: completeDashboard,
        });
        const response = await post("offboard", {
          target_email: email,
          operation_id: String(id),
        });
        const data = await response.json();
        assert.equal(response.status, 200);
        assert.equal(data.dashboard.employees[0].Status, "OFFBOARDED");
        assert.equal(data.dashboard.metrics.successful_count, 1);
        assert.equal(
          data.dashboard.metrics.avg_processing_ms,
          complete.processing_ms,
        );
      },
    );
    const reset = await call("SELECT iam_begin($1,$2,$3,$4) data", [
      "reset",
      "*",
      null,
      "contract-reset",
    ]);
    await next(reset.operation_id, "contract-reset");
    await record(reset.operation_id, "contract-reset", "erp", "succeeded");
    await next(reset.operation_id, "contract-reset");
    await record(reset.operation_id, "contract-reset", "gcp", "succeeded");
    await next(reset.operation_id, "contract-reset");
    await check(
      "workflow 03 reset removes prior operations and advances cycle",
      async () => {
        const normalized = library.normalizeDashboard(await dashboard());
        assert.equal(normalized.cycle, "2");
        assert(
          normalized.employees.every(
            (employee) =>
              employee.Status === "ACTIVE" && employee.Operation === null,
          ),
        );
      },
    );
    await check("HTTP errors preserve status and code", async () => {
      for (const status of [400, 409, 429, 500, 503]) {
        respond(
          { success: false, code: "OPERATION_BUSY", error: "OPERATION_BUSY" },
          status,
        );
        const response = await post("offboard", { target_email: email });
        assert.equal(response.status, status);
        await assert.rejects(
          library.readApiResponse(response),
          /OPERATION_BUSY/,
        );
      }
    });
    await check(
      "empty/HTML bodies never count as success and retain HTTP errors",
      async () => {
        for (const [status, body, expected] of [
          [200, "", 502],
          [200, "<html>ok</html>", 502],
          [502, "<html>bad gateway</html>", 502],
          [429, "", 429],
          [204, null, 502],
        ]) {
          transport = async () => new Response(body, { status });
          const response = await post("offboard", { target_email: email });
          assert.equal(response.status, expected);
          assert.equal((await response.json()).success, false);
        }
      },
    );
    await check("timeout covers body consumption and returns 504", async () => {
      transport = async (_url, init) => ({
        status: 200,
        text: async () => {
          assert.equal(timerCleared, false);
          timerCallback();
          assert.equal(init.signal.aborted, true);
          throw new DOMException("Aborted", "AbortError");
        },
      });
      const response = await post("offboard", { target_email: email });
      assert.equal(response.status, 504);
      assert.equal((await response.json()).code, "OPERATION_TIMEOUT");
      assert.equal(timerCleared, true);
    });
    await check(
      "legacy aliases/n8n wrappers remain readable but cannot enable actions",
      () => {
        const data = library.normalizeDashboard({
          data: [
            {
              json: {
                Nome: "Legacy",
                "E-mail": "legacy@example.com",
                state: "active",
                Grupos: ["A", "B"],
              },
            },
          ],
        });
        assert.equal(data.employees[0].FullName, "Legacy");
        assert.equal(data.employees[0].Status, "ACTIVE");
        assert.equal(library.hasRecoveryContract(data), false);
      },
    );
    await check(
      "malformed dashboard cannot masquerade as an empty employee list",
      async () => {
        for (const raw of [
          { success: true },
          { employees: [null] },
          { employees: [{}] },
          { employees: [], cycle: "1" },
          { employees: [], error: "failed" },
        ]) {
          respond(raw);
          assert.equal((await route.GET()).status, 502);
        }
      },
    );
    await check(
      "invalid input is rejected before any upstream call",
      async () => {
        transport = () => {
          throw new Error("Unexpected upstream call");
        };
        for (const body of [
          null,
          [],
          {},
          { target_email: "invalid" },
          { target_email: email, operation_id: "x" },
        ]) {
          assert.equal((await post("offboard", body)).status, 400);
        }
        assert.equal((await post("invalid", {})).status, 400);
      },
    );
    await check(
      "handover fields are retained and delivery requires explicit success",
      async () => {
        transport = async (_url, init) => {
          const body = JSON.parse(init.body);
          assert.equal(body.target_employee, "John Carter");
          assert.equal(body.visitor_email, "visitor@example.com");
          return Response.json({ success: true, audit_logged: false });
        };
        const body = {
          target_employee: "John Carter",
          visitor_email: "visitor@example.com",
        };
        const response = await post("report", body);
        assert.equal(response.status, 200);
        assert.equal((await response.json()).audit_logged, false);
        respond({ message: "workflow started" });
        assert.equal((await post("report", body)).status, 502);
        respond({ success: false, error: "Email rejected" });
        assert.equal(
          (await (await post("report", body)).json()).success,
          false,
        );
      },
    );
    // Render only the component with seeded selection; all network hooks are stubbed.
    await check(
      "partial/success UI keeps connector states and gates handover",
      () => {
        const React = localRequire("react");
        const { renderToStaticMarkup } = localRequire("react-dom/server");
        let hook = 0;
        const component = load("components/ph3/iam-hr-demo.tsx", {
          require: (name) => {
            if (name === "react")
              return {
                ...React,
                useState: (initial) => [
                  hook++ === 0 ? email : initial,
                  () => {},
                ],
              };
            if (name === "swr")
              return {
                useSWRConfig: () => ({
                  mutate: () => {
                    throw new Error("Unexpected mutation");
                  },
                }),
              };
            if (name === "@/lib/iam-hr") return library;
            if (name.startsWith("@/components/ui/"))
              return {
                Button: (props) => React.createElement("button", props),
                Input: (props) => React.createElement("input", props),
              };
            return localRequire(name);
          },
        });
        const render = (raw) => {
          hook = 0;
          return renderToStaticMarkup(
            React.createElement(component.IamHrDemo, {
              employees: library.normalizeDashboard(raw).employees,
              isLoading: false,
            }),
          );
        };
        const partialHtml = render(partialReply.dashboard);
        assert(partialHtml.includes("Resume pending connectors"));
        assert(partialHtml.includes("Offboarding partially completed"));
        assert(!partialHtml.includes("Access Revoked Successfully"));
        assert(!partialHtml.includes("Send handover report"));
        const successHtml = render(completeDashboard);
        assert(successHtml.includes("Access Revoked Successfully"));
        assert(successHtml.includes("Send handover report"));
        assert(successHtml.includes("GCP IAM (shared demo identity)"));
      },
    );
    console.log(
      `PASS: ${checks} local frontend/API contract groups; fetch fully mocked, PostgreSQL in memory.`,
    );
  } finally {
    await db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
