import http from 'http'
import express from 'express'
import cors from 'cors'
import bodyParser from "body-parser";
import { Server } from 'socket.io';
import * as path from 'path';

import config from './config.json'
import { connect } from './model'
import routers from './routers'
import { initSocket } from './socket'

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.on("uncaughtException", (error) => console.log('exception', error));
process.on("unhandledRejection", (error) => console.log('rejection', error));

const app = express();
const server = http.createServer(app);

connect().then(async loaded => {
    if (loaded === true) {
        console.log('connected to MongoDB')

        app.use(cors({ origin: "*" }));
        app.use(express.urlencoded());
        // app.use("/api", routers);
        app.use(bodyParser.json({ type: "application/json" }));
        app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
        app.use(bodyParser.text({ type: "text/html" }));
        app.use("/api", routers);
        app.use(express.static(path.join(__dirname, '/build')));
        app.get("*", (req, res) => res.sendFile(__dirname + "/build/index.html"));

        const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
        initSocket(io);

        app.set("io", io);

        server.listen({ port: config.port, host: '0.0.0.0' }, () => console.log(`Started HTTP service on port ${config.port}`));
    } else {
        console.log('Connection to MongoDB failed', loaded);
    }
})