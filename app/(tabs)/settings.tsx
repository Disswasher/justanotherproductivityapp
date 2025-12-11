import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyTask {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  color: string;
  enabled: boolean;
}

const COLORS = ['#6366f1', '#ef4444', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6'];

export default function SettingsScreen() {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('dailyTasks');
      if (savedTasks) {
        setDailyTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (tasks: DailyTask[]) => {
    try {
      await AsyncStorage.setItem('dailyTasks', JSON.stringify(tasks));
      setDailyTasks(tasks);
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  const toggleTask = (taskId: string) => {
    const updated = dailyTasks.map(task =>
      task.id === taskId ? { ...task, enabled: !task.enabled } : task
    );
    saveData(updated);
  };

  const deleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = dailyTasks.filter(task => task.id !== taskId);
            saveData(updated);
          }
        }
      ]
    );
  };

  const openEditModal = (task: DailyTask) => {
    setEditingTask({ ...task });
    setShowEditModal(true);
  };

  const saveEdit = () => {
    if (!editingTask) return;
    
    const updated = dailyTasks.map(task =>
      task.id === editingTask.id ? editingTask : task
    );
    saveData(updated);
    setShowEditModal(false);
    setEditingTask(null);
  };

  const addNewTask = () => {
    const newTask: DailyTask = {
      id: Date.now().toString(),
      name: 'New Task',
      target: 1,
      current: 0,
      unit: 'hr',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      enabled: true,
    };
    setEditingTask(newTask);
    setShowEditModal(true);
  };

  const saveNewTask = () => {
    if (!editingTask) return;
    
    const isNew = !dailyTasks.find(t => t.id === editingTask.id);
    if (isNew) {
      saveData([...dailyTasks, editingTask]);
    } else {
      saveEdit();
    }
    setShowEditModal(false);
    setEditingTask(null);
  };

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
        <Text style={styles.title}>Settings ⚙️</Text>
        <Text style={styles.subtitle}>Customize Your Schedule</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.addButton} onPress={addNewTask}>
          <Text style={styles.addButtonText}>+ Add New Task</Text>
        </TouchableOpacity>

        {dailyTasks.map(task => (
          <View key={task.id} style={[styles.taskCard, !task.enabled && styles.taskCardDisabled]}>
            <View style={styles.taskHeader}>
              <View style={styles.taskInfo}>
                <View style={[styles.colorDot, { backgroundColor: task.color }]} />
                <View>
                  <Text style={[styles.taskName, !task.enabled && styles.taskNameDisabled]}>
                    {task.name}
                  </Text>
                  <Text style={styles.taskTarget}>
                    Target: {task.target} {task.unit}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.toggleButton, task.enabled && styles.toggleButtonActive]}
                onPress={() => toggleTask(task.id)}
              >
                <Text style={styles.toggleButtonText}>
                  {task.enabled ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.taskActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(task)}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteTask(task.id)}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {dailyTasks.find(t => t.id === editingTask?.id) ? 'Edit Task' : 'New Task'}
            </Text>

            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={styles.input}
              value={editingTask?.name}
              onChangeText={(text) => setEditingTask(prev => prev ? { ...prev, name: text } : null)}
              placeholder="Enter task name"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Target Amount</Text>
            <TextInput
              style={styles.input}
              value={editingTask?.target.toString()}
              onChangeText={(text) => setEditingTask(prev => prev ? { ...prev, target: parseFloat(text) || 0 } : null)}
              keyboardType="numeric"
              placeholder="Enter target"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Unit (hr, hrs, min, etc.)</Text>
            <TextInput
              style={styles.input}
              value={editingTask?.unit}
              onChangeText={(text) => setEditingTask(prev => prev ? { ...prev, unit: text } : null)}
              placeholder="Enter unit"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Color</Text>
            <View style={styles.colorPicker}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    editingTask?.color === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setEditingTask(prev => prev ? { ...prev, color } : null)}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingTask(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveNewTask}
              >
                <Text style={styles.modalButtonText}>Save</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
  taskCard: {
    backgroundColor: '#1e1e3f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  taskCardDisabled: {
    opacity: 0.5,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  taskNameDisabled: {
    color: '#6b7280',
  },
  taskTarget: {
    fontSize: 14,
    color: '#9ca3af',
  },
  toggleButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#22c55e',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
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
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#fff',
    borderWidth: 3,
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