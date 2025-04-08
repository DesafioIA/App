import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="diabetes" options={{ title: 'Calculadora' }} />
    </Tabs>
  );
}
