import { StatusBar } from 'expo-status-bar';

import TimerScreen from './src/TimerScreen';

export default function App() {
  return (
    <>
      <TimerScreen />
      <StatusBar style="auto" />
    </>
  );
}
