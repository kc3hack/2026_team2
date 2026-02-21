import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { FontColors, MainColors } from "@/constants/colors";

export type SettingSectionProps = {
  title: string;
  children: ReactNode;
};
export type SettingItemProps = {
  title: string;
  description?: string;
  onPress?: () => void;
  children?: ReactNode;
};

export function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <View
      style={{
        flexDirection: "column",
        gap: 12,
        width: "100%",
        paddingBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          color: FontColors.title,
        }}
      >
        {title}
      </Text>
      <View style={{ gap: 12 }}>{children}</View>
    </View>
  );
}

export function SettingItem({
  title,
  description,
  onPress,
  children,
}: SettingItemProps) {
  return (
    <Pressable onPress={onPress} style={{ width: "100%" }} disabled={!onPress}>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 6,
          paddingVertical: 6,
          gap: 12,
          borderWidth: 2,
          borderColor: MainColors.border,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: FontColors.maincolors,
          }}
        >
          {title}
        </Text>
        {children ?? <>{children}</>}
      </View>
    </Pressable>
  );
}
