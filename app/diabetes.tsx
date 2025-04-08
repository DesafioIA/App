import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function DiabetesRiskCalculator() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('low');
  const [risk, setRisk] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const estadisticasbuttom = async () => {
    router.push('/DiabetesRiskPage');
  }

  // Obtener el userId desde AsyncStorage al cargar el componente
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          console.log('UserId encontrado:', storedUserId);
          setUserId(storedUserId);
        } else {
          console.warn('No se encontró el userId en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al obtener userId:', error);
      }
    };

    getUserId();
  }, []);

  const calculateRisk = async () => {
    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
  
    if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum)) {
      Alert.alert('Por favor, ingresa datos válidos.');
      return;
    }
  
    const imc = weightNum / (heightNum * heightNum);
    const riskLevel = (ageNum > 45 || imc >= 25 || activity === 'low') ? 'Alto riesgo' : 'Bajo riesgo';
    setRisk(riskLevel);
  
    const token = await AsyncStorage.getItem('authToken');
    const userIdString = await AsyncStorage.getItem('userId');
  
    if (!token || !userIdString) {
      Alert.alert('Error', 'Faltan datos de autenticación');
      return;
    }
  
    const userIdNum = parseInt(userIdString, 10);
    if (isNaN(userIdNum)) {
      Alert.alert('Error', 'userId inválido');
      return;
    }

    console.log('Datos enviados al backend:', {
        userId: userIdNum,
        age: ageNum,
        weight: weightNum,
        height: heightNum,
        activity,
        risk: riskLevel,
      });
      
  
    try {
      const response = await fetch('http://192.168.18.113:3000/api/v1/diabetes-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userIdNum,
          age: ageNum,
          weight: weightNum,
          height: heightNum,
          activity,
          risk: riskLevel,
        }),
      });
  
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Éxito', 'Datos guardados correctamente');
      } else {
        Alert.alert('Error', result.message || 'No se pudieron guardar los datos');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión con el servidor');
    }

    
  };
  

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Test de Riesgo de Diabetes</Text>

      <TextInput
        value={age}
        onChangeText={setAge}
        placeholder="Edad"
        keyboardType="numeric"
        style={{
          width: 250,
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
          paddingLeft: 10,
        }}
      />
      <TextInput
        value={weight}
        onChangeText={setWeight}
        placeholder="Peso en kg"
        keyboardType="numeric"
        style={{
          width: 250,
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
          paddingLeft: 10,
        }}
      />
      <TextInput
        value={height}
        onChangeText={setHeight}
        placeholder="Altura en metros"
        keyboardType="numeric"
        style={{
          width: 250,
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
          paddingLeft: 10,
        }}
      />

      <Picker
        selectedValue={activity}
        onValueChange={(itemValue) => setActivity(itemValue)}
        style={{ height: 50, width: 150 }}
      >
        <Picker.Item label="Baja" value="low" />
        <Picker.Item label="Media" value="medium" />
        <Picker.Item label="Alta" value="high" />
      </Picker>

      <Button title="Calcular Riesgo" onPress={calculateRisk} />
      {risk && <Text style={{ marginTop: 20 }}>Riesgo de Diabetes: {risk}</Text>}

      <Button title="Estadisticas" onPress={estadisticasbuttom} />

    </View>
  );
}
