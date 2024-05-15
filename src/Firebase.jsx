import firebase from "firebase/compat/app";
import 'firebase/compat/database';

const firebaseConfig = {
    apiKey: "AIzaSyB_kohLKlNzKsiIRSS1QyROxruCK8rD-I0",
    authDomain: "pbl5-3cc9a.firebaseapp.com",
    databaseURL: "https://pbl5-3cc9a-default-rtdb.firebaseio.com",
    projectId: "pbl5-3cc9a",
    storageBucket: "pbl5-3cc9a.appspot.com",
    messagingSenderId: "461144909109",
    appId: "1:461144909109:web:25c25cb16b7fcb946d187c"
  };

  firebase.initializeApp(firebaseConfig);

  export const dataRef = firebase.database();
  export default firebase;
