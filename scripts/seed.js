const { runSeed } = require("../src/services/SeedService");

runSeed({ closePool: true })
  .then(() => {
    console.log("Seed completed.");
    console.log("Admin login: admin@example.com / StrongPassword123");
    console.log("Buyer login mobile: +919999999999");
  })
  .catch((error) => {
    console.error("Seed failed.", error);
    process.exitCode = 1;
  });
