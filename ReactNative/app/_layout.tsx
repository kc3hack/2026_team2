import { Stack } from "expo-router";
import { SerialPortProvider } from "../contexts/SerialPortContext";

export default function RootLayout() {
  return (
    <SerialPortProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SerialPortProvider>
  );
}
