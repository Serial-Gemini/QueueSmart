import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./src/screens/HomeScreen";
import OfficeDetailScreen from "./src/screens/OfficeDetailScreen";

export default function App() {
  const [selectedOffice, setSelectedOffice] = useState(null);

  return (
    <>
      <StatusBar style="dark" />
      {selectedOffice ? (
        <OfficeDetailScreen
          office={selectedOffice}
          onBack={() => setSelectedOffice(null)}
        />
      ) : (
        <HomeScreen onSelectOffice={setSelectedOffice} />
      )}
    </>
  );
}
