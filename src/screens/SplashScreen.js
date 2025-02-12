import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      {
        translateY: withSpring(textOpacity.value * 20, {
          damping: 5,
          stiffness: 100,
        }),
      },
    ],
  }));

  useEffect(() => {
    // Start the animation sequence
    scale.value = withSequence(
      withTiming(1.2, { duration: 500 }),
      withSpring(1, {
        damping: 8,
        stiffness: 100,
      })
    );

    opacity.value = withTiming(1, { duration: 1000 });

    // Animate text after icon
    textOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 800 }, () => {
        // Navigate to Home screen after animation
        runOnJS(setTimeout)(() => {
          runOnJS(navigation.replace)('Home');
        }, 1500);
      })
    );
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <MaterialIcons name="restaurant-menu" size={80} color="#2ecc71" />
      </Animated.View>
      
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.title}>Turkish Kitchen</Text>
        <Text style={styles.subtitle}>Authentic Turkish Cuisine</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconContainer: {
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
});

export default SplashScreen;
