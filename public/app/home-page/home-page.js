//Chemins d'accès aux fichiers HTML et CSS
let css = import.meta.url.replace( '.js', '.css' )
let html = import.meta.url.replace( '.js', '.html' )

//Candidatures
import ElectionChoice from '/app/election-choice/election-choice.js'


customElements.define( 'home-page', class extends HTMLElement {
    constructor() {
        super()
        console.debug( '<home-page>' )
        this.attachShadow( { mode: 'open' } )
    }   

    async connectedCallback() {
        let template = await fetch( html )
        this.shadowRoot.innerHTML = `<link rel=stylesheet href=${css}>` + await template.text()
        this.controller()
    }
    
    controller() {
        let view = this.shadowRoot
        let enroll = view.querySelector( 'button#enroll' )
        let main = document.querySelector( 'main' )
        let user = document.querySelector( 'user-name[connected]' )
        
        document.addEventListener( 'registered', () => 
            enroll.removeAttribute( 'disabled' )
        )

        if ( user )
            enroll.disabled = false


        enroll.onclick = () =>
            main.innerHTML = '<election-choice></election-choice>'
    }
} )


