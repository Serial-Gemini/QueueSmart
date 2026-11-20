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
import AdminHomeScreen from "../screens/AdminHomeScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Offices: ["business", "business-outline"],
  Account: ["person", "person-outline"],
};

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={tabIcons[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
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
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
    </Stack.Navigator>
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
  if (role === "student") return <StudentStack />;
  if (role === "admin") return <AdminStack />;
  return <AuthStack />;
}