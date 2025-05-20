//rewards.tsx (Updated)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';

const RewardsScreen = () => {
  const [rewards, setRewards] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newReward, setNewReward] = useState({ name: '', cost: '' });
  const [editingReward, setEditingReward] = useState(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [playerStats, setPlayerStats] = useState({ gold: 0 });
  const [purchasedRewards, setPurchasedRewards] = useState([]);

  // Load rewards from storage
  useEffect(() => {
    const loadRewards = async () => {
      try {
        const savedRewards = await AsyncStorage.getItem('rewards');
        if (savedRewards) {
          setRewards(JSON.parse(savedRewards));
        }
      } catch (error) {
        console.error('Error loading rewards:', error);
      }
    };
    loadRewards();
  }, []);

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

  // Save rewards to storage
  useEffect(() => {
    const saveRewards = async () => {
      try {
        await AsyncStorage.setItem('rewards', JSON.stringify(rewards));
      } catch (error) {
        console.error('Error saving rewards:', error);
      }
    };
    saveRewards();
  }, [rewards]);

  // Save purchased rewards to storage
  useEffect(() => {
    const savePurchasedRewards = async () => {
      try {
        await AsyncStorage.setItem('purchasedRewards', JSON.stringify(purchasedRewards));
      } catch (error) {
        console.error('Error saving purchased rewards:', error);
      }
    };
    savePurchasedRewards();
  }, [purchasedRewards]);

  // Save player stats to storage
  useEffect(() => {
    const savePlayerStats = async () => {
      try {
        await AsyncStorage.setItem('playerStats', JSON.stringify(playerStats));
      } catch (error) {
        console.error('Error saving player stats:', error);
      }
    };
    savePlayerStats();
  }, [playerStats]);

  const handleAddReward = () => {
    if (!newReward.name.trim() || !newReward.cost.trim()) {
      Alert.alert('Please fill in all fields');
      return;
    }

    setRewards([...rewards, {
      id: Date.now().toString(),
      name: newReward.name,
      cost: parseInt(newReward.cost),
    }]);

    setNewReward({ name: '', cost: '' });
    setModalVisible(false);
  };

  const handleEditReward = () => {
    if (!editingReward.name.trim() || !editingReward.cost === null) {
      Alert.alert('Please fill in all fields');
      return;
    }

    setRewards(rewards.map(reward => 
      reward.id === editingReward.id ? editingReward : reward
    ));
    setEditModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Reward',
      'Are you sure you want to delete this reward?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => {
          setRewards(rewards.filter(reward => reward.id !== id));
        }}
      ]
    );
  };

  const handlePurchase = async () => {
    if (!selectedReward) return;

    if (playerStats.gold < selectedReward.cost) {
      Alert.alert('Not Enough Gold', 'You need more gold to purchase this reward!');
      setPurchaseModalVisible(false);
      return;
    }

    // Update player's gold
    const updatedPlayerStats = {
      ...playerStats,
      gold: playerStats.gold - selectedReward.cost
    };
    
    // Get current date in readable format
    const purchaseDate = new Date().toLocaleDateString();
    
    // Add to purchased rewards
    const purchasedReward = {
      ...selectedReward,
      purchasedDate: purchaseDate
    };
    
    setPurchasedRewards([...purchasedRewards, purchasedReward]);
    setPlayerStats(updatedPlayerStats);
    setRewards(rewards.filter(reward => reward.id !== selectedReward.id));
    
    // Save changes to AsyncStorage directly to ensure immediate updates
    try {
      await AsyncStorage.setItem('playerStats', JSON.stringify(updatedPlayerStats));
      const updatedPurchasedRewards = [...purchasedRewards, purchasedReward];
      await AsyncStorage.setItem('purchasedRewards', JSON.stringify(updatedPurchasedRewards));
      const updatedRewards = rewards.filter(reward => reward.id !== selectedReward.id);
      await AsyncStorage.setItem('rewards', JSON.stringify(updatedRewards));
    } catch (error) {
      console.error('Error saving purchase data:', error);
    }
    
    Alert.alert('Purchase Successful', `You purchased ${selectedReward.name}!`);
    setPurchaseModalVisible(false);
  };

  const openEditModal = (reward) => {
    setEditingReward(reward);
    setEditModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.rewardItem}
      onPress={() => {
        setSelectedReward(item);
        setPurchaseModalVisible(true);
      }}
    >
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardName}>{item.name}</Text>
        <Text style={styles.rewardCost}>Cost: {item.cost} Gold</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Text style={styles.editButton}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteButton}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const navigateToPurchasedRewards = () => {
    router.push('/purchased_rewards');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with gold display */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rewards Shop</Text>
        <View style={styles.goldContainer}>
          <Text style={styles.goldText}>Gold: {playerStats.gold}</Text>
        </View>
      </View>

      {/* Purchased rewards button */}
      <TouchableOpacity 
        style={styles.purchasedButton}
        onPress={navigateToPurchasedRewards}
      >
        <Text style={styles.purchasedButtonText}>🎁 My Rewards ({purchasedRewards.length})</Text>
      </TouchableOpacity>

      <FlatList
        data={rewards}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No rewards yet. Add your first reward!</Text>
        }
        contentContainerStyle={styles.listContainer}
      />

      <Link href="./" asChild>
        <TouchableOpacity style={styles.homeButton}>
          <Text style={styles.homeButtonText}>🏠 Back to Quests</Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Reward Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Reward</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Reward Name"
              placeholderTextColor="#888"
              value={newReward.name}
              onChangeText={text => setNewReward({...newReward, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Cost in Gold"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={newReward.cost}
              onChangeText={text => setNewReward({...newReward, cost: text})}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.addButtonModal]}
                onPress={handleAddReward}
              >
                <Text style={styles.buttonText}>Add Reward</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Reward Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Reward</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Reward Name"
              placeholderTextColor="#888"
              value={editingReward?.name || ''}
              onChangeText={text => setEditingReward({...editingReward, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Cost in Gold"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={editingReward?.cost?.toString() || ''}
              onChangeText={text => setEditingReward({...editingReward, cost: parseInt(text) || 0})}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.addButtonModal]}
                onPress={handleEditReward}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Purchase Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={purchaseModalVisible}
        onRequestClose={() => setPurchaseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Purchase Reward</Text>
            <Text style={styles.purchaseText}>
              Buy {selectedReward?.name} for {selectedReward?.cost} Gold?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setPurchaseModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.buyButton]}
                onPress={handlePurchase}
              >
                <Text style={styles.buttonText}>Purchase</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  purchasedButton: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchasedButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
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
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  editButton: {
    color: '#6E3CBC',
    fontSize: 20,
  },
  deleteButton: {
    color: '#FF4444',
    fontSize: 20,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6E3CBC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  homeButton: {
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
  homeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#292942',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1E1E2E',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#3D3D5C',
  },
  addButtonModal: {
    backgroundColor: '#6E3CBC',
  },
  buyButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  purchaseText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default RewardsScreen;