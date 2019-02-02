const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const GridStoreAdapter = require('parse-server/lib/Adapters/Files/GridStoreAdapter').GridStoreAdapter

const path = require('path');

const databaseUri = process.env.PARSE_SERVER_DATABASE_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

const api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.PARSE_SERVER_CLOUD || __dirname + '/cloud/main.js',
  appId: process.env.PARSE_SERVER_APPLICATION_ID || 'myAppId',
  masterKey: process.env.PARSE_SERVER_MASTER_KEY || 'myMasterKey', //Add your master key here. Keep it secret!
  serverURL: process.env.PARSE_PUBLIC_SERVER_URL || 'http://localhost:1337/api/1',  // Don't forget to change to https if needed
  maxUploadSize: process.env.PARSE_SERVER_MAX_UPLOAD_SIZE,
  cacheMaxSize: parseInt(process.env.PARSE_SERVER_CACHE_MAX_SIZE),
  publicServerURL: process.env.PARSE_PUBLIC_SERVER_URL || 'http://localhost:1337/api/1',
  filesAdapter: new GridStoreAdapter(process.env.PARSE_SERVER_DATABASE_URI) // For default setting. GridFS
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_SERVER_MOUNT_PATH || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

const port = process.env.PORT || 1337;
const httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
  console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
if (process.env.PARSE_SERVER_START_LIVE_QUERY_SERVER == 'true') {
  ParseServer.createLiveQueryServer(httpServer, JSON.parse(process.env.PARSE_SERVER_LIVE_QUERY));
}
