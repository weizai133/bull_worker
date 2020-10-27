import { client } from "./redis/redisClient";
import { tasksHandler } from "./taskHandler";

client.on('connect', (err) => {
  if (err) return console.log(err);
  console.log('Redis is connected!');
});

client.on('ready', async () => {
  console.log('Redis is ready and Handling Tasks');
  await tasksHandler();
});

client.on('error', (err) => {
  console.log('Redis error: ', err)
  process.exit();
});