import { Tabs } from "expo-router";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CatBackground from "@/components/CatBackground";
import { MainColors } from "@/constants/colors";

export default function TabLayout() {
  const iconSize = 31;

  return (
    <View style={{ flex: 1 }}>
      {/* 自作の耳付き背景を最背面に配置 */}
      <CatBackground />

      <Tabs
        initialRouteName="home"
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          // ★ 各画面の背景を透明にして、背面の耳付き背景が見えるようにする
          sceneStyle: { backgroundColor: 'transparent' }, 
          tabBarStyle: {
            backgroundColor: MainColors.Background,
            borderTopWidth: 2,
            elevation: 0, // Androidの影を消す
            paddingTop: 5,
          },
          tabBarActiveTintColor: "#765013",
          tabBarInactiveTintColor: "#ffff",
        }}
      >
        <Tabs.Screen
          name="data"
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="analytics" size={iconSize} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="alarm" size={iconSize} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="settings" size={iconSize} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}