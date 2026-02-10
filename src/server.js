import 'reflect-metadata';
import debug from 'debug';
import http from 'http';
import dotenv from 'dotenv';

import app, { bootstrapDatabase } from '../app.js';

dotenv.config();

let port = normalizePort(process.env.PORT || '3000');

app.set('port', port);

let server = http.createServer(app);

server.on('error', onError);
server.on('listening', onListening);


async function startServer() {
    console.log('--- Iniciando Servidor ---');

    await bootstrapDatabase();

    server.listen(port, '0.0.0.0');
}

startServer();


function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {

        return val;
    }

    if (port >= 0) {

        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const green = '\x1b[38;2;129;201;149m';
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);

    console.log(`${green}[SERVER] Servidor ativo !\nApp rodando em ${green}http://localhost:${process.env.APP_PORT}`);
}
