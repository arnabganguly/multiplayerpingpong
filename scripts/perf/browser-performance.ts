const targetUrl = process.env.PINGPONG_PUBLIC_URL ?? "http://localhost:5173";

console.log(
  JSON.stringify(
    {
      check: "browser-performance",
      targetUrl,
      budgets: {
        desktopFpsP95: 55,
        mobileFpsP95: 30,
        localInputP95Ms: 50,
        startupBroadbandMs: 3000,
        startupMobileMs: 5000
      },
      command:
        "Run Playwright performance traces against the target URL and compare to these budgets."
    },
    null,
    2
  )
);
