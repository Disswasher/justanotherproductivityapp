import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

interface Quest {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
  createdAt: number;
}

const DEFAULT_QUESTS: Quest[] = [
  { id: '1', name: 'Finish Odin Project Foundations', completed: false, streak: 0, createdAt: Date.now() },
  { id: '2', name: 'Create Arduino Projects', completed: false, streak: 0, createdAt: Date.now() },
  { id: '3', name: 'Configure Linux Better', completed: false, streak: 0, createdAt: Date.now() },
  { id: '4', name: 'Set Up NAS on Old Computer', completed: false, streak: 0, createdAt: Date.now() },
  { id: '5', name: 'Pray 5 Times Daily', completed: false, streak: 0, createdAt: Date.now() },
  { id: '6', name: 'Read 2 Pages Quran + Translation', completed: false, streak: 0, createdAt: Date.now() },
  { id: '7', name: 'No Goon Streak', completed: false, streak: 0, createdAt: Date.now() },
  { id: '8', name: 'Research Projects Portfolio', completed: false, streak: 0, createdAt: Date.now() },
  { id: '9', name: 'Build Virtual Assistant', completed: false, streak: 0, createdAt: Date.now() },
  { id: '10', name: 'Build Startup Foundations', completed: false, streak: 0, createdAt: Date.now() },
];

export default function QuestsScreen() {
  const [quests, setQuests] = useState<Quest[]>(DEFAULT_QUESTS);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestName, setNewQuestName] = useState('');
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      const savedQuests = await AsyncStorage.getItem('sideQuests');
      if (savedQuests) {
        setQuests(JSON.parse(savedQuests));
      }
    } catch (error) {
      console.log('Error loading quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (questsToSave: Quest[]) => {
    try {
      await AsyncStorage.setItem('sideQuests', JSON.stringify(questsToSave));
      setQuests(questsToSave);
    } catch (error) {
      console.log('Error saving quests:', error);
    }
  };

  const toggleQuest = (questId: string) => {
    const updated = quests.map(quest => {
      if (quest.id === questId) {
        return {
          ...quest,
          completed: !quest.completed,
          streak: quest.completed ? quest.streak : quest.streak + 1
        };
      }
      return quest;
    });
    saveData(updated);
  };

  const addQuest = () => {
    if (!newQuestName.trim()) return;
    
    const newQuest: Quest = {
      id: Date.now().toString(),
      name: newQuestName,
      completed: false,
      streak: 0,
      createdAt: Date.now(),
    };
    
    saveData([...quests, newQuest]);
    setNewQuestName('');
    setShowAddModal(false);
  };

  const deleteQuest = (questId: string) => {
    Alert.alert(
      'Delete Quest',
      'Are you sure you want to delete this quest?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = quests.filter(q => q.id !== questId);
            saveData(updated);
          }
        }
      ]
    );
  };

  const editQuest = (quest: Quest) => {
    setEditingQuest(quest);
    setNewQuestName(quest.name);
    setShowAddModal(true);
  };

  const saveEdit = () => {
    if (!newQuestName.trim() || !editingQuest) return;
    
    const updated = quests.map(q =>
      q.id === editingQuest.id ? { ...q, name: newQuestName } : q
    );
    saveData(updated);
    setNewQuestName('');
    setEditingQuest(null);
    setShowAddModal(false);
  };

  const getStats = () => {
    const completed = quests.filter(q => q.completed).length;
    const totalStreak = quests.reduce((sum, q) => sum + q.streak, 0);
    return { completed, total: quests.length, totalStreak };
  };

  const stats = getStats();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Side Quests 🎯</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.completed}/{stats.total}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🔥 {stats.totalStreak}</Text>
            <Text style={styles.statLabel}>Total Streak</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            setEditingQuest(null);
            setNewQuestName('');
            setShowAddModal(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Add New Quest</Text>
        </TouchableOpacity>

        {quests.map(quest => (
          <TouchableOpacity
            key={quest.id}
            style={[styles.questCard, quest.completed && styles.questCardCompleted]}
            onPress={() => toggleQuest(quest.id)}
            onLongPress={() => editQuest(quest)}
          >
            <View style={styles.questContent}>
              <View style={styles.checkbox}>
                {quest.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.questInfo}>
                <Text style={[styles.questName, quest.completed && styles.questNameCompleted]}>
                  {quest.name}
                </Text>
                {quest.streak > 0 && (
                  <Text style={styles.streakText}>🔥 {quest.streak} day streak</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                deleteQuest(quest.id);
              }}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingQuest(null);
          setNewQuestName('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingQuest ? 'Edit Quest' : 'New Quest'}
            </Text>
            
            <TextInput
              style={styles.input}
              value={newQuestName}
              onChangeText={setNewQuestName}
              placeholder="Enter quest name..."
              placeholderTextColor="#666"
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingQuest(null);
                  setNewQuestName('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editingQuest ? saveEdit : addQuest}
              >
                <Text style={styles.modalButtonText}>
                  {editingQuest ? 'Save' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#2a2a4a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  addButton: {
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  questCard: {
    backgroundColor: '#1e1e3f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2a2a4a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questCardCompleted: {
    backgroundColor: '#1a3a2a',
    borderColor: '#22c55e',
  },
  questContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#6b7280',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  questInfo: {
    flex: 1,
  },
  questName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  questNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  streakText: {
    fontSize: 14,
    color: '#f97316',
    marginTop: 4,
    fontWeight: '600',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});