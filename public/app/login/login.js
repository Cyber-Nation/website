var css = import.meta.url.replace( '.js', '.css' )

class LogIn extends HTMLElement {
    constructor() {
        super()
        console.debug( '<log-in>' )
        this.attachShadow( { mode: 'open' } )
            .innerHTML = /*html*/`
                <link rel="stylesheet" href="${css}">
                <section>
                    <h1>Connexion</h1>
                    <div>Connectez-vous à l'aide de votre adresse mail :</div>
                    <article>
                        <label for="email">E-mail</label>
                        <input type="text" name="email" id="email" spellcheck=false pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$">
                        <button id="connect">Connexion</button>
                    </article>
                    <div id=codeDiv>Entrez le code de validation reçu par mail :</div>
                    <article id="code">
                        <label for="code">Code</label>
                        <input type="text" name="code" id="code" pattern="[0-9]{6}">
                        <button id="validate">Validation</button>
                    </article>
                    <output></output>
                    <output id="success"></output>
                </section>
            `
    }

    async connectedCallback() {
        let view  = this.shadowRoot
        let email = view.querySelector( '#email' )
        let connect = view.querySelector( 'button#connect' )
        let output = view.querySelector( 'output' )
        let validate = view.querySelector( 'button#validate' )
        let code_article = view.querySelector( 'article#code' )
        let code_div = view.querySelector( 'div#codeDiv' )
        let code = view.querySelector( 'input#code' )
        let success = view.querySelector( 'output#success' )


        setTimeout( () => email.focus(), 100 )
        
        //Connexion par e-mail
        connect.onclick = async () => {
            console.debug( `login to`, email.value )
            let payload = { email: email.value }
            var res = await fetch( '/api/users/connect', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    },
                body: JSON.stringify( payload )
            } )
            console.debug( 'réponse', res.status )
            var json = await res.json()
            console.debug( json )
            if ( res.status == 200 ) {
                code_article.style.display = 'flex'
                code_div.style.display = 'block'
                output.textContent = ''
            }
            else {
                output.textContent = json.errors[0].msg
            }
        }

        //Validation par code
        validate.onclick = async () => {
            console.debug( 'validation par', code.value )
            let payload = { email: email.value, code: code.value }
            var res = await fetch( '/api/users/validate', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    },
                body: JSON.stringify( payload )
            } )
            console.debug( 'réponse', res.status )
            if ( res.status === 200 ) {
                output.textContent = ''
                success.textContent = 'Vous êtes connecté !'
                document.dispatchEvent( new CustomEvent( 'updated', {
                    detail: { email: email.value },
                    bubble: true 
                } ) )
                setTimeout( () => this.parentElement.removeChild( this ), 1000 )
                
            }
            else 
                output.textContent = 'Code incorrect'
        }


    }
} 

customElements.define( 'log-in', LogIn )

export default LogIn

