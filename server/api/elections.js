//dépendences externes
require( 'dotenv' ).config()
const router = require( 'express' ).Router()
const { check, validationResult } = require( 'express-validator/check' )
const validate = require( 'validate.js' )

//dépendences internes
const auth = require( '../utils/auth' )
//const { User, Users } = require( '../models/users' )
const { Elections } = require( '../models/elections' )

let constraints = {
    election: { inclusion: [ 'European-2019', 'Municipal-2020' ] },
 }

//inscription à une élection
router.post( '/enroll', auth.required, async ( req, res ) => {
    const { payload: { email } } = req

    let err = validate( req.body, constraints )
    if ( err )
        return res.status( 422 ).json( err )
    
    let elec = req.body.election
    console.log( `candidature de ${email} à l'élection ${elec}` )
    let r = await Elections.addCandidate( elec, email )
    
    if ( r === null )
        res.sendStatus( 500 )
    else
        res.sendStatus( 200 )
} )

//désistement d'une élection
router.post( '/decline', auth.required, async ( req, res ) => {
    const { payload: { email } } = req

    let err = validate( req.body, constraints )
    if ( err )
        return res.status( 422 ).json( err )
    
    let elec = req.body.election
    console.log( `désistement de ${email} de l'élection ${elec}` )
    let r = await Elections.removeCandidate( elec, email )
    
    if ( r === null )
        res.sendStatus( 500 )
    else
        res.sendStatus( 200 )
} )

//liste des élections 
router.get( '/', auth.required, async ( req, res) => {
    const { payload: { email } } = req

    let elections = await Elections.listElections( email )
    if ( !elections ) 
        res.sendStatus( 404 )
    else
        res.json( { elections } )

} )

module.exports = router
