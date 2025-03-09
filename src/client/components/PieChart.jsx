import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';

// Registering chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const PieChart = ({ data }) => {
    // Process the data into a format that Chart.js understands
    const chartData = {
        labels: data.map(session => session.major_name),
        datasets: [
            {
                label: 'Completed Sessions',
                data: data.map(session => session.completed_sessions),
                backgroundColor: [
                    '#FF5733',
                    '#33FF57',
                    '#3357FF',
                    '#FF33A6',
                    '#33FFF7'
                ],
                borderColor: '#fff',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                display: 'inline-block',
                labels: {
                    display: 'flex',
                    width: '100%',
                }
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        return `Completed: ${tooltipItem.raw} sessions`;
                    },
                },
            },
        },
    };

    return (
        <div >
            <Pie data={chartData} options={chartOptions} />
        </div>
    );
};

export default PieChart;
