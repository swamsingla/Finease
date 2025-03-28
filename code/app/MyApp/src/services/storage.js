// filepath: /taxfile-pro-mobile/taxfile-pro-mobile/src/services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@taxfile_pro_storage';

export const saveData = async (data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving data:', e);
  }
};

export const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error retrieving data:', e);
  }
};

export const removeData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error removing data:', e);
  }
};