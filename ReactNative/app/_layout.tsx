import { Stack } from "expo-router";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

const DummySerialPortProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

let SerialPortProvider: React.FC<{ children: React.ReactNode }> =
  DummySerialPortProvider;

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (Platform.OS === "android" && !isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const contextModule = require("../contexts/SerialPortContext");
    SerialPortProvider = contextModule.SerialPortProvider;
  } catch (error) {
    console.warn("Failed to load SerialPortProvider:", error);
  }
}

export default function RootLayout() {
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  if (Platform.OS === "android" && !isExpoGo) {
    return (
      <SerialPortProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SerialPortProvider>
    );
  } else {
    return <Stack screenOptions={{ headerShown: false }} />;
  }
}
