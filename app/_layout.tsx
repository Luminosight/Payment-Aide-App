import 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from '../src/context/AppContext';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { formatMonth, addMonths } from '../src/utils/formatters';
import { Colors } from '../src/constants/theme';
import ErrorBoundary from '../src/components/ErrorBoundary';

function HeaderRight() {
  const { selectedMonth, setSelectedMonth } = useApp();
  return (
    <View style={styles.monthNav}>
      <Pressable onPress={() => setSelectedMonth(addMonths(selectedMonth, -1))} style={styles.chevron}>
        <Ionicons name="chevron-back" size={18} color={Colors.textPrimary} />
      </Pressable>
      <Text style={styles.monthText}>{formatMonth(selectedMonth)}</Text>
      <Pressable onPress={() => setSelectedMonth(addMonths(selectedMonth, 1))} style={styles.chevron}>
        <Ionicons name="chevron-forward" size={18} color={Colors.textPrimary} />
      </Pressable>
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.accent} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

function AppContent() {
  const { isLoaded } = useApp();

  if (!isLoaded) return <LoadingScreen />;

  return (
    <>
      <StatusBar style="light" />
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: Colors.border },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
          drawerActiveTintColor: Colors.accent,
          drawerInactiveTintColor: Colors.textSecondary,
          drawerLabelStyle: { fontSize: 15, fontWeight: '500', marginLeft: -10 },
          drawerStyle: { width: 280, backgroundColor: Colors.surface },
          drawerContentStyle: { backgroundColor: Colors.surface },
          headerRight: () => <HeaderRight />,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Payment Aide',
            drawerLabel: 'Home',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="users"
          options={{
            title: 'Manage Users',
            drawerLabel: 'Manage Users',
            headerRight: undefined,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="billers"
          options={{
            title: 'Manage Billers',
            drawerLabel: 'Manage Billers',
            headerRight: undefined,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="business-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Settings',
            drawerLabel: 'Settings',
            headerRight: undefined,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  chevron: {
    padding: 6,
    borderRadius: 8,
  },
  monthText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 110,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 16,
  },

});
