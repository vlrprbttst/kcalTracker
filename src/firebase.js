const firebaseConfig = {
  apiKey: "AIzaSyBCY1ONerEeZ6Ysa34222hZ-JzJ_rIjcZI",
  authDomain: "kcaltracker-5dd56.firebaseapp.com",
  projectId: "kcaltracker-5dd56",
  storageBucket: "kcaltracker-5dd56.firebasestorage.app",
  messagingSenderId: "857152386346",
  appId: "1:857152386346:web:d28c844e6291c315471a53",
};
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const ALLOWED_UID = "f1rMJWrezfORvihvxM5EspY3FsA3";
