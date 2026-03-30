import concurrently from "concurrently";

concurrently(
  [
    {
      command: "npm run dev:client",
      name: "client",
      prefixColor: "blue",
    },
    {
      command: "npm run dev:server",
      name: "server",
      prefixColor: "green",
    },
  ],
  {
    prefix: "[{name}]",
    killOthersOn: ["failure"],
  },
).result.catch(() => {
  process.exit(1);
});
