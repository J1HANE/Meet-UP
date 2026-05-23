// src/pages/StatisticsPage.tsx
import React from "react";
import { useTaskStore } from "@/store/taskStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { TaskHeader } from "@/components/tasks-service/TaskHeader";

// CSS-variable-aware tooltip so it matches the card theme
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className='rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg'>
      {label && <p className='font-semibold text-foreground mb-1'>{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className='flex items-center gap-2'>
          <div
            className='w-2 h-2 rounded-full'
            style={{ background: p.fill ?? p.color }}
          />
          <span className='text-muted-foreground'>{p.name ?? p.dataKey}:</span>
          <span className='font-medium text-foreground'>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const STATUS_COLORS = [
  "#378ADD",
  "#BA7517",
  "#7F77DD",
  "#E24B4A",
  "#9b87f5",
  "#1D9E75",
  "#888780",
];
const PRIORITY_COLORS = ["#3B82F6", "#1D9E75", "#F59E0B", "#E24B4A"];

export const StatisticsPage: React.FC = () => {
  const { tasks } = useTaskStore();
  const meetingName = "Project Alpha";

  const statusData = [
    {
      name: "In Backlog",
      value: tasks.filter((t) => t.status === "IN_BACKLOG").length,
    },
    {
      name: "Assigned",
      value: tasks.filter((t) => t.status === "ASSIGNED").length,
    },
    {
      name: "In Progress",
      value: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    },
    {
      name: "Blocked",
      value: tasks.filter((t) => t.status === "BLOCKED").length,
    },
    {
      name: "In Review",
      value: tasks.filter((t) => t.status === "IN_REVIEW").length,
    },
    {
      name: "Completed",
      value: tasks.filter((t) => t.status === "COMPLETED").length,
    },
    {
      name: "Cancelled",
      value: tasks.filter((t) => t.status === "CANCELLED").length,
    },
  ];

  const priorityData = [
    { name: "Low", value: tasks.filter((t) => t.priority === "LOW").length },
    {
      name: "Normal",
      value: tasks.filter((t) => t.priority === "NORMAL").length,
    },
    { name: "High", value: tasks.filter((t) => t.priority === "HIGH").length },
    {
      name: "Urgent",
      value: tasks.filter((t) => t.priority === "URGENT").length,
    },
  ];

  const categoryData = tasks.reduce(
    (acc, task) => {
      if (task.category) {
        const existing = acc.find((a) => a.name === task.category?.name);
        if (existing) existing.value++;
        else acc.push({ name: task.category.name, value: 1 });
      }
      return acc;
    },
    [] as { name: string; value: number }[],
  );

  const progressData = tasks
    .filter((t) => t.status !== "IN_BACKLOG")
    .map((t) => ({
      name: t.taskName.substring(0, 20),
      progress: t.progressPercent,
    }));

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalTasks = tasks.length;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
  const completedPoints = tasks
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.points, 0);

  const summaryCards = [
    { label: "Total Tasks", value: totalTasks, accent: "" },
    {
      label: "Completion Rate",
      value: `${completionRate.toFixed(1)}%`,
      accent: "text-[#1D9E75]",
    },
    { label: "Total Points", value: totalPoints, accent: "" },
    {
      label: "Completed Points",
      value: completedPoints,
      accent: "text-primary",
    },
  ];

  const cardClass =
    "rounded-[1.5rem] border border-border bg-card p-5 hover:border-primary/20 transition-colors";

  return (
    <div className='min-h-screen bg-background'>
      <TaskHeader contextName={meetingName} />
      <div className='container mx-auto px-4 sm:px-6 py-6 space-y-6'>
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className='mt-1 text-sm text-muted-foreground'>
            Overview of task progress and distribution
          </p>
        </motion.div>

        {/* Summary cards */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {summaryCards.map(({ label, value, accent }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cardClass}
            >
              <p className='text-xs text-muted-foreground uppercase tracking-wide mb-1.5'>
                {label}
              </p>
              <p
                className={`font-heading text-3xl font-bold leading-tight text-foreground ${accent}`}
              >
                {value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
          {/* Status pie */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cardClass}
          >
            <h3 className='font-heading font-semibold text-foreground mb-4'>
              Status Distribution
            </h3>
            <ResponsiveContainer width='100%' height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  dataKey='value'
                >
                  {statusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Priority bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={cardClass}
          >
            <h3 className='font-heading font-semibold text-foreground mb-4'>
              Priority Distribution
            </h3>
            <ResponsiveContainer width='100%' height={280}>
              <BarChart data={priorityData} barCategoryGap='30%'>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='hsl(var(--border))'
                  vertical={false}
                />
                <XAxis
                  dataKey='name'
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey='value' radius={[6, 6, 0, 0]}>
                  {priorityData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category pie */}
          {categoryData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cardClass}
            >
              <h3 className='font-heading font-semibold text-foreground mb-4'>
                Tasks by Category
              </h3>
              <ResponsiveContainer width='100%' height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    dataKey='value'
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Progress horizontal bar */}
          {progressData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={cardClass}
            >
              <h3 className='font-heading font-semibold text-foreground mb-4'>
                Task Progress
              </h3>
              <ResponsiveContainer width='100%' height={280}>
                <BarChart
                  data={progressData}
                  layout='vertical'
                  barCategoryGap='20%'
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='hsl(var(--border))'
                    horizontal={false}
                  />
                  <XAxis
                    type='number'
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey='name'
                    type='category'
                    width={110}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey='progress'
                    fill='#378ADD'
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
