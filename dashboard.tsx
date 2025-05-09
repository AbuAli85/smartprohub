"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"

// Sample data - would be fetched from your API in a real implementation
const priorityStatus = [
  { name: "P1: Booking System", progress: 30, color: "#3b82f6" },
  { name: "P2: Messaging", progress: 10, color: "#8b5cf6" },
  { name: "P3: Build Process", progress: 50, color: "#10b981" },
  { name: "P4: Testing", progress: 20, color: "#f59e0b" },
  { name: "P5: Mobile Responsiveness", progress: 10, color: "#ef4444" },
]

const upcomingDeadlines = [
  { task: "Calendar Fix", daysLeft: 2, priority: "high" },
  { task: "Routing Audit", daysLeft: 1, priority: "medium" },
  { task: "Realtime Report", daysLeft: 3, priority: "high" },
]

const velocityData = [
  { name: "Week 1", tasks: 8 },
  { name: "Week 2", tasks: 12 },
  { name: "Week 3", tasks: 15 },
]

const recentActivity = [
  { user: "Alex", action: "completed", task: "Update build configuration", time: "1 hour ago" },
  { user: "Sarah", action: "started", task: "Mobile UI audit", time: "3 hours ago" },
  { user: "John", action: "commented on", task: "Calendar integration issues", time: "5 hours ago" },
  { user: "Maria", action: "resolved blocker", task: "API endpoint access", time: "yesterday" },
  { user: "Team", action: "completed", task: "5 tasks", time: "yesterday" },
]

const blockers = [
  { issue: "Supabase realtime connection issues", days: 2, status: "active" },
  { issue: "Missing design specs for mobile booking", days: 1, status: "active" },
  { issue: "Build failing on deployment", days: 0, status: "active", isNew: true },
  { issue: "API rate limiting", days: 1, status: "resolved" },
  { issue: "Database migration error", days: 2, status: "resolved" },
]

const testCoverage = [
  { name: "Auth", value: 65, color: "#3b82f6" },
  { name: "Booking", value: 40, color: "#8b5cf6" },
  { name: "Messaging", value: 30, color: "#10b981" },
  { name: "API", value: 50, color: "#f59e0b" },
]

export default function ProjectDashboard() {
  const [overallProgress, setOverallProgress] = useState(35)
  const [tasksCompleted, setTasksCompleted] = useState(35)
  const [totalTasks, setTotalTasks] = useState(100)
  const [daysElapsed, setDaysElapsed] = useState(8)
  const [totalDays, setTotalDays] = useState(42)

  // In a real implementation, you would fetch this data from your API
  useEffect(() => {
    // Fetch data here
    // Example: fetchDashboardData().then(data => {
    //   setOverallProgress(data.progress)
    //   setTasksCompleted(data.tasksCompleted)
    //   // etc.
    // })
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SmartPRO Business Services Hub</h1>
        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</p>
      </div>
      <h2 className="text-xl font-semibold">Project Tracking Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={overallProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">{overallProgress}%</p>
              <div className="text-sm">
                <p>
                  {tasksCompleted} / {totalTasks} Tasks
                </p>
                <p>
                  {daysElapsed} / {totalDays} Days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Priority Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {priorityStatus.map((priority) => (
                <div key={priority.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{priority.name}</span>
                    <span>{priority.progress}%</span>
                  </div>
                  <Progress value={priority.progress} className="h-1" indicatorClassName={`bg-[${priority.color}]`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {upcomingDeadlines.map((deadline, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-sm">• {deadline.task}</span>
                  <Badge variant={deadline.priority === "high" ? "destructive" : "outline"}>
                    {deadline.daysLeft} {deadline.daysLeft === 1 ? "day" : "days"}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Team Velocity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData}>
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-sm">
              <p>Last Week: 12 tasks</p>
              <p>This Week: 15 tasks (projected)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recentActivity.map((activity, index) => (
              <li key={index} className="text-sm">
                • <span className="font-medium">{activity.user}</span> {activity.action} "{activity.task}" (
                {activity.time})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blocker Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blocker Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Active Blockers: {blockers.filter((b) => b.status === "active").length}
                </h4>
                <ul className="space-y-2">
                  {blockers
                    .filter((b) => b.status === "active")
                    .map((blocker, index) => (
                      <li key={index} className="text-sm flex items-center">
                        • {blocker.issue} ({blocker.days} {blocker.days === 1 ? "day" : "days"})
                        {blocker.isNew && (
                          <Badge className="ml-2" variant="outline">
                            new
                          </Badge>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Recently Resolved: {blockers.filter((b) => b.status === "resolved").length}
                </h4>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Coverage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="h-[120px] w-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={testCoverage}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {testCoverage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1">
              {testCoverage.map((item) => (
                <div key={item.name} className="flex items-center text-sm">
                  <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: item.color }}></div>
                  <span>
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Priority 1: Booking System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Fix calendar integration issues</span>
                  <span>60%</span>
                </div>
                <Progress value={60} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Implement booking conflict detection</span>
                  <span>40%</span>
                </div>
                <Progress value={40} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Develop recurring booking functionality</span>
                  <span>20%</span>
                </div>
                <Progress value={20} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Create booking notification system</span>
                  <span>10%</span>
                </div>
                <Progress value={10} className="h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Priority 2: Messaging</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Diagnose Supabase realtime issues</span>
                  <span>30%</span>
                </div>
                <Progress value={30} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Implement connection resilience</span>
                  <span>10%</span>
                </div>
                <Progress value={10} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Research alternative solutions</span>
                  <span>20%</span>
                </div>
                <Progress value={20} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Add file/image attachment support</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
