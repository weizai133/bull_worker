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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBeginTime = exports.popTask = exports.deleteKey = exports.setValue = exports.getValue = void 0;
const redisClient_1 = require("./redisClient");
const config_1 = require("../config");
const getValue = (key) => {
    return new Promise((resolve, reject) => {
        redisClient_1.client.get(key, (err, value) => {
            if (err)
                reject(err);
            resolve(value);
        });
    });
};
exports.getValue = getValue;
const setValue = (key, value) => new Promise((resolve) => redisClient_1.client.set(key, value, resolve));
exports.setValue = setValue;
const deleteKey = (key) => new Promise((resolve) => {
    redisClient_1.client.del(key, resolve);
});
exports.deleteKey = deleteKey;
const popTask = (key) => {
    return new Promise((resolve, reject) => {
        return redisClient_1.client.LPOP(key, (err, task) => {
            if (err)
                return reject(err);
            else if (task === null)
                resolve(null);
            resolve(task);
        });
    });
};
exports.popTask = popTask;
const setBeginTime = (redlock) => __awaiter(void 0, void 0, void 0, function* () {
    const lock = yield redlock.lock(`locks:${config_1.TASK_NAME}_SET_FIRST`, 1000);
    const setFirst = yield getValue(`${config_1.TASK_NAME}_SET_FIRST`);
    if (setFirst === 'false') {
        const beginTime = new Date().getTime();
        console.log('Setting the begin TIME: ' + beginTime);
        yield setValue(`${config_1.TASK_NAME}_SET_FIRST`, 'true');
        yield setValue(`${config_1.TASK_NAME}_BEGIN_TIME`, String(beginTime));
    }
    yield lock.unlock();
});
exports.setBeginTime = setBeginTime;
