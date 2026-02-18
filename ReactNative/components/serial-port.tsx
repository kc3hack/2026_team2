import { UsbSerialManager, UsbSerial, Parity } from "react-native-usb-serialport-for-android";
import { ScrollView, Alert, Button } from "react-native";
import { useLayoutEffect, useState } from "react";

const SerialPortComponent = () => {
  const [usbSerial, setUsbSerial] = useState<UsbSerial | null>(null)
  useLayoutEffect(() => {
    initSerialPort()
  },[])

  async function initSerialPort() {
    try {
      // check for the available devices
      const devices = await UsbSerialManager.list();
      if (!devices || devices.length === 0) {
        Alert.alert('No USB devices found');
        return;
      }
      // Send request for the first available device
      const granted = await UsbSerialManager.tryRequestPermission(devices[0].deviceId);
      if (granted) {
        Alert.alert('USB permission granted');
        // open the port for communication
        const usbSerialport = await UsbSerialManager.open(devices[0].deviceId, { baudRate: 9600, parity: Parity.None, dataBits: 8, stopBits: 1 });
        setUsbSerial(usbSerialport)
      } else {
        Alert.alert('USB permission denied');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }

  async function sendData(data: string) {
    if (usbSerial) {
      try {
        await usbSerial.send(data)
      } catch(e) {
        console.error(e);
        Alert.alert('Error', e instanceof Error ? e.message : 'An unknown error occurred');
      }
    }
  }
  return (
    <ScrollView>
      <Button onPress={() => sendData('0x31')} title="WAKE UP!"/>
    </ScrollView>
  )
}

export default SerialPortComponent