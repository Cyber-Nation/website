import LogIn from '/app/login/login.js'
import UserProfile from '/app/user-profile/user-profile.js'

var css = import.meta.url.replace( '.js', '.css' )

customElements.define( 'user-name', class extends HTMLElement {
    constructor() {
        super()
        console.debug( '<user-name>' )
        this.attachShadow( { mode: 'open' } )
            .innerHTML = //html
            `   <link rel="stylesheet" href="${css}">
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">
                <output>Connexion...</output>
            `
    }

    async connectedCallback() {
        await this.connect()
        document.addEventListener( 'updated', this )                      
    }

    async connect() {
        let view = this.shadowRoot
        let output = view.querySelector( 'output' )
        let main = document.querySelector( 'main' )

        var r = await fetch( '/api/users/current', { method: 'GET' } )
        switch (r.status) {
            case 200:  
                let u = await r.json()
                console.debug( u )
                let first_name = u.firstname || u.email
                output.innerHTML = `Bienvenue <a class="user">${first_name}</a>`
                output.querySelector( 'a.user' )
                    .onclick = () =>
                        main.innerHTML = '<user-profile></user-profile>'
                        //document.body.appendChild( new UserProfile )
                document.dispatchEvent( new CustomEvent( 'registered', { bubbles: true } ) )
                this.setAttribute( 'connected', '' )
                break 
            
            case 401:
                output.innerHTML = `<a class="button">Identifiez-vous</a>`
                output.querySelector( 'a.button' )
                    .onclick = () => {
                        //main.innerHTML = '<log-in></log-in>'
                        document.body.appendChild( new LogIn )  
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