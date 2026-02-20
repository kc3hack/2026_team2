import { Dimensions, View, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";

type Props = {
    labels: string[];
    data: number[];
};

export default function SleepChart({ labels, data }: Props) {
    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth - 32;

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
                // 影をつけてカードっぽくする場合（お好みで）
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
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
                    datasets: [{
                        data,
                        strokeWidth: 5, // 線を少し太くして密度を出す
                    }],
                }}
                width={chartWidth} // コンテナと同じ幅に設定
                height={200}
                segments={1}
                fromZero
                bezier // 曲線にして滑らかにする
                withDots={false}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLabels={false}
                chartConfig={{
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(60, 189, 244, ${opacity})`,
                    labelColor: () => "#333",
                }}
                formatYLabel={(value) => (Number(value) === 0 ? "深い" : "浅い")}
                style={{
                    // ★ ここが重要！
                    // paddingRightを大きくすると、グラフの描画エリアが左にギュッと凝縮されます
                    paddingRight: 40, 
                    // 左側の余白も少し調整
                    paddingLeft: 0,
                }}
            />

            {/* 下のラベル（位置を微調整） */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingLeft: 35, // Y軸ラベルの幅に合わせる
                paddingRight: 15, // paddingRightと連動させて右端を合わせる
            }}>
                <Text style={{ color: '#999', fontSize: 12, top: -20 }}>{labels[0]}</Text>
                <Text style={{ color: '#999', fontSize: 12, top: -20 }}>{labels[labels.length - 1]}</Text>
            </View>
        </View>
    );
}