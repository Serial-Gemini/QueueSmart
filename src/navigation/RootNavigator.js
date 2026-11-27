import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { isFirebaseConfigured } from "../firebase";
import { colors } from "../theme";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import OfficeDetailsScreen from "../screens/OfficeDetailsScreen";
import ScanScreen from "../screens/ScanScreen";
import AccountScreen from "../screens/AccountScreen";
import AdminQueueScreen from "../screens/AdminQueueScreen";
import AdminQrScreen from "../screens/AdminQrScreen";
import TicketScreen from "../screens/TicketScreen";
import { TicketProvider } from "../context/TicketContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const studentIcons = {
  Offices: ["business", "business-outline"],
  Account: ["person", "person-outline"],
};
const adminIcons = {
  Queue: ["list", "list-outline"],
  QR: ["qr-code", "qr-code-outline"],
  Account: ["person", "person-outline"],
};

const tabOptions = (icons) => ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.muted,
  tabBarStyle: { borderTopColor: colors.border },
  tabBarIcon: ({ focused, color, size }) => (
    <Ionicons name={icons[route.name][focused ? 0 : 1]} size={size} color={color} />
  ),
});

function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions(studentIcons)}>
      <Tab.Screen name="Offices" component={HomeScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function StudentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={StudentTabs} />
      <Stack.Screen name="OfficeDetails" component={OfficeDetailsScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Ticket" component={TicketScreen} />
    </Stack.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions(adminIcons)}>
      <Tab.Screen name="Queue" component={AdminQueueScreen} />
      <Tab.Screen name="QR" component={AdminQrScreen} options={{ tabBarLabel: "QR Code" }} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { role, loading } = useAuth();

  if (!isFirebaseConfigured) return <StudentStack />; // preview mode

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Role-based access: each role only ever gets its own navigator
  if (role === "student") return <TicketProvider><StudentStack /></TicketProvider>;
  if (role === "admin") return <AdminTabs />;
  return <AuthStack />;
}