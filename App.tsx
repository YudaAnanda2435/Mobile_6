import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';

interface Task {
  id?: number;
  title: string;
  deadline: string;
  sesi: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Task>({
    title: '',
    deadline: '',
    sesi: '',
    completed: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const API_URL = 'https://jsonplaceholder.typicode.com/posts';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data.map((item: any) => ({...item, completed: false})));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const createTask = async () => {
    try {
      const response = await axios.post(
        API_URL,
        {...newTask, completed: false},
        {
          headers: {'Content-Type': 'application/json'},
        },
      );
      setTasks([{...response.data, completed: false}, ...tasks]);
      setNewTask({title: '', deadline: '', sesi: '', completed: false});
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const startEditing = (task: Task) => {
    setIsEditing(true);
    setEditTask(task);
  };

  const completeTask = (id: number) => {
    setTasks(
      tasks.map(task => (task.id === id ? {...task, completed: true} : task)),
    );
  };


  const updateTask = async () => {
    if (editTask && editTask.id !== undefined) {
      try {
        const response = await axios.patch(
          `${API_URL}/${editTask.id}`,
          editTask,
          {
            headers: {'Content-Type': 'application/json'},
          },
        );
        setTasks(
          tasks.map(task => (task.id === editTask.id ? response.data : task)),
        );
        setIsEditing(false);
        setEditTask(null);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Aplikasi Manajemen Tugas</Text>

      <View style={styles.formGroup}>
        <TextInput
          placeholder="Nama Mata Kuliah"
          value={isEditing && editTask ? editTask.title : newTask.title}
          onChangeText={text =>
            isEditing && editTask
              ? setEditTask({...editTask, title: text})
              : setNewTask({...newTask, title: text})
          }
          style={styles.input}
        />
        <TextInput
          placeholder="Atur Deadline"
          value={isEditing && editTask ? editTask.deadline : newTask.deadline}
          onChangeText={text =>
            isEditing && editTask
              ? setEditTask({...editTask, deadline: text})
              : setNewTask({...newTask, deadline: text})
          }
          style={styles.input}
        />
        <TextInput
          placeholder="Sesi Tugas"
          value={isEditing && editTask ? editTask.sesi : newTask.sesi}
          onChangeText={text =>
            isEditing && editTask
              ? setEditTask({...editTask, sesi: text})
              : setNewTask({...newTask, sesi: text})
          }
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.button,
            {backgroundColor: isEditing ? '#4CAF50' : '#2196F3'},
          ]}
          onPress={isEditing ? updateTask : createTask}>
          <Text style={styles.buttonText}>
            {isEditing ? 'Perbarui Tugas' : 'Tambah Tugas'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id?.toString() || ''}
        renderItem={({item}) => (
          <View
            style={[styles.taskItem, item.completed && styles.completedTask]}>
            <Text
              style={[
                styles.taskTitle,
                item.completed && styles.completedTitle,
              ]}>
              Mata Kuliah : {item.title}
            </Text>
            <Text
              style={[
                styles.taskDeadline,
                item.completed && styles.completedDeadline,
              ]}>
              Deadline            : {item.deadline}
            </Text>
            <Text
              style={[
                styles.taskSession,
                item.completed && styles.completedSession,
              ]}>
              Tugas Sesi        : {item.sesi}
            </Text>
            <View style={styles.buttonGroup}>
              {!item.completed && (
                <TouchableOpacity
                  onPress={() => startEditing(item)}
                  style={styles.editButton}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => completeTask(item.id!)}
                style={
                  item.completed
                    ? styles.completedButton
                    : styles.completeButton
                }
                disabled={item.completed}>
                <Text style={styles.buttonText}>
                  {item.completed ? 'Selesai' : 'Selesai'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteTask(item.id!)}
                style={styles.deleteButton}>
                <Text style={styles.buttonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 26,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  input: {
    padding: 10,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f4f4f4',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskItem: {
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  completedTask: {
    backgroundColor: '#e0e0e0',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  taskDeadline: {
    fontSize: 15,
    color: '#666',
    marginBottom: 5,
  },
  taskSession: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
  },
  completedTitle: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  completedDeadline: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  completedSession: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  editButton: {
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 10,
  },
  completeButton: {
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  completedButton: {
    padding: 10,
    backgroundColor: '#A9A9A9',
    borderRadius: 10,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: '#F44336',
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default App;
