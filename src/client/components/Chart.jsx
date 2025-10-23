import React, { useEffect, useState } from 'react';
import auth from '../authService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Graph = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Number of Sessions per Tutor',
      data: [],
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      borderWidth: 1
    }]
  });

  useEffect(() => {
    const getSessions = async () => {
      try {
        const response = await auth.get(`/api/sessions`);
        const { data } = response;
        if (data && data.sessions) {
          // Aggregate data: count sessions per tutor
          const tutorSessions = data.sessions.reduce((acc, session) => {
            acc[session.tutor_name] = (acc[session.tutor_name] || 0) + 1;
            return acc;
          }, {});

          // Prepare data for the chart
          const labels = Object.keys(tutorSessions);
          const dataPoints = Object.values(tutorSessions);

          setChartData({
            labels: labels,
            datasets: [{
              label: 'Number of Sessions Tutor',
              data: dataPoints,
              backgroundColor: '#1F49AB',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1
            }]
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    getSessions();
  }, []);

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: 12 
          }
        }
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', padding: '10px', textAlign: 'center' }}>
      <Bar data={chartData} options={options}/>
    </div>
  );
};

export default Graph;
