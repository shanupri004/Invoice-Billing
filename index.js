/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import './src/assets/fonts/globalFont';
import { name as appName } from './app.json';

// Required by notifee to handle notification events while the app is in the background.
notifee.onBackgroundEvent(async () => {});

AppRegistry.registerComponent(appName, () => App);
