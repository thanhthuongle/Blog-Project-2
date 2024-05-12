// const express = require('express');
  
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

 const User = {
    ID : localStorage.getItem('SGHBUserID'),
}

module.exports = User;
