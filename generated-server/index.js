const http = require('http');
const express = require("express");
const { initialize } = require('@oas-tools/core');
const logger = require('./logger');

const serverPort = 8080;
const app = express();
app.use(express.json({limit: '50mb'}));

const config = {
    oasFile: "./api/oas-doc.yaml",
    middleware: {
        security: {
            auth: {
            }
        }
    }
}

// Initialize database before running the app
var db = require('./db');

async function start() {
  try {
    await db.connect();
    logger.info('Initializing DB...');
    const contacts = await db.find({});
    if (contacts.length === 0) {
      logger.info('Empty DB, loading initial data...');
      await db.init();
    } else {
      logger.info('DB already has ' + contacts.length + ' contacts.');
    }
  } catch (err) {
    logger.error('Error connecting to DB!', err);
    setTimeout(function () {process.exit(1)}, 1000);
  }

  await initialize(app, config);
  http.createServer(app).listen(serverPort, () => {
    logger.info("\nApp running at http://localhost:" + serverPort);
    logger.info("________________________________________________________________");
    if (!config?.middleware?.swagger?.disable) {
      logger.info('API docs (Swagger UI) available on http://localhost:' + serverPort + '/docs');
      logger.info("________________________________________________________________");
    }
  });
}

start();