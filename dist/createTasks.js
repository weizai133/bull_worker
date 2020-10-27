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
const redisClient_1 = require("./redis/redisClient");
const utils_1 = require("./redis/utils");
const config_1 = require("./config");
redisClient_1.client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    yield utils_1.deleteKey(config_1.TASK_NAME);
    for (let i = 0; i < config_1.TASK_AMOUNT; i++) {
        redisClient_1.client.lpush(config_1.TASK_NAME, `task-${i}`);
    }
    yield utils_1.setValue(`${config_1.TASK_NAME}_TOTAL`, `${config_1.TASK_AMOUNT}`);
    yield utils_1.setValue(`${config_1.TASK_NAME}_CUR_INDEX`, '0');
    yield utils_1.setValue(`${config_1.TASK_NAME}_SET_FIRST`, 'false');
    yield utils_1.deleteKey(`${config_1.TASK_NAME}_BEGIN_TIME`);
    redisClient_1.client.lrange(config_1.TASK_NAME, 0, config_1.TASK_AMOUNT, (err, values) => {
        if (err)
            return console.log(err);
        console.log(values);
        process.exit();
    });
}));
