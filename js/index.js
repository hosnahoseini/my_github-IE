const nameInput = document.querySelector('#name');
const submitButton = document.querySelector('.submit');

// send request to server and get data for input name then call functions to show result
async function getGender(e) {
    let name = nameInput.value;
    e.preventDefault();
    if (checkValidity(name)) {
        let data = await JSON.parse(window.localStorage.getItem(name));

        if (data == null){
            try {
                let response = await fetch(`https://api.github.com/users/${name}`);
                let data = await response.json();
                if (response.status != 200) {
                    return Promise.reject(`Request failed with error ${response.status}`);
                }
                window.localStorage.setItem(name, JSON.stringify(data));
            } catch (e) {
                console.log(e);
            }
        }
    } else {
        showAlert("Invalid input!");
    }
}

// this function check input name validity
function checkValidity(name) {
    const regex1 = /[A-Za-z ]+/g;
    const regex2 = /[0-9\.\-\/]+/g;
    const foundValid = name.match(regex1);
    const foundNotValid = name.match(regex2);
    if (foundNotValid == null && foundValid.length > 0) {
        return true;
    }
    return false;

}

// show error 
function showAlert(title) {
    actionResult.style.display = "block";
    actionResult.innerHTML = "<span>" + title + "</span>";
    setTimeout(() => { // removes the error message from screen after 4 seconds.
        actionResult.style.display = "none";
    }, 4000);
}

submitButton.addEventListener('click', getGender);
window.localStorage.clear();
