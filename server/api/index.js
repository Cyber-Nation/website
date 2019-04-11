var version = '0.5'

const router = require( 'express' ).Router()

router.get( '/', ( req, res ) => 
    res.status( 200 ).send( { version: version } ) 
)

router.use( '/users', require( './users' ) )

module.exports = router