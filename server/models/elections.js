require( 'dotenv' ).config()
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
        const { email, firstname, lastname, sex, birthDay, birthMonth, birthYear, dpt, city, station } = this
        return { email, firstname, lastname, sex, birthDay, birthMonth, birthYear, dpt, city, station }
    }

    async save() {
        let user = this.toJSON()
        return redis.hmset( 'user:' + this.email, user )
    }

    async save_secret( secret ) {
        return redis.hmset( 'user:' + this.email, { secret: secret } )
    }

}

class Elections {
    static async addCandidate( election, email ) {
        console.log( 'addCandidate ', email, election )
        let res = null
        try { 
            res = await redis.sadd( 'elections:' + election, email )
            res += await redis.sadd( 'candidatures:' + email, election )
        } catch( err ) {
            console.log( 'erreur redis', err )
        }
        return res
    }

    static async removeCandidate( election, email ) {
        console.log( 'removeCandidate ', email, election )
        let res = null
        try { 
            res = await redis.srem( 'elections:' + election, email )
            res += await redis.srem( 'candidatures:' + email, election )
        } catch( err ) {
            console.log( 'erreur redis', err )
        }
        return res
    }

    static async listElections( email ) {
        console.log( 'listElections ', email )
        let res = null 
        try {
            res = await redis.smembers( 'candidatures:' + email )
            console.log( 'candidatures récupérées', res )
        }
        catch ( err ) {
            console.log( 'erreur redis', err )
        }
        return res
    }
}

module.exports = { Elections }