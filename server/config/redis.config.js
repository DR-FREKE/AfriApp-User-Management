import redis from "redis";
import { promisify } from "util";
import url from "url";

let redisClient;
if (process.env.REDISCLOUD_URL) {
  redisClient = redis.createClient(process.env.REDISCLOUD_URL, {
    no_ready_check: true,
  });
} else {
  redisClient = redis.createClient({ host: "localhost", port: 6379 });
}

redisClient.on("ready", () => console.log("redis is connected"));
redisClient.on("error", () => console.error("error occured"));

const get = promisify(redisClient.get).bind(redisClient);
const set = promisify(redisClient.set).bind(redisClient);
const exists = promisify(redisClient.exists).bind(redisClient);
const expire = promisify(redisClient.expire).bind(redisClient);

export const client = { get, set, exists, expire };

export default redisClient;
