var express = require( 'express' )
var morgan = require( 'morgan' )

var app = express()

app.use( morgan( 'dev' ) )

app.use( '*', (req, res ) => 
    res.redirect( 'https://' + req.headers.host )
)

app.listen( process.env.PORT || 80 )
