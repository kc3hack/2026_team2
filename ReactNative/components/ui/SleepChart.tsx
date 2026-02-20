import { Dimensions, View, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";

type Props = {
    labels: string[];
    data: number[];
};

export default function SleepChart({ labels, data }: Props) {
    const screenWidth = Dimensions.get("window").width;

    if (!data.length || !labels.length) return null;

    return (
        <View
            style={{
                borderRadius: 20,
                marginTop: 40,
                backgroundColor: "#ffffff",
                overflow: "hidden",
                width: screenWidth - 32,
                alignSelf: "center",
            }}
        >
        <Text
            style={{
                fontSize: 18,
                fontWeight: "bold",
                marginVertical: 16,
                textAlign: "center",
                color: "#3CBDF4",
            }}
        >
            本日の睡眠グラフ
        </Text>
        <LineChart
            data={{
                labels,
                datasets: [{ data }],
            }}
            width={screenWidth - 32}
            height={220}
            segments={1}
            fromZero
            chartConfig={{
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) =>
                `rgba(60, 189, 244, ${opacity})`,
                labelColor: () => "#333",
            }}
            formatYLabel={(value) => {
                return Number(value) === 0 ? "深い" : "浅い";
            }}
        />
        </View>
    );
}