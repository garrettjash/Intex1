/*!
* Start Bootstrap - Coming Soon v6.0.7 (https://startbootstrap.com/theme/coming-soon)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-coming-soon/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

// let loggedIn = false;


function redirectToPage(pageName) {
  console.log(':user_id')
    if (pageName === 'login') {
      window.location.href = '/login'; // Replace 'login.html' with the actual URL of your login page
    } else if (pageName === 'add') {
      window.location.href = '/socialmedia'; // Replace 'add.html' with the actual URL of your 'Add' page
    } else if (pageName === 'insights') {
      window.location.href = '/insights'; // Replace 'add.html' with the actual URL of your 'Add' page
    } else if (pageName === 'admin/1') {
      window.location.href = '/admin'; // Replace 'add.html' with the actual URL of your 'Add' page
    } else if (pageName === 'home') {
      window.location.href = '/'; // Replace 'add.html' with the actual URL of your 'Add' page
    } else if (pageName === 'create') {
      window.location.href = '/createUser'; // Replace 'add.html' with the actual URL of your 'Add' page
    } else if (pageName === 'report') {
      window.location.href = '/report'; // Replace 'add.html' with the actual URL of your 'Add' page
    } else if (pageName === 'editUser') {
      window.location.href = '/editUser'; // Replace 'add.html' with the actual URL of your 'Add' page
    } else if (pageName === 'adminManage') {
      window.location.href = '/adminManage'; // Replace 'add.html' with the actual URL of your 'Add' page
    } else if (pageName === 'userLanding') {
      window.location.href = '/userLanding'; // Replace 'add.html' with the actual URL of your 'Add' page
    } else if (pageName === 'userReport') {
      window.location.href = '/userReport'; // Replace 'add.html' with the actual URL of your 'Add' page
    }
  }




  // function login()
// {
//     //IF they login with a correct username and password, do this stuff
//     loggedIn = true;
// }

// function logout()
// {
//     loggedIn = false;
// }

// function hiddenTabs()
// {

//   let loggedIn = false;

//     if (loggedIn = true)
//     {
//         document.getElementById("loginView").hidden = true;

//         document.getElementById("adminView").hidden = false;
//     }
//     else
//     {
//         document.getElementById("createUserView").hidden = true;
//         document.getElementById("logoutView").hidden = true;
//         document.getElementById("reportView").hidden = true;
//         document.getElementById("adminView").hidden = true;
//     }
// };

// module.exports = hiddenTabs;

// window.onload = hiddenTabs;