import LogIn from '/app/login/login.js'
import UserProfile from '/app/user-profile/user-profile.js'

var css = import.meta.url.replace( '.js', '.css' )

customElements.define( 'user-name', class extends HTMLElement {
    constructor() {
        super()
        console.debug( '<user-name>' )
        this.attachShadow( { mode: 'open' } )
            .innerHTML = `
            <link rel="stylesheet" href="${css}">
            <output>Connexion...</output>
        `
    }

    async connectedCallback() {
        await this.connect()
    }

    async connect() {
        let view = this.shadowRoot
        let output = view.querySelector( 'output' )

        var r = await fetch( '/api/users/current', {
            method: 'GET'
        } )
        switch (r.status) {
            case 200:  
                let u = await r.json()
                console.debug( u )
                let first_name = u.firstname || u.email
                output.innerHTML = `Bienvenue <a class="user">${first_name}</a>`
                output.querySelector( 'a.user' )
                    .onclick = () =>
                        document.body.appendChild( new UserProfile )
                break 
            
            case 401:
                output.innerHTML = `<a class="button">Identifiez-vous</a>`
                output.querySelector( 'a.button' )
                    .onclick = () => {
                        document.body.appendChild( new LogIn )  
                        document.addEventListener( 'updated', this, true )                      
                    }
                break

            default:
                let t = await r.text()
                console.error( t )
        }
    }

    handleEvent( ev ) { 
        if ( ev.type === 'updated' ) {
            console.debug(  ev.detail, 'updated' )
            this.connect()
        }
    }
} )