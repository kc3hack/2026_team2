import { Dimensions,View,Text } from "react-native";
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
                marginTop: 80,
                backgroundColor: "#ffffff",
                overflow: "hidden",
            }}
        >
        <Text
            style={{
            fontSize: 18,
            fontWeight: "bold",
            margin: 12,
            textAlign: "center",
            color: "#3CBDF4"
            }}
        >
            本日の睡眠グラフ
        </Text>
        <LineChart
        data={{
            labels: labels,
            datasets: [
            {
                data: data,
            },
            ],
        }}
        width={screenWidth - 20}
        height={220}
        yAxisInterval={1}
        chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(60, 189, 244, ${opacity})`,
            labelColor: () => "#333",
        }}
        bezier
        withDots={false}
        withInnerLines
        fromZero
        segments={1}
        strokeWidth={3}
        propsForBackgroundLines={{
            stroke: "#E5E5E5",
        }}
        formatYLabel={(value) =>
            Number(value) === 1 ? "レム" : "ノンレム"
        }
        />
        </View>
    );
}
