//Connexion
import '/app/user-name/user-name.js'

//Candidatures
import ElectionChoice from '/app/election-choice/election-choice.js'

document.addEventListener( 'registered', () => {
    enroll.href = '#'
    enroll.removeAttribute( 'disabled' )
} )

enroll.onclick = () =>
    document.body.appendChild( new ElectionChoice )