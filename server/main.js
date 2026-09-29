import express from 'express';
import http from 'http';

import { router as backlogRouter } from './routers/backlog.router.js';

const port = "42069";

const app = express();

app.use(/^\/backlog/, backlogRouter);


// /*
app.route(/(.*)/)
    .get((_, res) => {
        res.status(200)
        res.json({ message: "sorry nothing" });
    });


app.set('port', port);
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server listening on ${port} (nice)`)
});


