import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

interface RiskData {
  id: number;
  age: number;
  weight: number;
  height: number;
  activity: string;
  risk: string;
  userId: number;
  createdAt: string;
}

const screenWidth = Dimensions.get('window').width;

const DiabetesRiskPage: React.FC = () => {
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [filteredData, setFilteredData] = useState<RiskData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<number[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [filterLast24Hours, setFilterLast24Hours] = useState<boolean>(false);
  const [averageRisk, setAverageRisk] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        console.log('Token obtenido:', token);

        if (!token) {
          console.error('No se encontró el token de autenticación.');
          setLoading(false);
          return;
        }

        const response = await axios.get<RiskData[]>(
          'http://192.168.18.113:3000/api/v1/diabetes-risk/user',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRiskData(response.data);

        // Filtrar los datos según la selección de filtro
        filterData(response.data, filterLast24Hours);
      } catch (error) {
        console.error('Error al obtener los datos de riesgo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterData = (data: RiskData[], filterLast24Hours: boolean) => {
    let filtered = [...data];

    if (filterLast24Hours) {
      // Obtener la fecha y hora actuales
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Filtrar los registros de las últimas 24 horas
      filtered = data.filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt >= twentyFourHoursAgo;
      });
    }

    // Actualizar el estado con los datos filtrados
    setFilteredData(filtered);

    // Calcular el promedio de riesgo de diabetes
    calculateAverageRisk(filtered);
    // Procesar los datos para el gráfico
    processDataForChart(filtered);
  };

  const calculateAverageRisk = (data: RiskData[]) => {
    let highRiskCount = 0;
    let lowRiskCount = 0;

    data.forEach((item) => {
      if (item.risk === 'Alto riesgo') {
        highRiskCount++;
      } else {
        lowRiskCount++;
      }
    });

    // Determinar el riesgo predominante
    if (highRiskCount > lowRiskCount) {
      setAverageRisk('Alto riesgo');
    } else if (lowRiskCount > highRiskCount) {
      setAverageRisk('Bajo riesgo');
    } else {
      setAverageRisk('Indeterminado'); // En caso de empate
    }
  };

  const processDataForChart = (data: RiskData[]) => {
    const hourlyRiskSum: { [key: string]: number } = {};
    const hourlyRiskCount: { [key: string]: number } = {};
    const dateTimeLabels: string[] = [];

    data.forEach((item) => {
      const dateTime = new Date(item.createdAt).toISOString().slice(0, 19).replace("T", " ");
      const riskValue = item.risk === 'Alto riesgo' ? 2 : 1;

      if (hourlyRiskSum[dateTime]) {
        hourlyRiskSum[dateTime] += riskValue;
        hourlyRiskCount[dateTime]++;
      } else {
        hourlyRiskSum[dateTime] = riskValue;
        hourlyRiskCount[dateTime] = 1;
      }
    });

    for (const dateTime in hourlyRiskSum) {
      dateTimeLabels.push(dateTime);
    }

    dateTimeLabels.sort();

    const averageRiskData = dateTimeLabels.map(
      (dateTime) => hourlyRiskSum[dateTime] / hourlyRiskCount[dateTime]
    );

    setDates(dateTimeLabels);
    setChartData(averageRiskData);
  };

  const toggleFilter = () => {
    // Cambiar el filtro y actualizar los datos filtrados
    const newFilterState = !filterLast24Hours;
    setFilterLast24Hours(newFilterState);
    filterData(riskData, newFilterState); // Filtrar los datos con el nuevo estado
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Historial de Riesgo de Diabetes</Text>
      
      <Button
        title={filterLast24Hours ? 'Mostrar Todos los Datos' : 'Filtrar Últimas 24 Horas'}
        onPress={toggleFilter}
      />

      {filteredData.length === 0 ? (
        <Text style={styles.noData}>No hay datos registrados aún.</Text>
      ) : (
        filteredData.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text><Text style={styles.bold}>Edad:</Text> {item.age}</Text>
            <Text><Text style={styles.bold}>Peso:</Text> {item.weight} kg</Text>
            <Text><Text style={styles.bold}>Altura:</Text> {item.height} cm</Text>
            <Text><Text style={styles.bold}>Actividad:</Text> {item.activity}</Text>
            <Text><Text style={styles.bold}>Riesgo:</Text> {item.risk}</Text>
            <Text style={styles.small}>Registrado el: {new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        ))
      )}

      <View style={styles.averageRiskContainer}>
        <Text style={styles.averageRiskTitle}>Promedio de Riesgo de Diabetes</Text>
        <Text style={styles.averageRiskText}>
          {averageRisk === 'Indeterminado' ? 'No hay suficiente información para determinar el riesgo.' : `Riesgo predominante: ${averageRisk}`}
        </Text>
      </View>

      {chartData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Riesgo Promedio de Diabetes por Día y Hora</Text>

          <ScrollView horizontal contentContainerStyle={{ paddingRight: 16 }}>
            <LineChart
              data={{
                labels: dates.map(dateTime => {
                  const [date, time] = dateTime.split(' ');
                  return `${date}\n${time}`;
                }),
                datasets: [
                  {
                    data: chartData,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth * 2}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#f0f0f0',
                backgroundGradientTo: '#f0f0f0',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffa726',
                },
              }}
              bezier
            />
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noData: {
    fontStyle: 'italic',
    color: 'gray',
  },
  card: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  bold: {
    fontWeight: 'bold',
  },
  small: {
    fontSize: 12,
    color: '#777',
  },
  averageRiskContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  averageRiskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  averageRiskText: {
    fontSize: 16,
  },
  chartContainer: {
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default DiabetesRiskPage;
