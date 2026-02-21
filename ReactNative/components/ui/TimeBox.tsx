import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { MainColors, FontColors } from "@/constants/colors";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0"),
);
const ITEM_HEIGHT = 60;

// 循環スクロール用のデータ生成
const REPEAT_COUNT = 100;
const createInfiniteData = (data: string[]) => {
  const result = [];
  for (let i = 0; i < REPEAT_COUNT; i++) {
    result.push(...data);
  }
  return result;
};

export type TimeBoxProps = {
  initialTime?: string;
  disabled?: boolean;
  onConfirm: (time: string) => void;
};

export default function TimeBox({
  initialTime = "00:00",
  disabled,
  onConfirm,
}: TimeBoxProps) {
  const [h, m] = initialTime.split(":");
  const [editing, setEditing] = useState(false);
  const [hour, setHour] = useState(h);
  // 分を5分刻みに丸める
  const roundedMinute = (Math.round(parseInt(m) / 5) * 5)
    .toString()
    .padStart(2, "0");
  const [minute, setMinute] = useState(roundedMinute);

  // initialTimeが外部から変更されたら状態を更新
  useEffect(() => {
    if (!editing) {
      const [newH, newM] = initialTime.split(":");
      setHour(newH);
      const newRoundedMinute = (Math.round(parseInt(newM) / 5) * 5)
        .toString()
        .padStart(2, "0");
      setMinute(newRoundedMinute);
    }
  }, [initialTime, editing]);

  const handleScroll = (
    type: "h" | "m",
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (type === "h") {
      const actualIndex = index % HOURS.length;
      if (HOURS[actualIndex]) setHour(HOURS[actualIndex]);
    } else {
      const actualIndex = index % MINUTES.length;
      if (MINUTES[actualIndex]) setMinute(MINUTES[actualIndex]);
    }
  };

  const handleConfirm = () => {
    onConfirm(`${hour}:${minute}`);
    setEditing(false);
  };

  return (
    <Pressable onPress={() => setEditing(true)} disabled={editing || disabled}>
      <View
        style={{
          height: 270,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          padding: 12,
        }}
      >
        <View
          style={{
            width: 300,
            height: 100,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            borderWidth: 1,
            borderColor: MainColors.border,
            borderRadius: 24,
            overflow: editing ? "visible" : "hidden",
          }}
        >
          {editing ? (
            <Wheel
              data={HOURS}
              selected={hour}
              initialIndex={HOURS.indexOf(hour)}
              onScroll={(e: any) => handleScroll("h", e)}
            />
          ) : (
            <Text
              style={{
                fontSize: 48,
                color: FontColors.maincolors,
                fontWeight: "300",
              }}
            >
              {hour}
            </Text>
          )}
          <Text style={{ fontSize: 48, color: FontColors.maincolors }}>:</Text>
          {editing ? (
            <Wheel
              data={MINUTES}
              selected={minute}
              initialIndex={MINUTES.indexOf(minute)}
              onScroll={(e: any) => handleScroll("m", e)}
            />
          ) : (
            <Text
              style={{
                fontSize: 48,
                color: FontColors.maincolors,
                fontWeight: "300",
              }}
            >
              {minute}
            </Text>
          )}
        </View>
        {editing && (
          <Pressable onPress={handleConfirm} style={{ marginTop: 40 }}>
            <Text
              style={{
                color: MainColors.border,
                fontSize: 18,
                fontWeight: "600",
                padding: 10,
              }}
            >
              設定完了
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

function Wheel({ data, selected, onScroll, initialIndex }: any) {
  const infiniteData = createInfiniteData(data);
  const middleStart = Math.floor(REPEAT_COUNT / 2) * data.length;
  const initialScrollIndex = middleStart + initialIndex;

  return (
    <View style={{ height: ITEM_HEIGHT * 3, width: 80 }}>
      <FlatList
        data={infiniteData}
        keyExtractor={(item, index) => `${item}-${index}`}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onScroll}
        initialScrollIndex={initialScrollIndex > 0 ? initialScrollIndex : 0}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
        renderItem={({ item, index }) => {
          const actualIndex = index % data.length;
          const isSelected = data[actualIndex] === selected;
          return (
            <View
              style={{
                height: ITEM_HEIGHT,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 44,
                  color: isSelected
                    ? FontColors.maincolors
                    : "rgba(255,255,255,0.2)",
                  fontWeight: "300",
                  letterSpacing: 2,
                }}
              >
                {item}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}
