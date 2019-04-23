//Connexion
import '/app/user-name/user-name.js'

//Candidatures
import ElectionChoice from '/app/election-choice/election-choice.js'

document.addEventListener( 'registered', () => 
    enroll.href = '#'
)

enroll.onclick = () =>
    document.body.appendChild( new ElectionChoice )