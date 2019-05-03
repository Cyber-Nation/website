//Chemins d'accès aux fichiers HTML et CSS
let css = import.meta.url.replace( '.js', '.css' )
let html = import.meta.url.replace( '.js', '.html' )

//Mise à jour unitaire côté serveur
let post = payload => 
    fetch( '/api/users/update', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify( payload )
    } )

//Profil utilisateur <user-profile>
class UserProfile extends HTMLElement {
    constructor() {
        super()
        console.debug( '<user-profile>' )
        this.attachShadow( { mode: 'open' } )
    }   

    async connectedCallback() {
        let template = await fetch( html )
        this.shadowRoot.innerHTML = `<link rel=stylesheet href=${css}>` + await template.text()

        this.shadowRoot.querySelector( 'i#close' )
            .onclick = () => 
                document.querySelector( 'main' ).innerHTML = '<home-page></home-page>'
            
        await this.view()  
    }

    async view() {
        let view = this.shadowRoot
        let firstname = view.querySelector( 'input#firstname' )
        let lastname = view.querySelector( 'input#lastname' )
        let male = view.querySelector( 'input#M' )
        let female = view.querySelector( 'input#F' )
        let birth_day = view.querySelector( 'input#birthDay' )
        let birth_month = view.querySelector( 'input#birthMonth' )
        let birth_year = view.querySelector( 'input#birthYear' )
        let dpt = view.querySelector( 'input#dpt' )
        let city = view.querySelector( 'input#city' )
        let station = view.querySelector( 'input#station' )

        let r = await fetch( '/api/users/profile' )
        if ( r.status === 200 || r.status === 304 ) {
            let user = await r.json()
            console.debug( user )
            /*view.querySelector( 'input#email' )
                .value = user.email*/
            
            firstname.value = user.firstname || null
            lastname.value = user.lastname || null
            male.checked = user.sex === 'M'
            female.checked = user.sex === 'F'
            birth_day.value = user.birthDay || null
            birth_month.value = user.birthMonth || null
            birth_year.value = user.birthYear || null
            dpt.value = user.dpt || null
            city.value = user.city || null
            station.value = user.station || null

            //Prénom
            firstname.onchange = async () => {
                let res = await post( { firstname: firstname.value } )
                if ( res.status === 200 ) {
                    firstname.classList.add( 'saved' )
                    document.dispatchEvent( new CustomEvent( 'updated', {
                        detail: { firstname: firstname.value },
                        bubble: true 
                    } ) )
                }
                else
                    console.warn( await res.json() )
            }

            //Nom
            lastname.onchange = async () => {
                let res = await post( { lastname: lastname.value } )
                if ( res.status === 200 )
                    lastname.classList.add( 'saved' )
                else 
                    console.warn( await res.json() ) 
            }
            
            //Sexe
            let sex_change = async ev => {
                let radio = ev.target
                let res = await post( { sex: radio.value } )
                if ( res.status === 200 ) 
                    radio.classList.add( 'saved' )
                else
                    console.warn( await res.json() ) 
            }
            
            male.onchange = sex_change
            female.onchange = sex_change

            //Date de naissance
            birth_day.onchange = async () => {
                let res = await post( { birthDay: birth_day.value } )
                if ( res.status === 200 ) 
                    birth_day.classList.add( 'saved' )
                else 
                    console.warn( await res.json() )
            }

            birth_month.onchange = async () => {
                let res = await post( { birthMonth: birth_month.value } )
                if ( res.status === 200 ) 
                    birth_month.classList.add( 'saved' )
                else 
                    console.warn( await res.json() )
            }

            birth_year.onchange = async () => {
                let res = await post( { birthYear: birth_year.value } )
                if ( res.status === 200 ) 
                    birth_year.classList.add( 'saved' )
                else 
                    console.warn( await res.json() )
            }

            //Département
            dpt.onchange = async () => {
                let res = await post( { dpt: dpt.value } )
                if ( res.status === 200 ) 
                    dpt.classList.add( 'saved' )
                else 
                    console.warn( await res.json() )               
            }

            //Commune
            city.onchange = async () => {
                let res = await post( { city: city.value } )
                if ( res.status === 200 ) 
                    city.classList.add( 'saved' )
                else 
                    console.warn( await res.json() )               
            }

            //Bureau de vote
            station.onchange = async () => {
                let res = await post( { station: station.value } )
                if ( res.status === 200 ) 
                    station.classList.add( 'saved' )
                else 
                    console.warn( await res.json() )               
            }


            

        }
    } 
}

customElements.define( 'user-profile', UserProfile )

export default UserProfile