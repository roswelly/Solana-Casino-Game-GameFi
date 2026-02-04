import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';

import config from './config.json';
import { connect } from './model';
import { initSocket } from './socket';
import bodyParser from 'body-parser';

// process.on('uncaughtException', (error) => console.log('exception', error));
// process.on('unhandledRejection', (error) => console.log('rejection', error));

const app = express();
const server = http.createServer(app);

connect().then(async (loaded) => {
  if (loaded) {
    // console.log('connected to MongoDB');

    app.use(cors({ origin: "*" }));
    app.use(express.urlencoded({ extended: true }));
    // app.use("/api", routers);
    app.use(bodyParser.json({ type: "application/json" }));
    app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
    app.use(bodyParser.text({ type: "text/html" }));
    app.get("*", (req, res) => res.sendFile(__dirname + "/build/index.html"));

    // app.use(
    //   cors({
    //       origin: "*",
    //       methods: ["POST", "GET"],
    //   })
    // );
    // app.use(express.json());
    // app.use(express.urlencoded({ extended: true }));
    
    // // Frontend Load
    // app.use(express.static(__dirname + "/build"));
    // app.get("/*", function (req: any, res: any) {
    //     res.sendFile(__dirname + "/build/index.html", function (err: any) {
    //         if (err) {
    //             res.status(500).send(err);
    //         }
    //     });
    // });

    const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    initSocket(io);
    app.set('io', io);

    server.listen({ port: config.port, host: '0.0.0.0' }, () => console.log(`Started HTTP service on port ${config.port}`));
  } else {
    console.log('Connection to MongoDB failed', loaded);
  }
});
