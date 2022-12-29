const nameInput = document.querySelector('#name');
const submitButton = document.querySelector('.submit');

const userInfo = document.querySelector('.user_info');
const userBio = document.querySelector('.user_bio');

const actionResult = document.querySelector('.action_result');



// send request to server and get data for input name then call functions to show result
async function getInfo(e) {
    let name = nameInput.value;
    e.preventDefault();
    if (checkValidity(name)) {
        let data = await JSON.parse(window.localStorage.getItem(name));
        console.log("local storage")
        console.log(data)
        if (data == null){
            try {
                let response = await fetch(`https://api.github.com/users/${name}`);
                let data = await response.json();
                console.log("api")
                console.log(data)
                if (response.status == 404) {
                    showAlert("User not found");
                    return;
                }
                else if (response.status != 200) {
                    showAlert("User not found");
                    return Promise.reject(`Request failed with error ${response.status}`);
                }
                else{
                window.localStorage.setItem(name, JSON.stringify(data));
                }
            } catch (e) {
                console.log(e);
            }
        }

        setPrediction(data);
        showAlert("User found");

    } else {
        showAlert("Invalid input!");
    }
}

// show Prediction result to user
function setPrediction(obj) {
    console.log("setting ...")
    if (obj != null) {
        userInfo.innerHTML = `
                            <img id="avatar" src=${obj.avatar_url} alt="Italian Trulli">
                            <div id="text_info">
                            <p><span class="title">Name: </span>${obj.name}</p>
                            <p><span class="title">Blog: </span><a href=${obj.blog}>${obj.blog}</a></p>
                            <p><span class="title">Location: </span>${obj.location} </p>
                            </div>
                            `
        userBio.innerHTML = `<pre><span class="title">Bio: </span>${obj.bio} </pre>`
        findPopularLang(obj.name);
    } else {
        showAlert("Can't Find!");
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
    return true;

}

// show error 
function showAlert(title) {
    actionResult.style.display = "block";
    actionResult.innerHTML = "<span>" + title + "</span>";
    setTimeout(() => { // removes the error message from screen after 4 seconds.
        actionResult.style.display = "none";
    }, 4000);
}

submitButton.addEventListener('click', getInfo);
// window.localStorage.clear();
