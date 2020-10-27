"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksHandler = void 0;
const redlock_1 = __importDefault(require("redlock"));
const redisClient_1 = require("./redis/redisClient");
const utils_1 = require("./redis/utils");
const config_1 = require("./config");
const redlock = new redlock_1.default([redisClient_1.client], {
    retryCount: 100,
    retryDelay: 200
});
const sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
};
const handleTask = (task, curIndex) => {
    return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
        const lock = yield redlock.lock(`locks:${config_1.TASK_NAME}_CUR_INDEX`, 1000);
        console.log(`Handling task ${task}...`);
        yield utils_1.setValue(`${config_1.TASK_NAME}_CUR_INDEX`, String(curIndex + 1));
        yield lock.unlock().then(() => console.log(`Unlock task ${task}`));
        yield sleep(2000);
        resolve();
    }));
};
const tasksHandler = () => __awaiter(void 0, void 0, void 0, function* () {
    const curIndex = Number(yield utils_1.getValue(`${config_1.TASK_NAME}_CUR_INDEX`));
    const beginTime = yield utils_1.getValue(`${config_1.TASK_NAME}_BEGIN_TIME`);
    const taskAmountTotal = Number(yield utils_1.getValue(`${config_1.TASK_NAME}_TOTAL`));
    if (!beginTime)
        yield utils_1.setBeginTime(redlock);
    if (taskAmountTotal === 0) {
        console.log('No Tasks, waiting for the new tasks');
        yield sleep(3000);
        yield tasksHandler();
        return;
    }
    if (curIndex === config_1.TASK_AMOUNT) {
        const timeCost = new Date().getTime() - Number(beginTime);
        console.log(`All tasks have been processed! Time cost: ${timeCost}ms. ${beginTime}`);
        yield utils_1.setValue(`${config_1.TASK_NAME}_TOTAL`, '0');
        yield utils_1.setValue(`${config_1.TASK_NAME}_CUR_INDEX`, '0');
        yield utils_1.setValue(`${config_1.TASK_NAME}_SET_FIRST`, 'false');
        yield utils_1.deleteKey(`${config_1.TASK_NAME}_BEGIN_TIME`);
        yield tasksHandler();
        return;
    }
    const task = yield utils_1.popTask(config_1.TASK_NAME);
    if (task !== null)
        yield handleTask(task, curIndex);
    yield tasksHandler();
});
exports.tasksHandler = tasksHandler;
