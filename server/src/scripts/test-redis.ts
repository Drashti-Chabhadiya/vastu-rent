import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from "../lib/redis-cache.js";
import { getRedisStatus, redis } from "../config/redis.js";

async function runTest() {
  console.log("Starting Redis connection and cache tests...");

  // Wait a short moment to ensure connection events trigger
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const status = getRedisStatus();
  console.log(`Redis client status: ${status ? "Connected" : "Disconnected"}`);

  if (!status) {
    console.error("❌ Redis is not connected! Make sure your local Redis server is running.");
    process.exit(1);
  }

  console.log("1. Testing cacheSet...");
  const testData = { greeting: "Hello from Antigravity Redis Cacher!", timestamp: Date.now() };
  await cacheSet("test:key:1", testData, 10);
  console.log("✅ cacheSet complete.");

  console.log("2. Testing cacheGet...");
  const retrieved = await cacheGet<any>("test:key:1");
  console.log("Retrieved data:", retrieved);
  if (retrieved && retrieved.greeting === testData.greeting) {
    console.log("✅ cacheGet verified successfully.");
  } else {
    console.error("❌ cacheGet verification failed!");
  }

  console.log("3. Testing cacheDel...");
  await cacheDel("test:key:1");
  const retrievedAfterDel = await cacheGet<any>("test:key:1");
  if (retrievedAfterDel === null) {
    console.log("✅ cacheDel verified successfully.");
  } else {
    console.error("❌ cacheDel verification failed!");
  }

  console.log("4. Testing cacheDelPattern...");
  await cacheSet("products:list:1", { val: 1 }, 10);
  await cacheSet("products:list:2", { val: 2 }, 10);
  await cacheSet("products:list:other", { val: 3 }, 10);

  console.log("Keys before pattern deletion:");
  console.log("products:list:1:", await cacheGet("products:list:1"));
  console.log("products:list:2:", await cacheGet("products:list:2"));
  console.log("products:list:other:", await cacheGet("products:list:other"));

  console.log("Deleting pattern 'products:list:*'...");
  await cacheDelPattern("products:list:*");

  const val1 = await cacheGet("products:list:1");
  const val2 = await cacheGet("products:list:2");
  const val3 = await cacheGet("products:list:other");

  if (val1 === null && val2 === null && val3 === null) {
    console.log("✅ cacheDelPattern verified successfully.");
  } else {
    console.error("❌ cacheDelPattern verification failed!", { val1, val2, val3 });
  }

  // Disconnect from Redis cleanly
  await redis.disconnect();
  console.log("All tests complete. Exiting...");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
