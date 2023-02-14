import {writeFileSync} from 'fs';

const targetPath = './src/environment/environment.prod.ts';

const envConfigFile = `export const environment = {
  firebase: {
    apiKey: '${process.env['FIREBASE_API_KEY']}',
    authDomain: 'pong-b7547.firebaseapp.com',
    databaseURL:
      'https://pong-b7547-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'pong-b7547',
    storageBucket: 'pong-b7547.appspot.com',
    messagingSenderId: '${process.env['FIREBASE_SENDER_ID']}',
    appId: '${process.env['FIREBASE_APP_ID']}',
  },
  production: true,
};
`;

writeFileSync(targetPath, envConfigFile, 'utf8');
