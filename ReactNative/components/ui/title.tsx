import { ReactNode } from "react";
import { Text } from "react-native";
import { FontColors } from "@/constants/colors";

export type TitleProps = {
  children: ReactNode;
};
export default function Title({ children }: TitleProps) {
  return (
    <Text
      style={{ fontSize: 24, fontWeight: "bold", color: FontColors.maincolors }}
    >
      {children}
    </Text>
  );
}
