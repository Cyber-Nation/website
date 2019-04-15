let css = import.meta.url.replace( '.js', '.css' )

class UserProfile extends HTMLElement {
    constructor() {
        super()
        console.debug( '<user-profile>' )
        this.attachShadow( { mode: 'open' } )
            .innerHTML = /*html*/`
                <link rel="stylesheet" href="${css}">
                <section>
                    <h1>Votre compte</h1>
                    <article>
                        <label for="email">E-mail</label>
                        <input type="text" readonly name="email" id="email">
                    </article>
                    <article>
                        <label for="firstname">Prénom</label>
                        <input type="text" spellcheck="false" name="firstname" id="firstname">
                    </article>
                </section>
                <button id="close">x</button>
            `
    }   

    async connectedCallback() {
        this.shadowRoot.querySelector( 'button#close' )
            .onclick = () => this.parentElement.removeChild( this )
        await this.get_info()  
    }

    async get_info() {
        let view = this.shadowRoot
        let firstname = view.querySelector( 'input#firstname' )


        let r = await fetch( '/api/users/profile' )
        if ( r.status === 200 || r.status === 304 ) {
            let user = await r.json()
            console.debug( user )
            view.querySelector( 'input#email' )
                .value = user.email
            
            firstname.value = user.firstname || null
            firstname.onchange = async () => {
                let payload = {
                    firstname: firstname.value
                }
                var r = await fetch( '/api/users/update', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify( payload )
                } )
                if ( r.status === 200 ) {
                    firstname.classList.add( 'saved' )
                    document.dispatchEvent( new CustomEvent( 'updated', {
                        detail: { firstname: firstname.value },
                        bubble: true 
                    } ) )
                }
                else {
                    console.warn( await r.json() )
                }
            }
        }
    } 
}

customElements.define( 'user-profile', UserProfile )

export default UserProfile