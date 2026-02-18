import { View, Text, FlatList, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useState } from "react";
import { MAINCOLORS } from "@/constants/colors";

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

// ✅ フォントサイズに合わせて高さを調整 (48pxなら60以上がおすすめ)
const ITEM_HEIGHT = 60; 

export default function TimePickerWheel({ initialTime, onConfirm }: { initialTime: string, onConfirm: (time: string) => void }) {
    const [h, m] = initialTime.split(":");
    const [hour, setHour] = useState(h);
    const [minute, setMinute] = useState(m);

    const handleScroll = (type: "h" | "m", e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (type === "h") {
            if (HOURS[index]) setHour(HOURS[index]);
        } else {
            if (MINUTES[index]) setMinute(MINUTES[index]);
        }
    };

    return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
            {/* ホイール部分のコンテナ */}
            <View style={{ 
                height: ITEM_HEIGHT * 3, 
                flexDirection: "row", // 横並びに
                alignItems: "center", 
                justifyContent: "center",
                width: "100%",
            }}>
                
                {/* ✅ 選択枠：絶対配置で真ん中に固定 */}
                <View style={{
                    position: "absolute",
                    height: ITEM_HEIGHT,
                    top: ITEM_HEIGHT, // 3行のうちの真ん中
                    borderWidth: 1,
                    borderColor: MAINCOLORS.border,
                    borderRadius: 15,
                    width: 280, // 全体の幅に合わせて調整
                    zIndex: -1, // テキストの背面に
                }} />

                {/* 時間列 */}
                <WheelColumn 
                    data={HOURS} 
                    selected={hour} 
                    initialIndex={HOURS.indexOf(hour)}
                    onScroll={(e: any) => handleScroll("h", e)} 
                />
                
                {/* セパレーター */}
                <Text style={{ 
                    fontSize: 32, 
                    color: "white", 
                    fontWeight: "300", 
                    marginHorizontal: 10,
                    lineHeight: ITEM_HEIGHT 
                }}>:</Text>

                {/* 分列 */}
                <WheelColumn 
                    data={MINUTES} 
                    selected={minute} 
                    initialIndex={MINUTES.indexOf(minute)}
                    onScroll={(e: any) => handleScroll("m", e)} 
                />
            </View>

            {/* 設定完了ボタン */}
            <View style={{ marginTop: 40 }}>
                <Text 
                    onPress={() => onConfirm(`${hour}:${minute}`)}
                    style={{ 
                        color: MAINCOLORS.border, 
                        fontSize: 18, 
                        fontWeight: "600",
                        padding: 10 
                    }}
                >
                    設定完了
                </Text>
            </View>
        </View>
    );
}

function WheelColumn({ data, selected, onScroll, initialIndex }: any) {
    return (
        <View style={{ height: ITEM_HEIGHT * 3, width: 80 }}>
            <FlatList
                data={data}
                keyExtractor={(i) => i}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={onScroll}
                initialScrollIndex={initialIndex > 0 ? initialIndex : 0}
                getItemLayout={(_, index) => (
                    { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
                )}
                // 上下に余白を作ることで、選択肢が真ん中に来るようにする
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
                renderItem={({ item }) => (
                    <View style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{
                            textAlign: "center",
                            fontSize: 44, // 少しだけ小さく調整（枠に収まりやすくするため）
                            color: item === selected ? "white" : "rgba(255,255,255,0.2)",
                            fontWeight: "300",
                            letterSpacing: 2,
                        }}>
                            {item}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}