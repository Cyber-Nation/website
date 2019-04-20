//dépendences externes
require( 'dotenv' ).config()
const router = require( 'express' ).Router()
const email = require( '../../node_modules/emailjs/email' )
const speakeasy = require( 'speakeasy' )
const { check, validationResult } = require( 'express-validator/check' )
const validate = require( 'validate.js' )

//dépendences internes
const auth = require( '../utils/auth' )
const { User, Users } = require( '../models/users' )

//initialisation
var smtpServer 	= email.server.connect( {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
    host: process.env.SMTP_SERVER,
    ssl: true
} )

// Current
router.get( '/current', auth.required, ( req, res, next ) => {
    console.log( 'get /current' )
    const { payload: { email } } = req

    return Users.findOne( email ).then( user => {
        //console.log( 'found--', user )
        if ( !user )
            return res.sendStatus( 400 )
        
        return res.json( user.toJSON() )
    } )
} )

// Test
router.get( '/test', auth.required, ( req, res ) => {
    console.log( 'get /test' )

    return res.status( 200 ).send( 'hello ' + req.payload.email )
} ) 

// Register
router.post( '/connect', [
    check( 'email' ).isEmail().normalizeEmail().withMessage( `Adresse e-mail incorrecte` ) 
], async (req, res ) => {
    //Vérification des erreurs
    const errors = validationResult ( req )
    if ( !errors.isEmpty() ) {
        return res.status( 422 ).json( { errors: errors.array() } )
    }
    
    //Récupération du mail
    const { body: { email } } = req
    console.log( `Demande d'inscription de la part de ${email}.` )

    //clé secrète
    let secret = speakeasy.generateSecret()

    try {
        let user = await Users.findOne( email ) 
        //crée l'utilisateur s'il n'existe pas 
        if ( !user ) {
            user = new User( { email: email } )  
            await user.save()
        }
        //ajoute la clé secrete
        await user.save_secret( secret.base32 )
        await send_mail()
        res.status( 200 ).send( { message: 'code envoyé à ' + email } )
    } 
    catch( err ) {
        console.log( 'Erreur:', err )
        res.status( 400 ).send( err )
    }

    //envoie le mail avec le code
    async function send_mail ()
    {
        console.debug( 'send_mail()' )
        let token = speakeasy.totp( {
            secret: secret.base32,
            encoding: 'base32'
        } )

        let message = {
            text:    'Bonjour !\nVoici le code d\'authentification : ' + token, 
            from:    `Cyber-Nation <${process.env.SMTP_SENDER}>`, 
            to:      email,
            subject: 'Code de connexion au site Cyber-Nation', 
            attachment: {
                    data: `<html>
                            Bonjour !<br>
                            Voici votre code d'authentification : <b>${token}</b><br>
                            Ce code est valable 5 minutes.
                           </html>`, 
                    type: 'text/html', 
                    alternative: true
            }
        }
        smtpServer.send( message, function( err, message ) 
        { 
            if ( err ) {
                console.log( `Erreur d'envoi de mail : ${err}` )
                return( err ) 
            }
            else {
                //console.debug( `Message envoyé :`, message )
                return 'OK' 
            }
        } ) 
    }  
} )

//Validation du code
router.post( '/validate', [ 
    check( 'email' ).isEmail().normalizeEmail(), 
    check( 'code' ).isInt({ min: 0, max: 999999 } ).withMessage( 'Le code doit comporter 6 chiffres')
], async( req, res ) => {
    const { body: { email, code } } = req
    console.log( `Code ${code} pour ${email}` )
    let user
    //récupère l'utilisateur
    try {
        user = await Users.findOne( email )
        var validated = speakeasy.totp.verify( {
            secret: user.secret,
            encoding: 'base32',
            token: '' + code,
            window: 10 //5 minutes
        } )
        console.log( 'validation:', validated )
    }
    catch( err ) {
        res.status( 401 ).send( { error: `Erreur lors de l'authentificaition` } )
    }
    
    if ( validated ) {   
        let jwt = user.generateJWT()
        console.log( 'JWT =', jwt )
        res.cookie( 'JWT', jwt, { httpOnly: true, secure: true, sameSite: true, maxAge: 2592000000 } )
        res.status( 200 ).send( { message: 'OK' } )    
    }
    else
        res.status( 401 ).send( { error: 'Code de valisation erroné' } )    

} )

//Profil
router.get( '/profile', auth.required, async ( req, res ) => {
    console.log( 'get /profile' )
    const { payload: { email } } = req

    let user = await Users.findOne( email )

    if ( !user )
        res.sendStatus( 422 )
    
    res.json( user.toJSON() )
} ) 

//Mise à jour
let constraints = {
    city: { length: { minimum: 0, maximum: 10, tooLong: 'Maximum 10 caractères' } },
    firstname: { length: { minimum: 0, maximum: 50, tooLong: 'Maximum 50 caractères' } },
    lastname: { length: { minimum: 0, maximum: 50, tooLong: 'Maximum 50 caractères' } },
    sex: { inclusion: [ 'M', 'F' ] },
    birthDay: { numericality: { onlyInteger: true, greaterThan: 0, lessThanOrEqualTo: 31 } },
    birthMonth: { numericality: { onlyInteger: true, greaterThan: 0, lessThanOrEqualTo: 12 } },
    birthYear: { numericality: { onlyInteger: true, greaterThan: 1900, lessThanOrEqualTo: 2019 } },
    station: { numericality: { onlyInteger: true } },
    dpt: { numericality: { onlyInteger: true, greaterThan: 0, lessThanOrEqualTo: 999 } },
}

router.post( '/update',  auth.required, async ( req, res ) => {
    console.log( 'post /update', req.body )
    
    /*const errors = validationResult( req )
    if ( !errors.isEmpty() ) 
        return res.status( 422 ).json( errors.array() )*/

    let err = validate( req.body, constraints )
    if ( err )
        return res.status( 422 ).json( err )
    
    const { payload: { email } } = req
    
    let user = await Users.findOne( email )
    if ( user ) {
        Object.assign( user, req.body )
        if ( await user.save() )
            res.sendStatus( 200 )
        else
            res.sendStatus( 204 )
    }
    else {
        res.sendStatus( 422 )
    }
} )

module.exports = router
