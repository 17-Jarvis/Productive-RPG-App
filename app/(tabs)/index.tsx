//index.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoRPGApp = () => {
  // Player stats with name and rank
  const [playerStats, setPlayerStats] = useState({
    name: 'Adventurer',
    rank: 'Noob',
    level: 0,
    exp: 0,
    maxExp: 100, // Experience needed for next level - doubles with each level
    gold: 20
  });


  // Task lists - active and completed
  const [tasks, setTasks] = useState([
    { 
      id: '1', 
      title: 'Complete Coding or Research', 
      difficulty: 'medium', 
      dueDate: 'tomorrow',
      xp: 50, 
      gold: 10, 
      completed: false 
    },
    { 
      id: '2', 
      title: 'Complete Exercise', 
      difficulty: 'easy',
      dueDate: 'today',
      xp: 20, 
      gold: 5, 
      completed: false 
    },
  ]);
  
  const [completedTasks, setCompletedTasks] = useState([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [moveToCompletedModalVisible, setMoveToCompletedModalVisible] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  // New task states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskDifficulty, setTaskDifficulty] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  
  // Name edit state
  const [editedName, setEditedName] = useState(playerStats.name);
  
  // Show completed tasks
  const [showingCompleted, setShowingCompleted] = useState(false);

  // Calculate rank based on level
  useEffect(() => {
    const calculateRank = () => {
      const level = playerStats.level;
      if (level === 0) return 'Noob';
      if (level < 3) return 'Cursed Seed';
      if (level < 6) return 'Wandering Blade';
      if (level < 10) return 'Demon Cub';
      if (level < 15) return 'Shadow Initiate';
      if (level < 21) return 'Ghost Ronin';
      if (level < 28) return 'Dark Flame';
      if (level < 36) return 'Ashen Knight';
      if (level < 45) return 'Black Monarch';
      if (level < 55) return 'Dragon Vein';
      if (level < 66) return 'Shinigami Adept';
      if (level < 78) return 'Soul Hunter';
      if (level < 91) return 'Twilight Warden';
      if (level < 105) return 'Storm Reaper';
      if (level < 120) return 'Phantom Emperor';
      if (level < 136) return 'Crimson Overlord';
      if (level < 153) return 'Oathbreaker';
      if (level < 171) return 'Celestial Howler';
      if (level < 190) return 'Eclipse Walker';
      if (level < 210) return 'Void Templar';
      if (level < 231) return 'Frost Revenant';
      if (level < 253) return 'Dread Ronin';
      if (level < 276) return 'Bloodborn Tyrant';
      if (level < 300) return 'Vortex Shinobi';
      if (level < 325) return 'Heaven’s Bane';
      if (level < 351) return 'Chaos Herald';
      if (level < 378) return 'Omega King';
      if (level < 406) return 'Mythic Voidlord';
      if (level < 435) return 'Silent Executioner';
      if (level < 465) return 'Arcane Revenant';
      if (level < 496) return 'Silver Assassin';
      if (level < 528) return 'Blood Moon Knight';
      if (level < 561) return 'Neon Specter';
      if (level < 595) return 'Abyssal Warlord';
      if (level < 630) return 'Inferno Sage';
      if (level < 666) return 'Celestial Raider';
      if (level < 703) return 'Spectral Guardian';
      if (level < 741) return 'Doom Ronin';
      if (level < 780) return 'Shadow Enchanter';
      if (level < 820) return 'Thunderous King';
      if (level < 861) return 'Ember Samurai';
      if (level < 903) return 'Scarlet Beast';
      if (level < 946) return 'Black Lotus';
      if (level < 990) return 'Hellfire Monk';
      return 'Eternal Deity';
    };
  }, [playerStats.level]);

  // Day change handler for automatic task sorting
  useEffect(() => {
    // Function to process tasks at the end of each day
    const processDailyTasks = async () => {
      try {
        const today = new Date();
        const todayStr = today.toDateString();
        
        // Check if we've already processed tasks for today
        const lastProcessed = await AsyncStorage.getItem('lastDayProcessed');
        
        if (lastProcessed !== todayStr) {
          // Move tasks from yesterday to appropriate lists
          const { completed, incomplete } = sortTasksByCompletion();
          
          // Move completed tasks to completed list
          setCompletedTasks([...completedTasks, ...completed]);
          
          // Reset tasks to only include incomplete ones
          setTasks(incomplete);
          
          // Store that we processed tasks today
          await AsyncStorage.setItem('lastDayProcessed', todayStr);
          
          // Notify user
          Alert.alert(
            "Daily Quest Update",
            `${completed.length} completed quests moved to history.`,
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error('Error processing daily tasks:', error);
      }
    };
    
    // Helper function to sort tasks
    const sortTasksByCompletion = () => {
      const completed = [];
      const incomplete = [];
      
      tasks.forEach(task => {
        if (task.completed) {
          completed.push(task);
        } else {
          incomplete.push(task);
        }
      });
      
      return { completed, incomplete };
    };
    
    // Check once when app loads
    processDailyTasks();
    
    // Set up interval to check periodically
    const interval = setInterval(processDailyTasks, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(interval);
  }, [tasks, completedTasks]);

  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load player stats
        const savedPlayerStats = await AsyncStorage.getItem('playerStats');
        if (savedPlayerStats) {
          setPlayerStats(JSON.parse(savedPlayerStats));
        }
        
        // Load tasks
        const savedTasks = await AsyncStorage.getItem('tasks');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
        
        // Load completed tasks
        const savedCompletedTasks = await AsyncStorage.getItem('completedTasks');
        if (savedCompletedTasks) {
          setCompletedTasks(JSON.parse(savedCompletedTasks));
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      }
    };
    
    loadData();
  }, []);
  
  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('playerStats', JSON.stringify(playerStats));
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
        await AsyncStorage.setItem('completedTasks', JSON.stringify(completedTasks));
      } catch (error) {
        console.error('Error saving data to AsyncStorage:', error);
      }
    };
    
    saveData();
  }, [playerStats, tasks, completedTasks]);

  // Handle level up
  const checkLevelUp = () => {
    if (playerStats.exp >= playerStats.maxExp) {
      // Calculate excess XP
      const excessXP = playerStats.exp - playerStats.maxExp;
      
      // Level up
      const newLevel = playerStats.level + 1;
      const newMaxExp = playerStats.maxExp * 2; // Double XP needed for next level
      
      setPlayerStats({
        ...playerStats,
        level: newLevel,
        exp: excessXP, // Start with excess XP
        maxExp: newMaxExp
      });
      
      // Show level up notification
      Alert.alert(
        "Level Up!",
        `Congratulations! You've reached level ${newLevel}!\nNext level requires ${newMaxExp} XP.`,
        [{ text: "Awesome!" }]
      );
    }
  };

  // Function to handle task interaction - either complete or move to completed
  const handleTaskPress = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    setCurrentTaskId(id);
    
    if (task.completed) {
      // If already completed (struck), show move to completed modal
      setMoveToCompletedModalVisible(true);
    } else {
      // If not completed yet, show completion modal
      setCompletionModalVisible(true);
    }
  };

  // Function to complete a task and handle rewards
  const completeTask = (moveToCompleted) => {
    // Find the task
    const task = tasks.find(t => t.id === currentTaskId);
    if (!task) return;
    
    // Award XP and gold
    setPlayerStats({
      ...playerStats,
      exp: playerStats.exp + task.xp,
      gold: playerStats.gold + task.gold
    });
    
    // Check for level up after adding XP
    setTimeout(checkLevelUp, 100);
    
    if (moveToCompleted) {
      // Move to completed list
      setCompletedTasks([...completedTasks, {...task, completed: true}]);
      setTasks(tasks.filter(t => t.id !== currentTaskId));
    } else {
      // Just mark as completed but keep in the list
      setTasks(tasks.map(t => 
        t.id === currentTaskId ? {...t, completed: true} : t
      ));
    }
    
    setCompletionModalVisible(false);
  };

  // Function to move a completed task to the completed list
  const moveToCompleted = () => {
    const task = tasks.find(t => t.id === currentTaskId);
    if (!task) return;
    
    setCompletedTasks([...completedTasks, task]);
    setTasks(tasks.filter(t => t.id !== currentTaskId));
    setMoveToCompletedModalVisible(false);
  };

  // Add new task
  const addTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Task name is required');
      return;
    }
    if (!taskDifficulty) {
      Alert.alert('Please select a difficulty level');
      return;
    }
    if (!taskDueDate) {
      Alert.alert('Please select a due date');
      return;
    }

    const rewards = calculateRewards(taskDifficulty);
    
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      difficulty: taskDifficulty,
      dueDate: taskDueDate,
      xp: rewards.xp,
      gold: rewards.gold,
      completed: false
    };

    setTasks([...tasks, newTask]);
    resetTaskForm();
  };

  // Reset the form
  const resetTaskForm = () => {
    setNewTaskTitle('');
    setTaskDifficulty('');
    setTaskDueDate('');
    setModalVisible(false);
  };

  // Calculate XP and gold based on difficulty
  const calculateRewards = (difficulty) => {
    switch(difficulty) {
      case 'easy':
        return { xp: 15, gold: 5 };
      case 'medium':
        return { xp: 30, gold: 10 };
      case 'hard':
        return { xp: 50, gold: 20 };
      default:
        return { xp: 10, gold: 5 };
    }
  };

  // Select difficulty
  const selectDifficulty = (difficulty) => {
    setTaskDifficulty(difficulty);
  };

  // Select due date
  const selectDueDate = (dueDate) => {
    setTaskDueDate(dueDate);
  };
  
  // Save edited name
  const savePlayerName = () => {
    if (editedName.trim()) {
      setPlayerStats({...playerStats, name: editedName});
    }
    setEditNameModalVisible(false);
  };
  
  // Toggle between active and completed tasks
  const toggleTasksView = () => {
    setShowingCompleted(!showingCompleted);
  };

  // Render individual task item
  const renderTaskItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.taskItem, item.completed && styles.completedTask]} 
      onPress={() => handleTaskPress(item.id)}
    >
      <View style={styles.taskContent}>
        <View style={styles.taskMainInfo}>
          <Text style={[styles.taskTitle, item.completed && styles.completedTaskText]}>
            {item.title}
          </Text>
          <View style={styles.taskMeta}>
            <Text style={styles.taskMetaText}>
              {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)} • Due: {item.dueDate}
            </Text>
          </View>
        </View>
        <View style={styles.taskRewards}>
          <Text style={styles.rewardText}>XP: {item.xp}</Text>
          <Text style={styles.rewardText}>Gold: {item.gold}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Stats Section (Top Quarter) */}
      <View style={styles.statsSection}>
        {/* Level and Rank Display */}
        <View style={styles.levelContainer}>
          <Text style={styles.rankText}>{playerStats.rank}</Text>
          <View style={styles.levelBox}>
            <Text style={styles.levelNumber}>{playerStats.level}</Text>
          </View>
          <Text style={styles.levelLabel}>LEVEL</Text>
        </View>
        
        {/* Player Name, EXP and Gold */}
        <View style={styles.statsContainer}>
          {/* Player Name (Editable) */}
          <TouchableOpacity 
            style={styles.nameContainer}
            onPress={() => setEditNameModalVisible(true)}
          >
            <Text style={styles.nameLabel}>NAME:</Text>
            <Text style={styles.nameValue}>{playerStats.name}</Text>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>EXP:</Text>
            <View style={styles.expContainer}>
              <Text style={styles.statValue}>{playerStats.exp}/{playerStats.maxExp}</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${(playerStats.exp / playerStats.maxExp) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>GOLD:</Text>
            <Text style={styles.statValue}>{playerStats.gold}</Text>
          </View>
        </View>
      </View>
      
      {/* Tasks Section (Bottom Three Quarters) */}
      <View style={styles.tasksSection}>
        <View style={styles.taskHeaderContainer}>
          <Text style={styles.sectionTitle}>
            {showingCompleted ? "Completed Quests" : "Your Quests"}
          </Text>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={toggleTasksView}
          >
            <Text style={styles.toggleButtonText}>
              {showingCompleted ? "Show Active" : "Show Completed"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={showingCompleted ? completedTasks : tasks}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.tasksList}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>
              {showingCompleted 
                ? "No completed quests yet" 
                : "No active quests. Add a new quest!"}
            </Text>
          }
        />
      </View>

      {/* Add Task Button */}
      {!showingCompleted && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Add Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Quest</Text>
            
            {/* Task Name Input */}
            <Text style={styles.inputLabel}>Quest Name:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter quest name"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholderTextColor="#6E6E8E"
            />
            
            {/* Difficulty Selection */}
            <Text style={styles.inputLabel}>Difficulty:</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[
                  styles.selectionButton, 
                  taskDifficulty === 'easy' && styles.selectedButton
                ]}
                onPress={() => selectDifficulty('easy')}
              >
                <Text style={[
                  styles.buttonText,
                  taskDifficulty === 'easy' && styles.selectedButtonText
                ]}>Easy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.selectionButton, 
                  taskDifficulty === 'medium' && styles.selectedButton
                ]}
                onPress={() => selectDifficulty('medium')}
              >
                <Text style={[
                  styles.buttonText,
                  taskDifficulty === 'medium' && styles.selectedButtonText
                ]}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.selectionButton, 
                  taskDifficulty === 'hard' && styles.selectedButton
                ]}
                onPress={() => selectDifficulty('hard')}
              >
                <Text style={[
                  styles.buttonText,
                  taskDifficulty === 'hard' && styles.selectedButtonText
                ]}>Hard</Text>
              </TouchableOpacity>
            </View>
            
            {/* Due Date Selection */}
            <Text style={styles.inputLabel}>Due Date:</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[
                  styles.selectionButton, 
                  taskDueDate === 'today' && styles.selectedButton
                ]}
                onPress={() => selectDueDate('today')}
              >
                <Text style={[
                  styles.buttonText,
                  taskDueDate === 'today' && styles.selectedButtonText
                ]}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.selectionButton, 
                  taskDueDate === 'tomorrow' && styles.selectedButton
                ]}
                onPress={() => selectDueDate('tomorrow')}
              >
                <Text style={[
                  styles.buttonText,
                  taskDueDate === 'tomorrow' && styles.selectedButtonText
                ]}>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.selectionButton, 
                  taskDueDate === 'this week' && styles.selectedButton
                ]}
                onPress={() => selectDueDate('this week')}
              >
                <Text style={[
                  styles.buttonText,
                  taskDueDate === 'this week' && styles.selectedButtonText
                ]}>This Week</Text>
              </TouchableOpacity>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={resetTaskForm}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.addTaskButton]}
                onPress={addTask}
              >
                <Text style={styles.actionButtonText}>Add Quest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editNameModalVisible}
        onRequestClose={() => setEditNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <Text style={styles.modalTitle}>Edit Character Name</Text>
            <TextInput
              style={styles.textInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholderTextColor="#6E6E8E"
              maxLength={20}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setEditNameModalVisible(false)}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.addTaskButton]}
                onPress={savePlayerName}
              >
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Task Completion Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={completionModalVisible}
        onRequestClose={() => setCompletionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <Text style={styles.modalTitle}>Complete Quest</Text>
            <Text style={styles.completionText}>
              Congratulations on completing this quest! What would you like to do with it?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setCompletionModalVisible(false)}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.strikeButton]}
                onPress={() => completeTask(false)}
              >
                <Text style={styles.actionButtonText}>Keep & Strike</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.addTaskButton]}
                onPress={() => completeTask(true)}
              >
                <Text style={styles.actionButtonText}>Move to Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Move to Completed Modal for already struck tasks */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={moveToCompletedModalVisible}
        onRequestClose={() => setMoveToCompletedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <Text style={styles.modalTitle}>Move Completed Quest</Text>
            <Text style={styles.completionText}>
              This quest is already completed. Would you like to move it to your completed quests?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setMoveToCompletedModalVisible(false)}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.addTaskButton]}
                onPress={moveToCompleted}
              >
                <Text style={styles.actionButtonText}>Move to Done</Text>
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
    backgroundColor: '#1E1E2E', // Dark theme background
  },
  statsSection: {
    height: '25%', // Restored to 25% to accommodate name
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#292942', // Slightly lighter than the background
    borderBottomWidth: 2,
    borderBottomColor: '#6E3CBC', // Purple border
  },
  levelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  levelBox: {
    width: 60,
    height: 60,
    backgroundColor: '#6E3CBC', // Purple background
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6', // Lighter purple border
  },
  levelNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelLabel: {
    marginTop: 5,
    fontSize: 14,
    color: '#FFFFFF',
  },
  statsContainer: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    width: 60,
  },
  nameValue: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  editIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  statItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    width: 60,
  },
  statValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  expContainer: {
    flex: 1,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#3D3D5C',
    borderRadius: 4,
    marginTop: 5,
    width: '100%',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#6E3CBC',
    borderRadius: 4,
  },
  tasksSection: {
    flex: 1,
    padding: 16,
  },
  taskHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  toggleButton: {
    backgroundColor: '#3D3D5C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  tasksList: {
    paddingBottom: 80, // Add space for the floating button
  },
  emptyListText: {
    color: '#B0B0C0',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  taskItem: {
    backgroundColor: '#292942',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6E3CBC',
  },
  completedTask: {
    opacity: 0.7,
    borderLeftColor: '#10B981', // Green for completed tasks
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMainInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskMetaText: {
    fontSize: 12,
    color: '#B0B0C0',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
  },
  taskRewards: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  rewardText: {
    color: '#FFD700', // Gold color for rewards
    fontSize: 14,
  },
  completionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  // Add Button Styles
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6E3CBC',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonText: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Modal Styles
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  smallModalContent: {
    width: '85%',
    backgroundColor: '#292942',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: '#1E1E2E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  selectionButton: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#6E3CBC',
  },
  buttonText: {
    color: '#B0B0C0',
    fontSize: 14,
  },
  selectedButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#3D3D5C',
  },
  strikeButton: {
    backgroundColor: '#10B981',
  },
  addTaskButton: {
    backgroundColor: '#6E3CBC',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TodoRPGApp;