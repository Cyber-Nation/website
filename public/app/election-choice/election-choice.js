//Chemins d'accès aux fichiers HTML et CSS
let css = import.meta.url.replace( '.js', '.css' )
let html = import.meta.url.replace( '.js', '.html' )

//Mise à jour unitaire côté serveur
let post = ( action, payload ) => 
    fetch( '/api/elections/' + action, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify( payload )
    } )


//Profil utilisateur <user-profile>
class ElectionChoice extends HTMLElement {
    constructor() {
        super()
        console.debug( '<election-choice>' )
        this.attachShadow( { mode: 'open' } )
    }   

    async connectedCallback() {
        let template = await fetch( html )
        this.shadowRoot.innerHTML = `<link rel=stylesheet href=${css}>` + await template.text()

        this.shadowRoot.querySelector( 'i#close' )
            .onclick = () => document.querySelector( 'main' ).innerHTML = '<home-page></home-page>'

        this.view()  

    }

    async view() {
        let view = this.shadowRoot
        let list = view.querySelector( 'ul#election_list' )
        let chosen = view.querySelector( 'ul#chosen_elections' )
        let empty_chosen = view.querySelector( 'div#empty_chosen' )
        let filled_chosen = view.querySelector( 'div#filled_chosen' )

        filled_chosen.style.display = 'none'

        //élection choisie
        let choose = ev => {
            let li = ev.target.closest( 'li.enabled' )
            if ( li ) {
                chosen.appendChild( li )     
                filled_chosen.style.display = 'block'
                empty_chosen.style.display = 'none'
                post( 'enroll', { election: li.id } )
            }            
        }

        //élection abandonnée
        let remove = ev => {
            let li = ev.target.closest( 'li.enabled' )
            if ( li ) {
                list.appendChild( li )
                if ( !chosen.querySelector( 'li' ) ) {     
                    filled_chosen.style.display = 'none'
                    empty_chosen.style.display = 'block'
                }
                post( 'decline', { election: li.id } )
            }            
        }

        list.addEventListener( 'click', choose )
        chosen.addEventListener( 'click', remove )

        //update
        let res = await fetch( '/api/elections/', { headers: { 'Accept': 'application/json' } } )
        if ( res.status === 200 ) {
            let records = await res.json()
            console.debug( 'récupérés', records )
            for ( let elec of records.elections ) {
                let li = view.querySelector( 'li#' + elec )
                chosen.appendChild( li )
                filled_chosen.style.display = 'block'
                empty_chosen.style.display = 'none'
            } 
        }

    }
}

customElements.define( 'election-choice', ElectionChoice )

export default ElectionChoice