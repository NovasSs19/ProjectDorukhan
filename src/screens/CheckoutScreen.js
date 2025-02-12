import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CheckoutScreen = ({ navigation, route }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  
  // Animation values
  const buttonScale = useSharedValue(1);
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));

  const handlePayment = () => {
    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 }, () => {
        runOnJS(setShowThankYou)(true);
        
        // Success animation
        successScale.value = withSpring(1, {
          damping: 10,
          stiffness: 100,
        });
        successOpacity.value = withTiming(1, { duration: 300 });

        // Auto close
        setTimeout(() => {
          successScale.value = withTiming(0, { duration: 300 });
          successOpacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(setShowThankYou)(false);
            runOnJS(navigation.reset)({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          });
        }, 2000);
      })
    );
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const matches = cleaned.match(/.{1,4}/g);
    const formatted = matches ? matches.join(' ') : cleaned;
    setCardNumber(formatted.slice(0, 19));
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setExpiryDate(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4));
    } else {
      setExpiryDate(cleaned);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payment Details</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="credit-card" size={24} color="#333" />
            <Text style={styles.cardHeaderText}>Credit Card</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={formatCardNumber}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                value={expiryDate}
                onChangeText={formatExpiryDate}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Amount:</Text>
          <Text style={styles.totalAmount}>₺{route.params?.total.toFixed(2) || '0.00'}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Animated.View style={[styles.payButtonContainer, buttonAnimatedStyle]}>
          <TouchableOpacity 
            style={styles.payButton} 
            onPress={handlePayment}
          >
            <Text style={styles.payButtonText}>
              Pay ₺{route.params?.total.toFixed(2) || '0.00'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Modal
        visible={showThankYou}
        transparent
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.thankYouContainer}>
            <Animated.View style={[styles.successCircle, successAnimatedStyle]}>
              <MaterialIcons name="check" size={50} color="#fff" />
            </Animated.View>
            <Text style={styles.thankYouTitle}>Order Confirmed!</Text>
            <Text style={styles.thankYouText}>
              Thank you for choosing Turkish Kitchen
            </Text>
            <Text style={styles.thankYouSubtext}>
              We look forward to serving you again!
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  payButtonContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  payButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: SCREEN_WIDTH - 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,
    elevation: 8,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  thankYouTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  thankYouText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  thankYouSubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default CheckoutScreen;
