class LogIn extends HTMLElement {
    constructor() {
        super()
        this.attachShadow( { mode: 'open' } )
            .innerHTML = /*html*/`
                <link rel="stylesheet" href="/css/login.css">
                <dialog>
                    <h1>Connexion</h1>
                    <div>Connectez-vous à l'aide de votre adresse e-mail :</div>
                    <section>
                        <label for="email">E-mail</label>
                        <input type="text" name="email" id="email" tabindex=1>
                        <button id="connect">Connexion</button>
                    </section>
                    <output></output>
                </dialog>
            `
    }

    async connectedCallback() {
        let view  = this.shadowRoot
        let email = view.querySelector( '#email' )
        let connect = view.querySelector( 'button#connect' )
        let output = view.querySelector( 'output' )


        setTimeout( () => email.focus(), 100 )
        
        connect.onclick = async () => {
            console.debug( `login to` + email.value )
            let payload ={ email: email.value }
            var res = await fetch( '/api/user/connect', {
                method: 'POST'
            } )
            var json = await res.text()
            console.debug( json )
            output.innerHTML = email.value
            this.parentElement.removeChild( this )
        }
    }
} 

customElements.define( 'log-in', LogIn )

export default LogIn

