import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import auth from "../authService";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

function SystemResources() {
  const [resources, setResources] = useState({
    memory: null,
    cpu: null,
    disk: null,
    processes: [],
    wifi: null,
    graphics: [],
  });

  useEffect(() => {
    auth.get("/api/system")
      .then((res) => {
        const data = res.data;

        const parseGB = (val) => parseFloat(val.replace(" GB", ""));
        const parseMB = (val) => parseFloat(val.replace(" MB", ""));
        const parsePercent = (val) => parseFloat(val.replace("%", ""));

        setResources({
          memory: {
            total: parseGB(data.memory.total),
            used: parseGB(data.memory.used),
            free: parseGB(data.memory.free),
          },
          cpu: {
            cores: data.cpu.cores,
            usage: parseFloat(data.cpu.usage),
            temperature: 0, // Replace if you add temp fetching
          },
          disk: data.disk.length > 0
            ? {
                total: parseGB(data.disk[0].total),
                used: parseGB(data.disk[0].used),
                free: parseGB(data.disk[0].free),
              }
            : null,
          processes: data.topProcesses.map(proc => ({
            pid: proc.pid,
            name: proc.name,
            memory: parseMB(proc.memory),
            cpu: parsePercent(proc.cpu),
          })),
          wifi: data.wifi,
          graphics: data.graphics,
        });
      })
      .catch((err) => {
        console.error("Error fetching system info:", err);
      });
  }, []);

  // Function to format numbers
  const formatNumber = (num, type) => {
    if (isNaN(num)) return 'N/A';
    return type === 'percentage' ? `${num.toFixed(2)}%` : `${num.toFixed(2)} GB`;
  };

  const memoryChartData = resources.memory
    ? [
        { name: "Used", value: resources.memory.used },
        { name: "Free", value: resources.memory.free },
      ]
    : [];

  const diskChartData = resources.disk
    ? [
        { name: "Used", value: resources.disk.used },
        { name: "Free", value: resources.disk.free },
      ]
    : [];

  const cpuChartData = resources.cpu
    ? [{ name: "CPU Usage", value: parseFloat(resources.cpu.usage) }]
    : [];

  return (
    <section className="section">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">System Resource Management</h1>

        {/* Memory */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Memory</h2>
          <div className="flex gap-6 items-center">
            <div>
              <p>Total: {formatNumber(resources.memory?.total, 'memory')}</p>
              <p>Used: {formatNumber(resources.memory?.used, 'memory')}</p>
              <p>Free: {formatNumber(resources.memory?.free, 'memory')}</p>
            </div>
            <PieChart width={200} height={200}>
              <Pie
                data={memoryChartData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label
              >
                {memoryChartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
        </section>

        {/* CPU */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">CPU</h2>
          <p>Cores: {resources.cpu?.cores}</p>
          <p>Usage: {formatNumber(resources.cpu?.usage, 'percentage')}</p>
          <p>Temperature: {resources.cpu?.temperature}°C</p>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cpuChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Disk */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Disk</h2>
          <div className="flex gap-6 items-center">
            <div>
              <p>Total: {formatNumber(resources.disk?.total, 'memory')}</p>
              <p>Used: {formatNumber(resources.disk?.used, 'memory')}</p>
              <p>Free: {formatNumber(resources.disk?.free, 'memory')}</p>
            </div>
            <PieChart width={200} height={200}>
              <Pie
                data={diskChartData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label
              >
                {diskChartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
        </section>

        {/* Wi-Fi */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Wi-Fi</h2>
          <p>SSID: {resources.wifi?.ssid || 'N/A'}</p>
          <p>Signal Level: {resources.wifi?.signalLevel || 'N/A'}</p>
          <p>Speed: {resources.wifi?.speed || 'N/A'}</p>
        </section>

        {/* Graphics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Graphics</h2>
          {resources.graphics.map((gpu, index) => (
            <div key={index}>
              <p>Name: {gpu.name}</p>
              <p>Usage: {formatNumber(gpu.usage, 'percentage')}</p>
              <p>Temperature: {gpu.temperature || 'N/A'}</p>
            </div>
          ))}
        </section>

        {/* Processes */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Running Processes</h2>
          <table className="w-full border border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">PID</th>
                <th className="border p-2">Process Name</th>
                <th className="border p-2">Memory Usage (GB)</th>
                <th className="border p-2">CPU Usage (%)</th>
              </tr>
            </thead>
            <tbody>
              {resources.processes.map((proc) => (
                <tr key={proc.pid}>
                  <td className="border p-2">{proc.pid}</td>
                  <td className="border p-2">{proc.name}</td>
                  <td className="border p-2">{formatNumber(proc.memory, 'memory')}</td>
                  <td className="border p-2">{formatNumber(proc.cpu, 'percentage')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </section>
  );
}

export default SystemResources;
