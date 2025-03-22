import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const BottomNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: 'home-outline', label: 'Home', path: '/dashboard/DashboardPage' },
    { icon: 'document-text-outline', label: 'File', path: '/dashboard/FilePage' },
    { icon: 'cloud-upload-outline', label: 'Upload', path: '/dashboard/UploadPage' },
    { icon: 'receipt-outline', label: 'Invoice', path: '/dashboard/InvoicePage' },
  ];

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          onPress={() => navigateTo(item.path)}
        >
          <Ionicons
            name={pathname === item.path ? item.icon.replace('-outline', '') : item.icon}
            size={24}
            color={pathname === item.path ? '#007bff' : '#666'}
          />
          <Text
            style={[
              styles.navLabel,
              { color: pathname === item.path ? '#007bff' : '#666' }
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingBottom: 25, // Extra padding for home button/notch area
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default BottomNavbar;
