import { View, Text } from "react-native";
import ScreenTitle from "@/components/ScreenTitle";
import { MAINCOLORS } from "@/constants/colors";

export default function Connect() { 
    return (
        <View
        style={{
            flex: 1,
            backgroundColor: MAINCOLORS.Background,
            padding: 16,
        }}
        >
        <ScreenTitle title="iot接続" />
        <Text>aaaa</Text>
        
        </View>
    )
}