//Dépendances
require( 'dotenv' ).config()
const morgan = require( 'morgan' )
const fs = require( 'fs' )
const https = require( 'https' )
const express = require( 'express' )
const cookie_parser = require( 'cookie-parser' )
const body_parser = require( 'body-parser' )

console.log( process.env.npm_package_version, process.env.NODE_ENV )

//APPLICATION
const app = express()

//Middlewares
app.use( morgan( 'dev' ) )
app.use( cookie_parser() )
app.use( body_parser.json() )

//Routes
app.use( express.static( 'public' ) )
app.use( '/api', require( './api' ) )

//Erreur d'authentification
app.use( ( err, req, res, next ) => {
	switch ( err.name ) {
		case 'UnauthorizedError':
			res.status( 401 ).send( 'Jeton invalide' )
			break
		default:
			console.error( '***', err )
			res.sendStatus( 500 )
	} 
} )
  

//SERVEUR HTTPS

//SSL
var credentials = ( process.env.NODE_ENV === 'production' ) ?
{
		key: fs.readFileSync( '/etc/letsencrypt/live/www.cyber-nation.fr/privkey.pem', 'utf8' ),
	    cert: fs.readFileSync( '/etc/letsencrypt/live/www.cyber-nation.fr/cert.pem', 'utf8' ),
		ca: fs.readFileSync( '/etc/letsencrypt/live/www.cyber-nation.fr/chain.pem', 'utf8' )
} : {
		key: fs.readFileSync('server/ssl/localhost.key'),
		cert: fs.readFileSync('server/ssl/localhost.crt'),
		password: process.env.CERT_PASSWORD
}

//Serveur
const httpsServer = https.createServer( credentials, app )
httpsServer.listen( 443, () => {
	console.log( `Server HTTPS à l'écoute sur le port 443` )
} )