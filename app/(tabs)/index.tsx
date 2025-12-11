import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface DailyTask {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  color: string;
}

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    { id: 'sleep', name: '6 hrs Sleep', target: 6, current: 0, unit: 'hrs', color: '#6366f1' },
    { id: 'gym1', name: 'Morning Gym', target: 1, current: 0, unit: 'hr', color: '#ef4444' },
    { id: 'fullstack', name: 'Fullstack Learning', target: 2, current: 0, unit: 'hrs', color: '#3b82f6' },
    { id: 'schoolwork', name: 'School Work', target: 4, current: 0, unit: 'hrs', color: '#22c55e' },
    { id: 'doordash', name: 'DoorDash', target: 5, current: 0, unit: 'hrs', color: '#f97316' },
    { id: 'homework', name: 'School Homework', target: 4, current: 0, unit: 'hrs', color: '#a855f7' },
    { id: 'gym2', name: 'Evening Gym', target: 1, current: 0, unit: 'hr', color: '#ef4444' },
  ]);

  const updateTaskProgress = (taskId: string, increment: boolean) => {
    setDailyTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, current: increment 
            ? Math.min(task.current + 0.5, task.target)
            : Math.max(task.current - 0.5, 0)
          }
        : task
    ));
  };

  const getDailyProgress = () => {
    const completed = dailyTasks.reduce((acc, task) => 
      acc + (task.current >= task.target ? 1 : 0), 0
    );
    return Math.round((completed / dailyTasks.length) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Winter Break Grind 💪</Text>
        <Text style={styles.subtitle}>Daily Progress: {getDailyProgress()}%</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {dailyTasks.map(task => {
          const progress = (task.current / task.target) * 100;
          return (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskName}>{task.name}</Text>
                <Text style={styles.taskProgress}>
                  {task.current}/{task.target} {task.unit}
                </Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${progress}%`, backgroundColor: task.color }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.taskButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSmall]}
                  onPress={() => updateTaskProgress(task.id, false)}
                >
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSmall, { backgroundColor: task.color }]}
                  onPress={() => updateTaskProgress(task.id, true)}
                >
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
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
    fontSize: 18,
    color: '#a855f7',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#1e1e3f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  taskProgress: {
    fontSize: 14,
    color: '#9ca3af',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  taskButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    backgroundColor: '#6b7280',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonSmall: {
    flex: 0,
    minWidth: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});