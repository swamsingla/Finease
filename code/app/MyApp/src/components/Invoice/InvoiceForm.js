import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Switch
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function InvoiceForm({ formData, setFormData, onGenerate }) {
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        name: "",
        unitPrice: "0",
        discount: "0",
        qty: "1",
        taxType: "18",
        netAmount: "0"
      }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  const handleInputChange = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      
      // Calculate net amount automatically
      if (field === 'unitPrice' || field === 'discount' || field === 'qty') {
        const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
        const discount = parseFloat(newItems[index].discount) || 0;
        const qty = parseFloat(newItems[index].qty) || 0;
        const netAmount = (unitPrice - discount) * qty;
        newItems[index].netAmount = netAmount.toFixed(2);
      }
      
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const handleAddressChange = (value, addressType, field) => {
    setFormData((prev) => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value,
      },
    }));
  };

  const handleSameAsBilling = (value) => {
    setFormData((prev) => ({
      ...prev,
      sameAsBilling: value,
      shippingName: value ? prev.billingName : "",
      shippingAddress: value ? { ...prev.billingAddress } : {
        buildingNumber: "",
        address: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        countryCode: "",
      },
    }));
  };

  // For date picker
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = selectedDate.toISOString().split('T')[0];
      handleInputChange(currentDate, 'orderDate');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Seller Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seller Information</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Sold By:</Text>
          <TextInput
            style={styles.input}
            value={formData.soldBy}
            onChangeText={(text) => handleInputChange(text, 'soldBy')}
          />
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Building Number:</Text>
            <TextInput
              style={styles.input}
              value={formData.soldByAddress.buildingNumber}
              onChangeText={(text) => handleAddressChange(text, 'soldByAddress', 'buildingNumber')}
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Address:</Text>
            <TextInput
              style={styles.input}
              value={formData.soldByAddress.address}
              onChangeText={(text) => handleAddressChange(text, 'soldByAddress', 'address')}
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Landmark:</Text>
            <TextInput
              style={styles.input}
              value={formData.soldByAddress.landmark}
              onChangeText={(text) => handleAddressChange(text, 'soldByAddress', 'landmark')}
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>City:</Text>
            <TextInput
              style={styles.input}
              value={formData.soldByAddress.city}
              onChangeText={(text) => handleAddressChange(text, 'soldByAddress', 'city')}
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>State:</Text>
            <TextInput
              style={styles.input}
              value={formData.soldByAddress.state}
              onChangeText={(text) => handleAddressChange(text, 'soldByAddress', 'state')}
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Pincode:</Text>
            <TextInput
              style={styles.input}
              value={formData.soldByAddress.pincode}
              onChangeText={(text) => handleAddressChange(text, 'soldByAddress', 'pincode')}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Billing Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billing Information</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Billing Name:</Text>
          <TextInput
            style={styles.input}
            value={formData.billingName}
            onChangeText={(text) => handleInputChange(text, 'billingName')}
          />
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Building Number:</Text>
            <TextInput
              style={styles.input}
              value={formData.billingAddress.buildingNumber}
              onChangeText={(text) => handleAddressChange(text, 'billingAddress', 'buildingNumber')}
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Address:</Text>
            <TextInput
              style={styles.input}
              value={formData.billingAddress.address}
              onChangeText={(text) => handleAddressChange(text, 'billingAddress', 'address')}
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Landmark:</Text>
            <TextInput
              style={styles.input}
              value={formData.billingAddress.landmark}
              onChangeText={(text) => handleAddressChange(text, 'billingAddress', 'landmark')}
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>City:</Text>
            <TextInput
              style={styles.input}
              value={formData.billingAddress.city}
              onChangeText={(text) => handleAddressChange(text, 'billingAddress', 'city')}
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>State:</Text>
            <TextInput
              style={styles.input}
              value={formData.billingAddress.state}
              onChangeText={(text) => handleAddressChange(text, 'billingAddress', 'state')}
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Pincode:</Text>
            <TextInput
              style={styles.input}
              value={formData.billingAddress.pincode}
              onChangeText={(text) => handleAddressChange(text, 'billingAddress', 'pincode')}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Shipping Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <View style={styles.switchContainer}>
            <Text>Same as Billing</Text>
            <Switch
              value={formData.sameAsBilling}
              onValueChange={handleSameAsBilling}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={formData.sameAsBilling ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        {!formData.sameAsBilling && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Shipping Name:</Text>
              <TextInput
                style={styles.input}
                value={formData.shippingName}
                onChangeText={(text) => handleInputChange(text, 'shippingName')}
              />
            </View>

            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Building Number:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.shippingAddress.buildingNumber}
                  onChangeText={(text) => handleAddressChange(text, 'shippingAddress', 'buildingNumber')}
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Address:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.shippingAddress.address}
                  onChangeText={(text) => handleAddressChange(text, 'shippingAddress', 'address')}
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Landmark:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.shippingAddress.landmark}
                  onChangeText={(text) => handleAddressChange(text, 'shippingAddress', 'landmark')}
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>City:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.shippingAddress.city}
                  onChangeText={(text) => handleAddressChange(text, 'shippingAddress', 'city')}
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>State:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.shippingAddress.state}
                  onChangeText={(text) => handleAddressChange(text, 'shippingAddress', 'state')}
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Pincode:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.shippingAddress.pincode}
                  onChangeText={(text) => handleAddressChange(text, 'shippingAddress', 'pincode')}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </>
        )}
      </View>

      {/* Tax Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tax Information</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>PAN Number:</Text>
            <TextInput
              style={styles.input}
              value={formData.panNumber}
              onChangeText={(text) => handleInputChange(text, 'panNumber')}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>GST Number:</Text>
            <TextInput
              style={styles.input}
              value={formData.gstNumber}
              onChangeText={(text) => handleInputChange(text, 'gstNumber')}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>State/UT Code:</Text>
            <TextInput
              style={styles.input}
              value={formData.stateUtCode}
              onChangeText={(text) => handleInputChange(text, 'stateUtCode')}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Order Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Order Date:</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{formData.orderDate || "Select Date"}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.orderDate ? new Date(formData.orderDate) : new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Order Number:</Text>
            <TextInput
              style={styles.input}
              value={formData.orderNumber}
              onChangeText={(text) => handleInputChange(text, 'orderNumber')}
            />
          </View>
        </View>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddItem}
          >
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {formData.items.map((item, idx) => (
          <View key={idx} style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>Item #{idx + 1}</Text>
              {formData.items.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveItem(idx)}
                >
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Item Name:</Text>
                <TextInput
                  style={styles.input}
                  value={item.name}
                  onChangeText={(text) => handleItemChange(idx, 'name', text)}
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Unit Price:</Text>
                <TextInput
                  style={styles.input}
                  value={item.unitPrice}
                  onChangeText={(text) => handleItemChange(idx, 'unitPrice', text)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Discount:</Text>
                <TextInput
                  style={styles.input}
                  value={item.discount}
                  onChangeText={(text) => handleItemChange(idx, 'discount', text)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Quantity:</Text>
                <TextInput
                  style={styles.input}
                  value={item.qty}
                  onChangeText={(text) => handleItemChange(idx, 'qty', text)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Tax Type:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={item.taxType}
                    onValueChange={(value) => handleItemChange(idx, 'taxType', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="0%" value="0" />
                    <Picker.Item label="5%" value="5" />
                    <Picker.Item label="12%" value="12" />
                    <Picker.Item label="18%" value="18" />
                    <Picker.Item label="28%" value="28" />
                  </Picker>
                </View>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Net Amount:</Text>
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={item.netAmount}
                  editable={false}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.generateButton}
        onPress={onGenerate}
      >
        <Text style={styles.generateButtonText}>Generate Invoice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontWeight: '600',
  },
  removeButton: {
    color: 'red',
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginVertical: 20,
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    width: '100%',
  },
});