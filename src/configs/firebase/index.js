import firebase from 'firebase'


const firebaseConfig = {
    apiKey: "AIzaSyBuuOidyQXi50Yo1n7wXM3MqO8eraId48Y",
    authDomain: "ianfinalbackend.firebaseapp.com",
    projectId: "ianfinalbackend",
    storageBucket: "ianfinalbackend.appspot.com",
    messagingSenderId: "872904589303",
    appId: "1:872904589303:web:00635a4a03507dfdea78f2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase