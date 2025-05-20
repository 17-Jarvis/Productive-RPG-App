//purchased_rewards.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

const PurchasedRewardsScreen = () => {
  const [purchasedRewards, setPurchasedRewards] = useState([]);
  const [playerStats, setPlayerStats] = useState({ gold: 0 });

  // Load purchased rewards from storage
  useEffect(() => {
    const loadPurchasedRewards = async () => {
      try {
        const savedPurchasedRewards = await AsyncStorage.getItem('purchasedRewards');
        if (savedPurchasedRewards) {
          setPurchasedRewards(JSON.parse(savedPurchasedRewards));
        }
      } catch (error) {
        console.error('Error loading purchased rewards:', error);
      }
    };
    loadPurchasedRewards();
  }, []);

  // Load player stats from storage
  useEffect(() => {
    const loadPlayerStats = async () => {
      try {
        const savedPlayerStats = await AsyncStorage.getItem('playerStats');
        if (savedPlayerStats) {
          setPlayerStats(JSON.parse(savedPlayerStats));
        }
      } catch (error) {
        console.error('Error loading player stats:', error);
      }
    };
    loadPlayerStats();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.rewardItem}>
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardName}>{item.name}</Text>
        <Text style={styles.rewardCost}>Cost: {item.cost} Gold</Text>
        <Text style={styles.purchasedDate}>Purchased: {item.purchasedDate}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with gold display */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Purchased Rewards</Text>
        <View style={styles.goldContainer}>
          <Text style={styles.goldText}>Gold: {playerStats.gold}</Text>
        </View>
      </View>

      <FlatList
        data={purchasedRewards}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No purchased rewards yet. Go buy something nice!</Text>
        }
        contentContainerStyle={styles.listContainer}
      />

      <Link href="./rewards" asChild>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>🏪 Back to Shop</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#292942',
    borderBottomWidth: 2,
    borderBottomColor: '#6E3CBC',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  goldContainer: {
    backgroundColor: '#3D3D5C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  goldText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  rewardItem: {
    backgroundColor: '#292942',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981', // Green border for purchased items
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 4,
  },
  rewardCost: {
    color: '#FFD700',
    fontSize: 14,
    marginBottom: 4,
  },
  purchasedDate: {
    color: '#B0B0C0',
    fontSize: 12,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: '#3D3D5C',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PurchasedRewardsScreen;