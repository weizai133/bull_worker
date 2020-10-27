import { client } from "./redis/redisClient";
import { deleteKey, setValue } from "./redis/utils";
import { TASK_NAME, TASK_AMOUNT } from "./config";

client.on('ready', async () => {
  await deleteKey(TASK_NAME);

  for (let i = 0; i < TASK_AMOUNT; i++) {
    client.lpush(TASK_NAME, `task-${i}`);
  }

  await setValue(`${TASK_NAME}_TOTAL`, `${TASK_AMOUNT}`)
  await setValue(`${TASK_NAME}_CUR_INDEX`, '0')
  await setValue(`${TASK_NAME}_SET_FIRST`, 'false')
  await deleteKey(`${TASK_NAME}_BEGIN_TIME`)

  client.lrange(TASK_NAME, 0, TASK_AMOUNT, (err, values) => {
    if (err) return console.log(err);

    console.log(values);
    process.exit();
  });
});