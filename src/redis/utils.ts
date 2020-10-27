import Redlock from "redlock";
import { client } from "./redisClient";
import { TASK_NAME } from "../config";

type redisGetValue = string | null | Error

const getValue = (key: string): Promise<redisGetValue> => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, value) => {
      if (err) reject(err)
      resolve(value);
    })
  })
}

const setValue = (key: string, value: string) => new Promise((resolve) => client.set(key, value, resolve));

const deleteKey = (key: string) => new Promise((resolve) => {
  client.del(key, resolve)
});

const popTask = (key: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    return client.LPOP(key, (err, task) => {
      if (err) return reject(err);
      else if (task === null) resolve(null);
      resolve(task);
    })
  });
}

const setBeginTime = async (redlock: Redlock) => {
  const lock = await redlock.lock(`locks:${TASK_NAME}_SET_FIRST`, 1000);
  const setFirst = await getValue(`${TASK_NAME}_SET_FIRST`);

  if (setFirst === 'false') {
    const beginTime = new Date().getTime()
    console.log('Setting the begin TIME: ' + beginTime);
    await setValue(`${TASK_NAME}_SET_FIRST`, 'true');
    await setValue(`${TASK_NAME}_BEGIN_TIME`, String(beginTime));
  }

  await lock.unlock();
}

export { getValue, setValue, deleteKey, popTask, setBeginTime }
