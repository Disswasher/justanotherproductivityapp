import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

interface Quest {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
  lastCompletedDate: string | null;
  category: 'today' | 'current' | 'longterm';
  subtasks: SubTask[];
  createdAt: number;
}

const DEFAULT_QUESTS: Quest[] = [
  {
    id: '1',
    name: 'Pray 5 Times Daily',
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    category: 'today',
    subtasks: [
      { id: 's1', name: 'Fajr', completed: false },
      { id: 's2', name: 'Dhuhr', completed: false },
      { id: 's3', name: 'Asr', completed: false },
      { id: 's4', name: 'Maghrib', completed: false },
      { id: 's5', name: 'Isha', completed: false },
    ],
    createdAt: Date.now(),
  },
  {
    id: '2',
    name: 'Read 2 Pages Quran + Translation',
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    category: 'today',
    subtasks: [],
    createdAt: Date.now(),
  },
  {
    id: '3',
    name: 'Get Recommended Water (8 glasses)',
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    category: 'today',
    subtasks: [],
    createdAt: Date.now(),
  },
  {
    id: '4',
    name: 'Finish Odin Project Foundations',
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    category: 'current',
    subtasks: [],
    createdAt: Date.now(),
  },
  {
    id: '5',
    name: 'Create Arduino Projects',
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    category: 'current',
    subtasks: [],
    createdAt: Date.now(),
  },
  {
    id: '6',
    name: 'Configure Linux Better',
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    category: 'current',
    subtasks: [],
    createdAt: Date.now(),
  },
  {
    id: '7',
    name: 'Set Up NAS on Old Computer',
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    category: 'current',
    subtasks: [],
    createdAt: Date.now(),
  },
  {
    id: '8',
    name: 'No Goon Streak',
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    category: 'current',
    subtasks: [],
    createdAt: Date.now(),
  },
  {
    id: '9',
    name: 'Research Projects Portfolio',
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    category: 'current',
    subtasks: [],
    createdAt: Date.now(),
  },
  {
    id: '10',
    name: 'Build Virtual Assistant',
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    category: 'longterm',
    subtasks: [],
    createdAt: Date.now(),
  },
  {
    id: '11',
    name: 'Build Startup Foundations',
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    category: 'longterm',
    subtasks: [],
    createdAt: Date.now(),
  },
];

export default function QuestsScreen() {
  const [quests, setQuests] = useState<Quest[]>(DEFAULT_QUESTS);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [newQuestName, setNewQuestName] = useState('');
  const [newQuestCategory, setNewQuestCategory] = useState<'today' | 'current' | 'longterm'>('current');
  const [expandedQuests, setExpandedQuests] = useState<Set<string>>(new Set());
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

  const getTodayDateString = () => {
    return new Date().toDateString();
  };

  const toggleQuest = (questId: string) => {
    const today = getTodayDateString();
    const updated = quests.map(quest => {
      if (quest.id === questId) {
        const wasCompletedToday = quest.lastCompletedDate === today;
        
        if (quest.completed) {
          // Uncompleting - decrease streak only if it was completed today
          return {
            ...quest,
            completed: false,
            streak: wasCompletedToday ? Math.max(0, quest.streak - 1) : quest.streak,
            lastCompletedDate: null,
          };
        } else {
          // Completing - only increment streak if not already done today
          if (wasCompletedToday) {
            return quest; // Already completed today, no change
          }
          
          return {
            ...quest,
            completed: true,
            streak: quest.streak + 1,
            lastCompletedDate: today,
          };
        }
      }
      return quest;
    });
    saveData(updated);
  };

  const toggleSubtask = (questId: string, subtaskId: string) => {
    const updated = quests.map(quest => {
      if (quest.id === questId) {
        const updatedSubtasks = quest.subtasks.map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        
        // Auto-complete parent if all subtasks done
        const allSubtasksComplete = updatedSubtasks.every(st => st.completed);
        
        return {
          ...quest,
          subtasks: updatedSubtasks,
          completed: allSubtasksComplete,
        };
      }
      return quest;
    });
    saveData(updated);
  };

  const moveQuest = (questId: string, direction: 'up' | 'down') => {
    const index = quests.findIndex(q => q.id === questId);
    if (index === -1) return;
    
    const quest = quests[index];
    const categoryQuests = quests.filter(q => q.category === quest.category);
    const categoryIndex = categoryQuests.findIndex(q => q.id === questId);
    
    if (direction === 'up' && categoryIndex === 0) return;
    if (direction === 'down' && categoryIndex === categoryQuests.length - 1) return;
    
    const newCategoryQuests = [...categoryQuests];
    const swapIndex = direction === 'up' ? categoryIndex - 1 : categoryIndex + 1;
    [newCategoryQuests[categoryIndex], newCategoryQuests[swapIndex]] = 
    [newCategoryQuests[swapIndex], newCategoryQuests[categoryIndex]];
    
    const otherQuests = quests.filter(q => q.category !== quest.category);
    const result = [...otherQuests, ...newCategoryQuests].sort((a, b) => {
      const catOrder = { today: 0, current: 1, longterm: 2 };
      return catOrder[a.category] - catOrder[b.category];
    });
    
    saveData(result);
  };

  const deleteQuest = (questId: string) => {
    Alert.alert('Delete Quest', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => saveData(quests.filter(q => q.id !== questId)),
      },
    ]);
  };

  const openEditModal = (quest: Quest) => {
    setEditingQuest(quest);
    setNewQuestName(quest.name);
    setNewQuestCategory(quest.category);
    setShowEditModal(true);
  };

  const saveEdit = () => {
    if (!newQuestName.trim() || !editingQuest) return;
    
    const updated = quests.map(q =>
      q.id === editingQuest.id
        ? { ...q, name: newQuestName, category: newQuestCategory }
        : q
    );
    saveData(updated);
    closeModals();
  };

  const addQuest = () => {
    if (!newQuestName.trim()) return;
    
    const newQuest: Quest = {
      id: Date.now().toString(),
      name: newQuestName,
      completed: false,
      streak: 0,
      lastCompletedDate: null,
      category: newQuestCategory,
      subtasks: [],
      createdAt: Date.now(),
    };
    
    saveData([...quests, newQuest]);
    closeModals();
  };

  const addSubtask = (questId: string) => {
    Alert.prompt('Add Subtask', 'Enter subtask name:', (text) => {
      if (!text?.trim()) return;
      
      const updated = quests.map(q => {
        if (q.id === questId) {
          return {
            ...q,
            subtasks: [
              ...q.subtasks,
              { id: Date.now().toString(), name: text, completed: false },
            ],
          };
        }
        return q;
      });
      saveData(updated);
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingQuest(null);
    setNewQuestName('');
    setNewQuestCategory('current');
  };

  const toggleExpand = (questId: string) => {
    setExpandedQuests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questId)) {
        newSet.delete(questId);
      } else {
        newSet.add(questId);
      }
      return newSet;
    });
  };

  const renderQuest = (quest: Quest, index: number, categoryQuests: Quest[]) => {
    const isExpanded = expandedQuests.has(quest.id);
    const hasSubtasks = quest.subtasks.length > 0;
    const completedSubtasks = quest.subtasks.filter(st => st.completed).length;
    const progress = hasSubtasks ? (completedSubtasks / quest.subtasks.length) * 100 : 0;
    
    return (
      <View key={quest.id} style={styles.questWrapper}>
        <TouchableOpacity
          style={[styles.questCard, quest.completed && styles.questCardCompleted]}
          onPress={() => hasSubtasks ? toggleExpand(quest.id) : toggleQuest(quest.id)}
        >
          <View style={styles.questContent}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleQuest(quest.id)}
            >
              {quest.completed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            
            <View style={styles.questInfo}>
              <Text style={[styles.questName, quest.completed && styles.questNameCompleted]}>
                {quest.name}
              </Text>
              {hasSubtasks && (
                <Text style={styles.subtaskProgress}>
                  {completedSubtasks}/{quest.subtasks.length} subtasks • {Math.round(progress)}%
                </Text>
              )}
              {quest.streak > 0 && (
                <Text style={styles.streakText}>🔥 {quest.streak} day streak</Text>
              )}
            </View>

            <View style={styles.questActions}>
              {index > 0 && (
                <TouchableOpacity onPress={() => moveQuest(quest.id, 'up')} style={styles.moveButton}>
                  <Text style={styles.moveButtonText}>↑</Text>
                </TouchableOpacity>
              )}
              {index < categoryQuests.length - 1 && (
                <TouchableOpacity onPress={() => moveQuest(quest.id, 'down')} style={styles.moveButton}>
                  <Text style={styles.moveButtonText}>↓</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && hasSubtasks && (
          <View style={styles.subtasksContainer}>
            {quest.subtasks.map(subtask => (
              <TouchableOpacity
                key={subtask.id}
                style={styles.subtaskRow}
                onPress={() => toggleSubtask(quest.id, subtask.id)}
              >
                <View style={[styles.subtaskCheckbox, subtask.completed && styles.subtaskCheckboxCompleted]}>
                  {subtask.completed && <Text style={styles.subtaskCheckmark}>✓</Text>}
                </View>
                <Text style={[styles.subtaskName, subtask.completed && styles.subtaskNameCompleted]}>
                  {subtask.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addSubtaskButton}
              onPress={() => addSubtask(quest.id)}
            >
              <Text style={styles.addSubtaskText}>+ Add subtask</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.questCardActions}>
          <TouchableOpacity style={styles.cardActionButton} onPress={() => openEditModal(quest)}>
            <Text style={styles.cardActionText}>Edit</Text>
          </TouchableOpacity>
          {!hasSubtasks && (
            <TouchableOpacity
              style={styles.cardActionButton}
              onPress={() => addSubtask(quest.id)}
            >
              <Text style={styles.cardActionText}>Add Subtask</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.cardActionButton, styles.deleteCardButton]}
            onPress={() => deleteQuest(quest.id)}
          >
            <Text style={styles.cardActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCategory = (category: 'today' | 'current' | 'longterm', title: string, icon: string) => {
    const categoryQuests = quests.filter(q => q.category === category);
    if (categoryQuests.length === 0) return null;

    return (
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{icon} {title}</Text>
        {categoryQuests.map((quest, index) => renderQuest(quest, index, categoryQuests))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const todayQuests = quests.filter(q => q.category === 'today');
  const currentQuests = quests.filter(q => q.category === 'current');
  const longtermQuests = quests.filter(q => q.category === 'longterm');
  const totalStreak = quests.reduce((sum, q) => sum + q.streak, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Side Quests 🎯</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{quests.filter(q => q.completed).length}/{quests.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🔥 {totalStreak}</Text>
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
            setNewQuestCategory('current');
            setShowAddModal(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Add New Quest</Text>
        </TouchableOpacity>

        {renderCategory('today', 'TODAY - Urgent', '🔴')}
        {renderCategory('current', 'CURRENT - Winter Break Goals', '🎯')}
        {renderCategory('longterm', 'LONG TERM - Future Goals', '🚀')}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal || showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModals}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingQuest ? 'Edit Quest' : 'New Quest'}
            </Text>

            <Text style={styles.label}>Quest Name</Text>
            <TextInput
              style={styles.input}
              value={newQuestName}
              onChangeText={setNewQuestName}
              placeholder="Enter quest name..."
              placeholderTextColor="#666"
              autoFocus
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryButtons}>
              <TouchableOpacity
                style={[styles.categoryButton, newQuestCategory === 'today' && styles.categoryButtonActive]}
                onPress={() => setNewQuestCategory('today')}
              >
                <Text style={styles.categoryButtonText}>🔴 Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.categoryButton, newQuestCategory === 'current' && styles.categoryButtonActive]}
                onPress={() => setNewQuestCategory('current')}
              >
                <Text style={styles.categoryButtonText}>🎯 Current</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.categoryButton, newQuestCategory === 'longterm' && styles.categoryButtonActive]}
                onPress={() => setNewQuestCategory('longterm')}
              >
                <Text style={styles.categoryButtonText}>🚀 Long Term</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModals}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editingQuest ? saveEdit : addQuest}
              >
                <Text style={styles.modalButtonText}>{editingQuest ? 'Save' : 'Add'}</Text>
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
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a855f7',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questWrapper: {
    marginBottom: 12,
  },
  questCard: {
    backgroundColor: '#1e1e3f',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2a2a4a',
  },
  questCardCompleted: {
    backgroundColor: '#1a3a2a',
    borderColor: '#22c55e',
  },
  questContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  questNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  subtaskProgress: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  streakText: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
  },
  questActions: {
    flexDirection: 'row',
    gap: 4,
  },
  moveButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtasksContainer: {
    backgroundColor: '#16162a',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6b7280',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskCheckboxCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  subtaskCheckmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subtaskName: {
    fontSize: 14,
    color: '#d1d5db',
  },
  subtaskNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  addSubtaskButton: {
    paddingVertical: 8,
    marginTop: 4,
  },
  addSubtaskText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  questCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  cardActionButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteCardButton: {
    backgroundColor: '#7f1d1d',
  },
  cardActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  label: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#2a2a4a',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#3a2a5a',
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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