

// Dependencies
require( 'dotenv' )
const fs = require('fs');
//const http = require('http');
const https = require('https');
const express = require('express');
const morgan = require( 'morgan' )

const app = express();

console.log( process.env.NODE_ENV )

// Certificate
var credentials
if ( process.env.NODE_ENV === 'production' ) 
	credentials = {
		privateKey: fs.readFileSync('/etc/letsencrypt/live/www.cyber-nation.fr/privkey.pem', 'utf8'),
		certificate: fs.readFileSync('/etc/letsencrypt/live/www.cyber-nation.fr/cert.pem', 'utf8'),
		ca: fs.readFileSync('/etc/letsencrypt/live/www.cyber-nation.fr/chain.pem', 'utf8')
	}
else 
	credentials = {
		key: fs.readFileSync('server/ssl/localhost.key'),
		cert: fs.readFileSync('server/ssl/localhost.cert')
	}

app.use( morgan( 'dev' ) )

app.use((req, res) => {
	res.send('Hello there !');
});

// Starting both http & https servers
//const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

/*httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});*/

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});