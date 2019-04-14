require( 'dotenv' ).config()
const jwt = require( 'jsonwebtoken' )
var Redis = require( 'ioredis' )
var redis = new Redis( process.env.REDIS )

class User {
    constructor( user ) {
        Object.assign( this, user )
        console.log( 'User', this )
    }

    generateJWT() {
        const today = new Date()
        const expirationDate = new Date( today )
        expirationDate.setDate( today.getDate() + 30 )

        return jwt.sign( {
            email: this.email,
            exp: parseInt( expirationDate.getTime() / 1000, 10 )
        }, process.env.JWT_SECRET )
    }

    toJSON() {
        const { email, firstname, lastname } = this
        return { email, firstname, lastname }
    }

    async save() {
        let user = this.toJSON()
        return redis.hmset( 'user:' + this.email, user )
    }

    async save_secret( secret ) {
        return redis.hmset( 'user:' + this.email, { secret: secret } )
    }

}

class Users {
    static async findOne( email ) {
        console.log( 'find ', email )
        try { 
            const user = await redis.hgetall( 'user:' + email )
            console.log( 'found: ', user )
            if ( user.email === email )
                return new User( user )
        } catch( err ) {
            console.log( 'not found', err )
        }
        return null
    }
}

module.exports = { User, Users }