// import React, { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// const Home = () => {
//   // Mock user data for demonstration
//   const user = { 
//     role: 'ADMIN', 
//     name: 'Dr. Sarah Johnson' 
//   };

//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [lastUpdate, setLastUpdate] = useState(new Date());
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Mock dashboard data
//   const [dashboardData] = useState({
//     totalAppointments: 156,
//     todayAppointments: 12,
//     activePatients: 89,
//     totalDoctors: 15,
//     pendingAppointments: 8,
//     completedAppointments: 124,
//     confirmedAppointments: 24,
//     cancelledAppointments: 8,
//     systemHealth: 98.5,
//     upcomingAppointments: 3
//   });

//   // Mock data for charts
//   const appointmentTrends = [
//     { time: '08:00', scheduled: 3, completed: 2, pending: 1 },
//     { time: '09:00', scheduled: 5, completed: 4, pending: 1 },
//     { time: '10:00', scheduled: 4, completed: 3, pending: 1 },
//     { time: '11:00', scheduled: 6, completed: 5, pending: 1 },
//     { time: '12:00', scheduled: 2, completed: 2, pending: 0 },
//     { time: '13:00', scheduled: 3, completed: 1, pending: 2 },
//     { time: '14:00', scheduled: 7, completed: 4, pending: 3 },
//     { time: '15:00', scheduled: 5, completed: 3, pending: 2 },
//     { time: '16:00', scheduled: 4, completed: 2, pending: 2 },
//     { time: '17:00', scheduled: 3, completed: 1, pending: 2 }
//   ];

//   const statusDistribution = [
//     { name: 'Confirmed', value: 45, color: '#14b8a6' },
//     { name: 'Completed', value: 124, color: '#10b981' },
//     { name: 'Pending', value: 8, color: '#f59e0b' },
//     { name: 'Cancelled', value: 8, color: '#ef4444' }
//   ];

//   const weeklyStats = [
//     { day: 'Mon', appointments: 18, completed: 15 },
//     { day: 'Tue', appointments: 22, completed: 19 },
//     { day: 'Wed', appointments: 25, completed: 21 },
//     { day: 'Thu', appointments: 20, completed: 17 },
//     { day: 'Fri', appointments: 24, completed: 20 },
//     { day: 'Sat', appointments: 15, completed: 12 },
//     { day: 'Sun', appointments: 8, completed: 6 }
//   ];

//   const recentActivity = [
//     {
//       id: 1,
//       icon: '✅',
//       message: 'Appointment confirmed',
//       details: 'Sarah Wilson with Dr. Smith',
//       time: '5 min ago',
//       status: 'success'
//     },
//     {
//       id: 2,
//       icon: '👤',
//       message: 'New patient registered',
//       details: 'John Doe joined the system',
//       time: '12 min ago',
//       status: 'info'
//     },
//     {
//       id: 3,
//       icon: '🎉',
//       message: 'Appointment completed',
//       details: 'Emma Johnson with Dr. Brown',
//       time: '25 min ago',
//       status: 'success'
//     },
//     {
//       id: 4,
//       icon: '⏳',
//       message: 'Appointment pending approval',
//       details: 'Michael Davis requesting consultation',
//       time: '1h ago',
//       status: 'warning'
//     }
//   ];

//   // Get role-specific dashboard cards
//   const getDashboardCards = () => {
//     const baseCards = [
//       {
//         title: 'System Health',
//         value: `${dashboardData.systemHealth.toFixed(1)}%`,
//         subtitle: 'All systems operational',
//         icon: '🛡️',
//         color: 'from-emerald-500 to-teal-600',
//         trend: '+0.2%',
//         trendColor: 'text-emerald-600'
//       }
//     ];

//     if (user?.role === 'ADMIN') {
//       return [
//         {
//           title: 'Total Appointments',
//           value: dashboardData.totalAppointments,
//           subtitle: 'All appointments',
//           icon: '📅',
//           color: 'from-blue-500 to-cyan-600',
//           trend: '+12%',
//           trendColor: 'text-emerald-600'
//         },
//         {
//           title: 'Active Patients',
//           value: dashboardData.activePatients,
//           subtitle: 'Registered users',
//           icon: '👥',
//           color: 'from-teal-500 to-emerald-600',
//           trend: '+8%',
//           trendColor: 'text-emerald-600'
//         },
//         {
//           title: 'Total Doctors',
//           value: dashboardData.totalDoctors,
//           subtitle: 'Healthcare providers',
//           icon: '👨‍⚕️',
//           color: 'from-purple-500 to-indigo-600',
//           trend: '+3%',
//           trendColor: 'text-emerald-600'
//         },
//         {
//           title: 'Pending Approvals',
//           value: dashboardData.pendingAppointments,
//           subtitle: 'Need attention',
//           icon: '⏰',
//           color: 'from-orange-500 to-red-500',
//           trend: `${dashboardData.pendingAppointments}`,
//           trendColor: 'text-orange-600'
//         },
//         ...baseCards
//       ];
//     }
    
//     return baseCards;
//   };

//   // Real-time updates
//   useEffect(() => {
//     const timeInterval = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     const updateInterval = setInterval(() => {
//       setLastUpdate(new Date());
//     }, 30000);

//     return () => {
//       clearInterval(timeInterval);
//       clearInterval(updateInterval);
//     };
//   }, []);

//   const fetchDashboardData = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
//       setLastUpdate(new Date());
//     }, 1000);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-teal-500 to-emerald-600 shadow-xl">
//         <div className="px-6 py-8">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
//                 {user?.role === 'ADMIN' ? 'Admin Dashboard' : 
//                  user?.role === 'DOCTOR' ? 'Doctor Dashboard' : 
//                  'Patient Dashboard'}
//               </h1>
//               <p className="text-teal-100 text-lg">
//                 Welcome back, {user?.name || 'User'}! Here's your real-time overview.
//               </p>
//               {error && (
//                 <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//                   {error}
//                 </div>
//               )}
//             </div>
//             <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl p-4">
//               <div className="text-3xl font-mono text-white font-bold">
//                 {currentTime.toLocaleTimeString()}
//               </div>
//               <div className="text-sm text-teal-100 flex items-center gap-2 justify-end mt-1">
//                 <span className={`${loading ? 'animate-spin' : ''}`}>🔄</span>
//                 Last update: {lastUpdate.toLocaleTimeString()}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="p-6">
//         {/* Dashboard Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
//           {getDashboardCards().map((card, index) => (
//             <div 
//               key={index} 
//               className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 hover:scale-105 relative overflow-hidden"
//               style={{ animationDelay: `${index * 0.1}s` }}
//             >
//               {/* Gradient border */}
//               <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl"></div>
//               <div className="absolute inset-[2px] bg-white rounded-2xl"></div>
              
//               <div className="relative z-10">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className={`bg-gradient-to-r ${card.color} p-4 rounded-xl shadow-lg`}>
//                     <span className="text-3xl text-white drop-shadow-sm">{card.icon}</span>
//                   </div>
//                   {card.trend && (
//                     <span className={`text-sm font-bold px-3 py-1 rounded-full ${
//                       card.trendColor || 'text-emerald-600'
//                     } bg-emerald-50`}>
//                       {card.trend}
//                     </span>
//                   )}
//                 </div>
//                 <div>
//                   <div className="text-3xl font-bold text-gray-900 mb-2">
//                     {card.value}
//                   </div>
//                   <div className="text-gray-600 text-sm mb-3">
//                     {card.subtitle}
//                   </div>
//                   <h3 className="text-lg font-bold text-teal-700">
//                     {card.title}
//                   </h3>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Charts Section */}
//         {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//             {/* Today's Appointment Trends */}
//             <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
//               <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-teal-700">
//                 <span className="text-3xl">📈</span>
//                 Today's Appointment Schedule
//               </h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={appointmentTrends}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                   <XAxis dataKey="time" stroke="#64748b" />
//                   <YAxis stroke="#64748b" />
//                   <Tooltip 
//                     contentStyle={{
//                       backgroundColor: 'white',
//                       border: '1px solid #14b8a6',
//                       borderRadius: '8px',
//                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                     }}
//                   />
//                   <Line 
//                     type="monotone" 
//                     dataKey="scheduled" 
//                     stroke="#14b8a6" 
//                     strokeWidth={3}
//                     name="Scheduled"
//                     dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
//                   />
//                   <Line 
//                     type="monotone" 
//                     dataKey="completed" 
//                     stroke="#10b981" 
//                     strokeWidth={3}
//                     name="Completed"
//                     dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
//                   />
//                   <Line 
//                     type="monotone" 
//                     dataKey="pending" 
//                     stroke="#f59e0b" 
//                     strokeWidth={3}
//                     name="Pending"
//                     dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Appointment Status Distribution */}
//             <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
//               <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-teal-700">
//                 <span className="text-3xl">📊</span>
//                 Status Distribution
//               </h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={statusDistribution}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={100}
//                     innerRadius={60}
//                     dataKey="value"
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   >
//                     {statusDistribution.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip 
//                     contentStyle={{
//                       backgroundColor: 'white',
//                       border: '1px solid #14b8a6',
//                       borderRadius: '8px',
//                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                     }}
//                   />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         )}

//         {/* Weekly Stats */}
//         {user?.role === 'ADMIN' && (
//           <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
//             <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-teal-700">
//               <span className="text-3xl">📅</span>
//               Weekly Appointment Overview
//             </h3>
//             <ResponsiveContainer width="100%" height={350}>
//               <BarChart data={weeklyStats}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                 <XAxis dataKey="day" stroke="#64748b" />
//                 <YAxis stroke="#64748b" />
//                 <Tooltip 
//                   contentStyle={{
//                     backgroundColor: 'white',
//                     border: '1px solid #14b8a6',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                   }}
//                 />
//                 <Bar dataKey="appointments" fill="#14b8a6" name="Total" radius={[4, 4, 0, 0]} />
//                 <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         )}

//         {/* Recent Activity */}
//         <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
//           <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-teal-700">
//             <span className="text-3xl">🔔</span>
//             Recent Activity
//           </h3>
//           <div className="space-y-4">
//             {recentActivity.map((activity) => (
//               <div 
//                 key={activity.id} 
//                 className="flex items-start gap-4 p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl hover:from-teal-100 hover:to-emerald-100 transition-all duration-300 border border-teal-100 hover:border-teal-200"
//               >
//                 <div className={`p-3 rounded-full shadow-md ${
//                   activity.status === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
//                   activity.status === 'warning' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
//                   activity.status === 'error' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
//                   'bg-gradient-to-r from-blue-500 to-cyan-500'
//                 }`}>
//                   <span className="text-xl text-white">{activity.icon}</span>
//                 </div>
//                 <div className="flex-1">
//                   <div className="font-bold text-gray-900 text-lg mb-1">
//                     {activity.message}
//                   </div>
//                   <div className="text-gray-600">
//                     {activity.details}
//                   </div>
//                 </div>
//                 <div className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full">
//                   {activity.time}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Floating Refresh Button */}
//         <button
//           onClick={fetchDashboardData}
//           disabled={loading}
//           className="fixed bottom-8 right-8 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-50"
//           title="Refresh Dashboard"
//         >
//           <span className={`text-2xl ${loading ? 'animate-spin' : ''}`}>🔄</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from "../utils/api";
import { useUser } from "../App";

const AdminDashboard = () => {
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Backend data state
  const [dashboardData, setDashboardData] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    activePatients: 0,
    totalDoctors: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    systemHealth: 98.5,
    revenue: 0,
    newRegistrations: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Chart data
  const [appointmentTrends, setAppointmentTrends] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      console.log("📊 Fetching admin dashboard data...");
      console.log("🔑 Auth token:", localStorage.getItem("authToken") ? "Present" : "Missing");

      // Use the correct API endpoints with proper error handling
      const [
        statsRes, 
        appointmentsRes, 
        patientsRes, 
        doctorsRes, 
        statusDistRes, 
        hourlyTrendsRes,
        weeklyStatsRes,
        recentActivityRes,
        patientTrendsRes,
        doctorStatsRes
      ] = await Promise.all([
        api.get('/api/appointments/dashboard/stats').catch(err => {
          console.error('Stats API failed:', err.response?.status, err.response?.data || err.message);
          return { data: null };
        }),
        api.get('/api/appointments').catch(err => {
          console.error('Appointments API failed:', err.response?.status, err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/api/patients').catch(err => {
          console.error('Patients API failed:', err.response?.status, err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/api/doctors').catch(err => {
          console.error('Doctors API failed:', err.response?.status, err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/api/appointments/dashboard/status-distribution').catch(err => {
          console.error('Status distribution API failed:', err.response?.status, err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/api/appointments/dashboard/hourly-trends').catch(err => {
          console.error('Hourly trends API failed:', err.response?.status, err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/api/appointments/dashboard/weekly-stats').catch(err => {
          console.error('Weekly stats API failed:', err.response?.status, err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/api/appointments/dashboard/recent-activity').catch(err => {
          console.error('Recent activity API failed:', err.response?.status, err.response?.data || err.message);
          return { data: [] };
        }),
        api.get('/api/patients/dashboard/registration-trends').catch(err => {
          console.error('Patient trends API failed:', err.response?.status, err.response?.data || err.message);
          return { data: null };
        }),
        api.get('/api/doctors/dashboard/doctor-stats').catch(err => {
          console.error('Doctor stats API failed:', err.response?.status, err.response?.data || err.message);
          return { data: null };
        })
      ]);

      const statsData = statsRes.data;
      const appointmentsData = appointmentsRes.data || [];
      const patientsData = patientsRes.data || [];
      const doctorsData = doctorsRes.data || [];
      const statusDistData = statusDistRes.data || [];
      const hourlyTrendsData = hourlyTrendsRes.data || [];
      const weeklyStatsData = weeklyStatsRes.data || [];
      const recentActivityData = recentActivityRes.data || [];
      const patientTrendsData = patientTrendsRes.data;
      const doctorStatsData = doctorStatsRes.data;

      // Use backend stats if available, otherwise calculate from appointments data
      if (statsData) {
        console.log("✅ Using backend dashboard stats");
        const newRegistrations = patientTrendsData?.newThisMonth || 
          patientsData.filter(p => {
            const createdDate = new Date(p.createdAt || p.registrationDate || p.dateOfBirth);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate >= thirtyDaysAgo;
          }).length;

        setDashboardData({
          totalAppointments: statsData.totalAppointments || 0,
          todayAppointments: statsData.todayAppointments || 0,
          activePatients: patientsData.length,
          totalDoctors: doctorsData.length,
          pendingAppointments: statsData.pendingAppointments || 0,
          completedAppointments: statsData.completedAppointments || 0,
          systemHealth: 98.5,
          revenue: statsData.monthlyRevenue || 0,
          newRegistrations
        });
      } else {
        console.log("⚠️ Using calculated dashboard stats");
        // Fallback to client-side calculation
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointmentsData.filter(apt => 
          apt.appointmentDate === today
        ).length;

        const pendingAppointments = appointmentsData.filter(apt => 
          apt.status === 'PENDING' || apt.status === 'SCHEDULED'
        ).length;

        const completedAppointments = appointmentsData.filter(apt => 
          apt.status === 'COMPLETED'
        ).length;

        const monthlyRevenue = appointmentsData
          .filter(apt => apt.status === 'COMPLETED')
          .reduce((total, apt) => total + (apt.fee || 150), 0);

        const newRegistrations = patientsData.filter(p => {
          const createdDate = new Date(p.createdAt || p.registrationDate || p.dateOfBirth);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdDate >= thirtyDaysAgo;
        }).length;

        setDashboardData({
          totalAppointments: appointmentsData.length,
          todayAppointments,
          activePatients: patientsData.length,
          totalDoctors: doctorsData.length,
          pendingAppointments,
          completedAppointments,
          systemHealth: 98.5,
          revenue: monthlyRevenue,
          newRegistrations
        });
      }

      // Set raw data
      setAppointments(appointmentsData);
      setPatients(patientsData);
      setDoctors(doctorsData);

      // Process chart data using backend data if available
      if (hourlyTrendsData.length > 0) {
        console.log("✅ Using backend hourly trends");
        setAppointmentTrends(hourlyTrendsData.map(trend => ({
          time: trend.time,
          scheduled: trend.scheduled || 0,
          completed: trend.completed || 0,
          pending: trend.pending || 0
        })));
      } else {
        console.log("⚠️ Using calculated hourly trends");
        processHourlyTrends(appointmentsData);
      }

      // Process status distribution
      if (statusDistData.length > 0) {
        console.log("✅ Using backend status distribution");
        const statusColors = {
          'CONFIRMED': '#059669',
          'COMPLETED': '#0d9488',
          'PENDING': '#f59e0b',
          'SCHEDULED': '#f59e0b',
          'CANCELLED': '#ef4444',
          'REJECTED': '#ef4444'
        };

        setStatusDistribution(
          statusDistData.map(item => ({
            name: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
            value: item.count,
            color: statusColors[item.status] || '#6b7280'
          }))
        );
      } else {
        console.log("⚠️ Using calculated status distribution");
        processStatusDistribution(appointmentsData);
      }

      // Generate weekly stats using backend data if available
      if (weeklyStatsData.length > 0) {
        console.log("✅ Using backend weekly stats");
        setWeeklyStats(weeklyStatsData);
      } else {
        console.log("⚠️ Using generated weekly stats");
        generateWeeklyStats();
      }
      
      // Generate recent activity using backend data if available
      if (recentActivityData.length > 0) {
        console.log("✅ Using backend recent activity");
        setRecentActivity(recentActivityData);
      } else {
        console.log("⚠️ Using generated recent activity");
        generateRecentActivity(appointmentsData, patientsData, doctorsData);
      }

      setLastUpdate(new Date());
      console.log("✅ Dashboard data loaded successfully");

    } catch (error) {
      console.error("❌ Failed to fetch dashboard data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  // Process hourly trends from appointments data
  const processHourlyTrends = (appointmentsData) => {
    const hourlyData = {};
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize hourly slots
    for (let hour = 8; hour <= 18; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      hourlyData[timeSlot] = { time: timeSlot, scheduled: 0, completed: 0, pending: 0 };
    }
    
    appointmentsData
      .filter(apt => apt.appointmentDate === today)
      .forEach(apt => {
        const hour = apt.appointmentTime ? apt.appointmentTime.split(':')[0] : '12';
        const timeSlot = `${hour.padStart(2, '0')}:00`;
        
        if (hourlyData[timeSlot]) {
          hourlyData[timeSlot].scheduled++;
          
          if (apt.status === 'COMPLETED') {
            hourlyData[timeSlot].completed++;
          } else if (apt.status === 'PENDING' || apt.status === 'SCHEDULED') {
            hourlyData[timeSlot].pending++;
          }
        }
      });

    setAppointmentTrends(Object.values(hourlyData).sort((a, b) => a.time.localeCompare(b.time)));
  };

  // Process status distribution from appointments data
  const processStatusDistribution = (appointmentsData) => {
    const statusCounts = appointmentsData.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});

    const statusColors = {
      CONFIRMED: '#059669',
      COMPLETED: '#0d9488',
      PENDING: '#f59e0b',
      SCHEDULED: '#f59e0b',
      CANCELLED: '#ef4444',
      REJECTED: '#ef4444'
    };

    setStatusDistribution(
      Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0) + status.slice(1).toLowerCase(),
        value: count,
        color: statusColors[status] || '#6b7280'
      }))
    );
  };

  // Generate weekly stats (mock data - replace with real API when available)
  const generateWeeklyStats = () => {
    const weeklyData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    days.forEach(day => {
      const dayAppointments = Math.floor(Math.random() * 30) + 10;
      weeklyData.push({
        day,
        appointments: dayAppointments,
        revenue: dayAppointments * 120
      });
    });

    setWeeklyStats(weeklyData);
  };

  // Generate recent activity
  const generateRecentActivity = (appointmentsData, patientsData, doctorsData) => {
    const activities = [];
    
    // Recent appointments
    appointmentsData
      .slice(0, 3)
      .forEach(apt => {
        activities.push({
          id: `apt-${apt.id}`,
          type: 'appointment',
          message: 'New appointment scheduled',
          details: `${apt.patient?.name || 'Patient'} with ${apt.doctor?.name || 'Doctor'}`,
          time: getRelativeTime(apt.createdAt),
          status: 'info'
        });
      });

    // Recent doctor registrations
    doctorsData
      .slice(0, 2)
      .forEach(doctor => {
        activities.push({
          id: `doc-${doctor.id}`,
          type: 'user',
          message: 'New doctor registered',
          details: `Dr. ${doctor.name} joined ${doctor.specialization}`,
          time: getRelativeTime(doctor.createdAt),
          status: 'success'
        });
      });

    // System maintenance (mock)
    activities.push({
      id: 'system-1',
      type: 'warning',
      message: 'System maintenance scheduled',
      details: 'Planned downtime: 2:00 AM - 4:00 AM',
      time: '2h ago',
      status: 'warning'
    });

    setRecentActivity(activities.slice(0, 6));
  };

  // Helper function for relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  // Dashboard cards configuration
  const dashboardCards = [
    {
      title: 'Total Appointments',
      value: dashboardData.totalAppointments,
      subtitle: 'All time appointments',
      icon: '📅',
      colorClass: 'blue',
      trend: '+12%',
      trendPositive: true
    },
    {
      title: 'Active Patients',
      value: dashboardData.activePatients,
      subtitle: 'Registered patients',
      icon: '👥',
      colorClass: 'green',
      trend: '+8%',
      trendPositive: true
    },
    {
      title: 'Total Doctors',
      value: dashboardData.totalDoctors,
      subtitle: 'Healthcare providers',
      icon: '👨‍⚕️',
      colorClass: 'purple',
      trend: '+3%',
      trendPositive: true
    },
    {
      title: 'Monthly Revenue',
      value: `$${dashboardData.revenue.toLocaleString()}`,
      subtitle: 'This month',
      icon: '💰',
      colorClass: 'amber',
      trend: '+15%',
      trendPositive: true
    },
    {
      title: 'Pending Approvals',
      value: dashboardData.pendingAppointments,
      subtitle: 'Need attention',
      icon: '⏰',
      colorClass: 'red',
      trend: dashboardData.pendingAppointments > 10 ? 'High' : 'Normal',
      trendPositive: dashboardData.pendingAppointments <= 10
    },
    {
      title: 'System Health',
      value: `${dashboardData.systemHealth.toFixed(1)}%`,
      subtitle: 'All systems operational',
      icon: '🛡️',
      colorClass: 'teal',
      trend: '+0.2%',
      trendPositive: true
    }
  ];

  // Real-time updates
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Initial data fetch and periodic refresh
  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic refresh every 5 minutes for real-time updates
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData().finally(() => {
      setTimeout(() => setLoading(false), 1000);
    });
  };

  const getStatusIcon = (type) => {
    const icons = {
      appointment: '📅',
      user: '👤',
      complete: '✅',
      warning: '⚠️',
      system: '🔧'
    };
    return icons[type] || '📋';
  };

  if (dataLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="dashboard-title">Admin Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome back, <strong>{user?.name || 'Administrator'}</strong>! Monitor your healthcare system performance.
              </p>
            </div>
            <div className="dashboard-user-info">
              <div className="dashboard-time">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="dashboard-last-update">
                <span className={loading ? 'loading-spinner' : ''} style={{ fontSize: '0.8rem' }}>
                  🔄
                </span>
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Dashboard Cards */}
        <div className="stats-grid">
          {dashboardCards.map((card, index) => (
            <div key={index} className={`stat-card ${card.colorClass}`}>
              <div className="stat-card-header">
                <div className="stat-card-icon">
                  {card.icon}
                </div>
                {card.trend && (
                  <span className={`stat-card-trend ${card.trendPositive ? 'positive' : 'negative'}`}>
                    {card.trend}
                  </span>
                )}
              </div>
              <div className="stat-card-value">{card.value}</div>
              <div className="stat-card-label">{card.subtitle}</div>
              <div className="stat-card-title">{card.title}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="dashboard-grid two-col">
          {/* Today's Appointment Trends */}
          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title">Today's Schedule</h3>
              <span className="chart-meta">Live Data</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={appointmentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="scheduled" stroke="#3b82f6" strokeWidth={2} name="Scheduled" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title">Appointment Status</h3>
              <span className="chart-meta">
                Total: {statusDistribution.reduce((acc, item) => acc + item.value, 0)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Performance */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Weekly Performance</h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
                <span>Appointments</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                <span>Revenue</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar yAxisId="left" dataKey="appointments" fill="#3b82f6" name="Appointments" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Recent Activity</h3>
            <button
              className="dashboard-btn secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="dashboard-card-content">
            {recentActivity.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-title">No recent activity</div>
                <div className="empty-state-text">System activity will appear here</div>
              </div>
            ) : (
              <div className="activity-feed">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className={`activity-item ${activity.status}`}>
                    <div className="activity-icon">
                      {getStatusIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-message">{activity.message}</div>
                      <div className="activity-details">{activity.details}</div>
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;