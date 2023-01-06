const nameInput = document.querySelector('#name');
const submitButton = document.querySelector('.submit');

const userInfo = document.querySelector('.user_info');
const userBio = document.querySelector('.user_bio');
const favoriteLang = document.querySelector('.favorite_lang');

const actionResult = document.querySelector('.action_result');

makeEmpty();


// send request to server and get data for input username then call functions to show result
async function getInfo(e) {
    // delete previous result
    makeEmpty();

    let username = nameInput.value;
    e.preventDefault();
    if (checkValidity(username)) {

        // check if data is in local storage
        let data = await JSON.parse(window.localStorage.getItem(username));
        console.log("local storage")
        console.log(data)

        // data was not in local storage so we should call github api
        if (data == null){
            try {
                let response = await fetch(`https://api.github.com/users/${username}`);
                data = await response.json();
                console.log("api")
                console.log(data)

                // username not found
                if (response.status == 404) {
                    showAlert("User not found");
                    return;
                }

                // other errors
                else if (response.status != 200) {
                    showAlert("Error");
                    return Promise.reject(`Request failed with error ${response.status}`);
                }

                // find user and get result successfully
                else{
                    // find top 5 langs and add it to obj
                    data.langs = await findPopularLang(data);
                    //save to local storage
                    window.localStorage.setItem(username, JSON.stringify(data));
                }
            } catch (e) {
                showAlert("Network Error");
                // console.log(e);
            }
        }
        // show result in HTML
        setResultInHTML(data);
        // showAlert("User found");

    } else {
        showAlert("Invalid input!");
    }
}

// delete previous result
function makeEmpty(){
    actionResult.style.display = "none";
    favoriteLang.style.display = "none";

    userInfo.innerHTML = "";
    userBio.innerHTML = "";
    favoriteLang.innerHTML = "";
}

// show result to user
function setResultInHTML(obj) {
    favoriteLang.style.display = "block";

    if (obj != null) {
        userInfo.innerHTML = `
                            <img id="avatar" src=${obj.avatar_url} alt="Italian Trulli">
                            <div id="text_info">
                            <p><span class="title">Name: </span>${obj.name}</p>
                            <p><span class="title">Blog: </span><a href=${obj.blog}>${obj.blog}</a></p>
                            <p><span class="title">Location: </span>${obj.location} </p>
                            </div>
                            `
        userBio.innerHTML = `<pre id="userBio"><span class="title">Bio: </span>${obj.bio} </pre>`
        favoriteLang.innerHTML += '<div id="favoriteLang"><span class="title">5 Top Lang: </span><ol>'
        for (lang of obj.langs){
            console.log(lang)
            favoriteLang.innerHTML += `<li>${lang[0]}</li>`;
        }
        favoriteLang.innerHTML += '</ol></div>'
        
    } else {
        showAlert("Can't Find!");
    }
}

// find top 5 langs
async function findPopularLang(input){
    // get user last pushed repo
    username = input.login
    let response = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&order=desc`);
    let data = await response.json();
    // console.log(data);
    
    // get language of 5 last pushed repos
    languages = []
    i = 0
    for (repo of data){
        if (i == 5)
            break;
        i += 1;
        response = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`);
        repo_langs = await response.json();
        languages = Object.assign({}, repo_langs, languages);
    }
    // console.log(languages);

    // sort languages by most used

    // Create languages array
    var languages = Object.keys(languages).map((key) => {return [key, languages[key]];});
    
    // Sort the array based on the second element
    languages.sort((first, second) => {return second[1] - first[1];});
    
  // Return a new array with only the first 5 languages
  return languages.slice(0, 5);
    
}

// this function check input name validity
function checkValidity(username) {
    const regex1 = /^[A-Za-z][A-Za-z0-9_]+/g;
    const foundValid = username.match(regex1);
    return true

}

// show error 
function showAlert(title) {
    actionResult.style.display = "block";
    actionResult.innerHTML = "<span>" + title + "</span>";
    setTimeout(() => { // removes the error message from screen after 4 seconds.
        actionResult.style.display = "none";
    }, 4000);
}

// set event handler for submit button
submitButton.addEventListener('click', getInfo);

// clear local storage with each refresh
window.localStorage.clear();
