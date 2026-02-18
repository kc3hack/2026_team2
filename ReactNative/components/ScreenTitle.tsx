import { View, Text } from "react-native";

type Props = {
    title: string;
};

export default function ScreenTitle({ title }: Props) {
    return (
        <View
            style={{
                position: "absolute",
                top: 80,
                left: 0,
                right: 0,
                alignItems: "center",
            }}
        >
            <Text
                style={{
                color: "white",
                fontSize: 22,
                fontWeight: "600",
                }}
            >
                {title}
            </Text>
        </View>
    );
}
