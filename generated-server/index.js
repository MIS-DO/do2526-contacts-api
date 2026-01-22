const http = require('http');
const express = require("express");
const { initialize } = require('@oas-tools/core');


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
    console.info('Initializing DB...');
    const contacts = await db.find({});
    if (contacts.length === 0) {
      console.info('Empty DB, loading initial data...');
      await db.init();
    } else {
      console.info('DB already has ' + contacts.length + ' contacts.');
    }
  } catch (err) {
    console.error('Error connecting to DB!', err);
    process.exit(1);
  }

  await initialize(app, config);
  http.createServer(app).listen(serverPort, () => {
    console.log("\nApp running at http://localhost:" + serverPort);
    console.log("________________________________________________________________");
    if (!config?.middleware?.swagger?.disable) {
      console.log('API docs (Swagger UI) available on http://localhost:' + serverPort + '/docs');
      console.log("________________________________________________________________");
    }
  });
}

start();