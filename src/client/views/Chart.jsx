import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
        const response = await axios.get(`/api/sessions`);
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
              label: 'Number of Sessions per Tutor',
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

  return (
    <div>
      <h1>Sessions per Tutor</h1>
      <Bar data={chartData} />
    </div>
  );
};

export default Graph;
