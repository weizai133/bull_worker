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
const taskHandler_1 = require("./taskHandler");
redisClient_1.client.on('connect', (err) => {
    if (err)
        return console.log(err);
    console.log('Redis is connected!');
});
redisClient_1.client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Redis is ready and Handling Tasks');
    yield taskHandler_1.tasksHandler();
}));
redisClient_1.client.on('error', (err) => {
    console.log('Redis error: ', err);
    process.exit();
});
