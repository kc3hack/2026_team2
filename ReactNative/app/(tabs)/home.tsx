import { View } from "react-native";
import { useState } from "react";
import Button from "@/components/ui/Button";
import TimeBox from "@/components/ui/TimeBox";
import { MAINCOLORS } from "@/constants/colors";
import { setData } from "@/utils/alarm";
import Title from "@/components/ui/title";

export default function Home() {
  const [time, setTime] = useState("09:00");
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: MAINCOLORS.Background,
        // justifyContent: "center",
        alignItems: "center",
        paddingTop: 108,
        gap: 84,
      }}
    >
      <Title>Home</Title>
      <TimeBox
        onConfirm={(t) => {
          setTime(t);
        }}
      />
      <Button>stop</Button>
    </View>
  );
}
