//Connexion
import LogIn from './login.js'

connect.onclick = ev => {
    var login = new LogIn
    ev.target.appendChild( login )
}
