import Redis from "redis";

const client = Redis.createClient({
  host: process.env!.REDIS_HOST,
  port: Number(process.env!.REDIS_PORT)
});


export { client };