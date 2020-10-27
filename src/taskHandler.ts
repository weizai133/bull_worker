import Redlock from "redlock";
import { client } from "./redis/redisClient";
import { popTask, setBeginTime, getValue, setValue, deleteKey } from "./redis/utils";
import { TASK_NAME, TASK_AMOUNT } from "./config";

const redlock = new Redlock([client], {
  retryCount: 100,
  retryDelay: 200
});

const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

const handleTask = (task: string, curIndex: number) => {
  return new Promise(async (resolve) => {
      const lock = await redlock.lock(`locks:${TASK_NAME}_CUR_INDEX`, 1000);
      console.log(`Handling task ${task}...`);
      await setValue(`${TASK_NAME}_CUR_INDEX`, String(curIndex + 1));
      await lock.unlock().then(() => console.log(`Unlock task ${task}`));
      await sleep(2000);
      resolve();
  });
}

const tasksHandler = async () => {
  const curIndex = Number(await getValue(`${TASK_NAME}_CUR_INDEX`));
  const beginTime = await getValue(`${TASK_NAME}_BEGIN_TIME`);
  const taskAmountTotal = Number(await getValue(`${TASK_NAME}_TOTAL`));

  if (!beginTime) await setBeginTime(redlock);
  
  if (taskAmountTotal === 0) {
    console.log('No Tasks, waiting for the new tasks');
    await sleep(3000);
    await tasksHandler();
    return;
  }

  if (curIndex === TASK_AMOUNT) {
    const timeCost = new Date().getTime() - Number(beginTime);
    console.log(`All tasks have been processed! Time cost: ${timeCost}ms. ${beginTime}`);

    await setValue(`${TASK_NAME}_TOTAL`, '0');
    await setValue(`${TASK_NAME}_CUR_INDEX`, '0');
    await setValue(`${TASK_NAME}_SET_FIRST`, 'false');
    await deleteKey(`${TASK_NAME}_BEGIN_TIME`);

    await tasksHandler()
    return;
  }

  const task = await popTask(TASK_NAME);
  if (task !== null) await handleTask(task, curIndex);

  await tasksHandler();
}

export { tasksHandler }