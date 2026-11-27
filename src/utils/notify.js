import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications() {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Queue updates",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") await Notifications.requestPermissionsAsync();
  } catch {}
}

export async function notify(title, body) {
  try {
    await Notifications.scheduleNotificationAsync({ content: { title, body, sound: true }, trigger: null });
  } catch {}
}