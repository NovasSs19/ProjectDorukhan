import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { products } from '../data/products';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  // State management for cart and UI
  const [cartItems, setCartItems] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Main Dishes');
  
  // References for animations and measurements
  const cartButtonRef = useRef();

  // Add item to cart with animation
  const addToCart = (item, event) => {
    // Get the position of the cart button
    cartButtonRef.current.measure((fx, fy, width, height, px, py) => {
      const cartPosition = { x: px, y: py };
      
      // Create new animated values for this item
      const scale = useSharedValue(1);
      const position = useSharedValue({ x: 0, y: 0 });
      
      // Calculate the distance to move
      const moveX = cartPosition.x - event.nativeEvent.pageX;
      const moveY = cartPosition.y - event.nativeEvent.pageY;
      
      // Run the animation
      scale.value = withTiming(0.1, { duration: 500 });
      position.value = withSpring({ 
        x: moveX, 
        y: moveY 
      }, {
        damping: 12,
        stiffness: 100
      });

      // Add item to cart after animation
      setTimeout(() => {
        const existingItem = cartItems.find(i => i.id === item.id);
        if (existingItem) {
          setCartItems(cartItems.map(i => 
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ));
        } else {
          setCartItems([...cartItems, { ...item, quantity: 1 }]);
        }
      }, 500);
    });
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Filter products based on search and category
  const filterProducts = () => {
    let filtered = products[selectedCategory] || [];
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Render menu item
  const renderMenuItem = ({ item }) => {
    const itemStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: withSpring(1) }
      ]
    }));

    return (
      <Animated.View style={[styles.menuItem, itemStyle]}>
        <TouchableOpacity
          style={styles.menuItemTouchable}
          onPress={(event) => addToCart(item, event)}
        >
          <Image source={{ uri: item.image }} style={styles.menuItemImage} />
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemName}>{item.name}</Text>
            <Text style={styles.menuItemDescription}>{item.description}</Text>
            <View style={styles.menuItemFooter}>
              <Text style={styles.menuItemPrice}>₺{item.price.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={(event) => addToCart(item, event)}
              >
                <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Turkish Kitchen</Text>
        <TouchableOpacity
          ref={cartButtonRef}
          style={styles.cartButton}
          onPress={() => setCartVisible(true)}
        >
          <MaterialIcons name="shopping-cart" size={28} color="#fff" />
          {cartItems.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search menu..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {Object.keys(products).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filterProducts()}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.menuList}
      />

      <Modal
        visible={cartVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCartVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.cartModal}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Your Cart</Text>
              <TouchableOpacity
                onPress={() => setCartVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {cartItems.length === 0 ? (
              <View style={styles.emptyCart}>
                <MaterialIcons name="shopping-cart" size={48} color="#ccc" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={cartItems}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.name}</Text>
                        <Text style={styles.cartItemPrice}>
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => {
                            if (item.quantity > 1) {
                              setCartItems(
                                cartItems.map((i) =>
                                  i.id === item.id
                                    ? { ...i, quantity: i.quantity - 1 }
                                    : i
                                )
                              );
                            } else {
                              setCartItems(cartItems.filter((i) => i.id !== item.id));
                            }
                          }}
                        >
                          <MaterialIcons name="remove" size={20} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() =>
                            setCartItems(
                              cartItems.map((i) =>
                                i.id === item.id
                                  ? { ...i, quantity: i.quantity + 1 }
                                  : i
                              )
                            )
                          }
                        >
                          <MaterialIcons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />

                <View style={styles.cartFooter}>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>Total:</Text>
                    <Text style={styles.totalAmount}>
                      ₺{getTotalPrice().toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={() => {
                      setCartVisible(false);
                      navigation.navigate('Checkout', {
                        total: getTotalPrice(),
                        items: cartItems,
                      });
                    }}
                  >
                    <Text style={styles.checkoutButtonText}>Checkout</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuList: {
    padding: 15,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItemTouchable: {
    flexDirection: 'row',
    height: 120,
  },
  menuItemImage: {
    width: 120,
    height: '100%',
  },
  menuItemInfo: {
    flex: 1,
    padding: 10,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  addButton: {
    backgroundColor: '#2ecc71',
    padding: 8,
    borderRadius: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  cartModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartItemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  quantityButton: {
    backgroundColor: '#2ecc71',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  cartFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalText: {
    fontSize: 18,
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  checkoutButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
