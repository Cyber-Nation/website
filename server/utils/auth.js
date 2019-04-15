require( 'dotenv' ).config()
const jwt = require( 'express-jwt' )

const getTokenFromHeaders = req => {
    var jwt = req.cookies.JWT
    if ( jwt ) 
        return jwt    
}

const auth = {
    required: jwt( {
        secret: process.env.JWT_SECRET,
        userProperty: 'payload',
        getToken: getTokenFromHeaders
    } ), 
    optional: jwt( {
        secret: process.env.JWT_SECRET,
        userProperty: 'payload',
        getToken: getTokenFromHeaders,
        credentialsRequired: false
    } )
}

module.exports = auth