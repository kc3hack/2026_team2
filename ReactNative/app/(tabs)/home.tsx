import { View, Text } from "react-native";
import { useState } from "react";
import ScreenTitle from "@/components/ScreenTitle";
import Button from "@/components/ui/Button";
import TimeBox from "@/components/ui/TimeBox";
import TimePickerModal from "@/components/ui/TimeBoxEdit";
import { MAINCOLORS } from "@/constants/colors";

export default function Home() {
    const [time, setTime] = useState("09:00");
    const [isEditing, setIsEditing] = useState(false);
    return (
        <View
        style={{
            flex: 1,
            backgroundColor: MAINCOLORS.Background,
            padding: 16,
        }}
        >
        <ScreenTitle title="アラーム時間" />
        {/* 編集モードじゃない時はTimeBox、編集時はピッカーを表示 */}
        {!isEditing ? (
            <TimeBox time={time} onPress={() => setIsEditing(true)} />
        ) : (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <TimePickerModal 
                    initialTime={time} 
                    onConfirm={(t) => {
                        setTime(t);
                        setIsEditing(false);
                    }} 
                />
            </View>
        )}
        <Button text="おきた"/>
        </View>
    );
}
