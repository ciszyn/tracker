import {writeFileSync} from 'fs';

const targetPath = './src/environment/environment.prod.ts';

const envConfigFile = `export const environment = {
  firebase: {
    apiKey: '${process.env['FIREBASE_API_KEY']}',
    authDomain: 'tracker-f56ce.firebaseapp.com',
    databaseURL: 'https://tracker-f56ce-default-rtdb.europe-west1.firebasedatabase.app/',
    projectId: 'tracker-f56ce',
    storageBucket: 'tracker-f56ce.appspot.com',
    messagingSenderId: '${process.env['FIREBASE_SENDER_ID']}',
    appId: '${process.env['FIREBASE_APP_ID']}',
  },
  production: true,
};
`;

writeFileSync(targetPath, envConfigFile, 'utf8');
