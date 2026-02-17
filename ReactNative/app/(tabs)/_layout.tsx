import { Tabs } from "expo-router";
import { MAINCOLORS } from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
    const iconSize = 30
    return (
        <Tabs
        initialRouteName="home"
        
        screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarStyle: {
                backgroundColor: MAINCOLORS.Background,
                paddingTop: 5,
            },
            tabBarActiveTintColor: "white", 
            tabBarInactiveTintColor: "rgba(255,255,255,0.3)",
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
            name="connect"
            options={{
                tabBarIcon: ({ color }) => (
                    <MaterialIcons name="cable" size={iconSize} color={color} />
                ),
            }}
        />
        </Tabs>
    );
}
