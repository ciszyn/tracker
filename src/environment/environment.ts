import { secrets } from "src/secrets/secrets";

export const environment = {
  firebase: {
    apiKey: secrets.firebaseApiKey,
    authDomain: 'tracker-f56ce.firebaseapp.com',
    databaseURL: 'https://tracker-f56ce-default-rtdb.europe-west1.firebasedatabase.app/',
    projectId: 'tracker-f56ce',
    storageBucket: 'tracker-f56ce.appspot.com',
    messagingSenderId: secrets.firebaseMessagingSenderId,
    appId: secrets.firebaseAppId,
  }
}
