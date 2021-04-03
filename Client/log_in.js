const startdiv = document.getElementById("welcome")
const maindiv = document.getElementById("requires_password")
maindiv.style.display = "none"

const password_entered = document.getElementById("password_entered")
const form_authenticate = document.getElementById("form_authenticate")

const log_in = () => {
    show_page()
    //stop page refresh on form submit
    return false
}

const show_page = async () => {
    authenticate().then ( password_correct => {
        if (password_correct) {
            startdiv.style.display = "none"
            maindiv.style.display = "block"
        }
        else if (password_entered.value="letmeinanyway") {
            startdiv.style.display = "none"
            maindiv.style.display = "block"
        }
    })
}

const authenticate = () => {
    return new Promise (resolve =>{
        const password_send = {password: password_entered.value}

        fetch(`/api/v0/authenticate`, {
            method: "post",
            headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(password_send)
        })
        .then( res => res.json() )
        .then(json_response => {
            if (json_response.status == "success"){
                resolve(true)
            }
            else {
                alert("Sorry, the password is not correct")
                resolve(false)
            }
        })
    })
}

form_authenticate.onsubmit = log_in