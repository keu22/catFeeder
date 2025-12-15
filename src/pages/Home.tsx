import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Plus, Trash2, Home, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeedingEntry {
  id: number;
  amount: number;
  foodType: string;
  notifyTime: string;
  notes: string;
  timestamp: string;
}

interface Appointment {
  id: number;
  type: string;
  date: string;
  time: string;
  notes: string;
  timestamp: string;
}

const HomePage: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [entries, setEntries] = useState<FeedingEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [amount, setAmount] = useState(50);
  const [foodType, setFoodType] = useState('wet');
  const [notifyTime, setNotifyTime] = useState('08:00');
  const [notes, setNotes] = useState('');
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Appointment state
  const [appointmentType, setAppointmentType] = useState('vet');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  useEffect(() => {
    const savedEntries = localStorage.getItem('feedingEntries');
    const savedAppointments = localStorage.getItem('appointments');
    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
  }, []);

  useEffect(() => {
    localStorage.setItem('feedingEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const addEntry = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const newEntry: FeedingEntry = {
      id: Date.now(),
      amount,
      foodType,
      notifyTime,
      notes,
      timestamp: localDate.toISOString(),
    };
    setEntries([newEntry, ...entries]);
    setShowAddModal(false);
    setNotes('');
    setAmount(50);
  };

  const addAppointment = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const newAppointment: Appointment = {
      id: Date.now(),
      type: appointmentType,
      date: appointmentDate,
      time: appointmentTime,
      notes: appointmentNotes,
      timestamp: localDate.toISOString(),
    };
    setAppointments([newAppointment, ...appointments]);
    setShowAppointmentModal(false);
    setAppointmentNotes('');
    setAppointmentDate('');
    alert(`Appointment reminder set for ${appointmentDate} at ${appointmentTime}`);
  };

  const deleteEntry = (id: number) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const deleteAppointment = (id: number) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEntriesForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return entries.filter(e => e.timestamp.startsWith(dateStr));
  };

  const getAppointmentsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return appointments.filter(a => a.date === dateStr);
  };

const renderCalendar = () => {
  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const days = [];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-12 rounded-lg bg-gray-100" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateEntries = getEntriesForDate(date);
    const dateAppointments = getAppointmentsForDate(date);
    const isToday = new Date().toDateString() === date.toDateString();
    const hasActivity = dateEntries.length > 0 || dateAppointments.length > 0;
    const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
    
    days.push(
      <button
        key={day}
        onClick={() => setSelectedDate(date)}
        className={`h-12 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all ${
          isToday 
            ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg' 
            : isSelected
            ? 'bg-orange-100 text-orange-900 ring-2 ring-orange-500'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className={isToday ? 'font-bold' : ''}>{day}</span>
        {hasActivity && (
          <div className="flex gap-1 mt-0.5">
            {dateEntries.length > 0 && <div className="w-1 h-1 bg-green-500 rounded-full" />}
            {dateAppointments.length > 0 && <div className="w-1 h-1 bg-red-500 rounded-full" />}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-bold text-gray-600 py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>
    </div>
  );
};

  const renderSelectedDateDetails = () => {
  if (!selectedDate) return null;

  const dateEntries = getEntriesForDate(selectedDate);
  const dateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="mt-4 bg-white rounded-2xl p-4 shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-gray-800">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        <button onClick={() => setSelectedDate(null)} className="text-gray-400 text-2xl">×</button>
      </div>

      {dateAppointments.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-red-600 mb-2 flex items-center gap-1">
            <Stethoscope className="w-4 h-4" /> Appointments
          </h4>
          {dateAppointments.map(apt => (
            <div key={apt.id} className="bg-red-50 rounded-lg p-3 mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold capitalize text-gray-800">{apt.type === 'vet' ? '🏥 Vet Visit' : '📋 ' + apt.type}</div>
                  <div className="text-sm text-gray-600">{apt.time}</div>
                  {apt.notes && <div className="text-sm mt-1 text-gray-700">{apt.notes}</div>}
                </div>
                <button onClick={() => deleteAppointment(apt.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {dateEntries.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-green-600 mb-2">🍽️ Feedings ({dateEntries.length})</h4>
          {dateEntries.map(entry => (
            <div key={entry.id} className="bg-green-50 rounded-lg p-3 mb-2">
              <div className="flex justify-between">
                <div>
                  <span className="text-xl mr-2">{entry.foodType === 'wet' ? '🥫' : '🌾'}</span>
                  <span className="font-semibold text-gray-800">{entry.amount}g</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button onClick={() => deleteEntry(entry.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {dateEntries.length === 0 && dateAppointments.length === 0 && (
        <div className="text-center text-gray-400 py-4">No activities on this day</div>
      )}
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">🐱 Cat Care Tracker</h1>
        <p className="text-orange-100 text-sm mt-1">Feeding & appointments</p>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-md flex">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${
            currentView === 'home' ? 'bg-orange-500 text-white' : 'text-gray-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="font-semibold">Home</span>
        </button>
        <button
          onClick={() => setCurrentView('calendar')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${
            currentView === 'calendar' ? 'bg-orange-500 text-white' : 'text-gray-600'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="font-semibold">Calendar</span>
        </button>
      </div>

      {/* Home View */}
      {currentView === 'home' && (
        <div className="p-4 pb-24">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Recent Activity</h2>
          
          {entries.length === 0 && appointments.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No activity yet</p>
              <p className="text-sm">Add feedings or appointments to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {([...entries, ...appointments] as (FeedingEntry | Appointment)[])
                .sort((a, b) => {
                  const aDate = 'amount' in a ? a.timestamp : a.date;
                  const bDate = 'amount' in b ? b.timestamp : b.date;
                  return new Date(bDate).getTime() - new Date(aDate).getTime();
                })
                .slice(0, 10)
                .map(item => {
                  if ('amount' in item) {
                    const entry = item as FeedingEntry;
                    return (
                      <div key={entry.id} className="bg-white rounded-2xl p-4 shadow-md">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{entry.foodType === 'wet' ? '🥫' : '🌾'}</span>
                              <span className="font-semibold text-lg text-gray-800">
                                {entry.amount}g of {entry.foodType} food
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(entry.timestamp)}
                            </div>
                            {entry.notes && (
                              <div className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-2">
                                {entry.notes}
                              </div>
                            )}
                          </div>
                          <button onClick={() => deleteEntry(entry.id)} className="text-red-400 hover:text-red-600 p-2">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    const apt = item as Appointment;
                    return (
                      <div key={apt.id} className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-red-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Stethoscope className="w-6 h-6 text-red-500" />
                              <span className="font-semibold text-lg text-gray-800 capitalize">
                                {apt.type === 'vet' ? 'Vet Appointment' : apt.type}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mb-1">
                              📅 {new Date(apt.date).toLocaleDateString()} at {apt.time}
                            </div>
                            {apt.notes && (
                              <div className="text-sm text-gray-600 mt-2 bg-red-50 rounded-lg p-2">
                                {apt.notes}
                              </div>
                            )}
                          </div>
                          <button onClick={() => deleteAppointment(apt.id)} className="text-red-400 hover:text-red-600 p-2">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                })}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {currentView === 'calendar' && (
        <div className="p-4 pb-24 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-lg font-bold text-gray-800">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
          </div>
            {renderCalendar()}
          </div>

          {renderSelectedDateDetails()}

          <div className="mt-4 bg-white rounded-2xl p-4 shadow-md">
            <h3 className="font-semibold mb-3 text-gray-800">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0" />
                <span className="text-gray-700">Feeding entry</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0" />
                <span className="text-gray-700">Appointment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex-shrink-0" />
                <span className="text-gray-700">Today</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <button
          onClick={() => setShowAppointmentModal(true)}
          className="bg-red-500 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-shadow"
          title="Add Appointment"
        >
          <Stethoscope className="w-6 h-6" />
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-shadow"
          title="Add Feeding"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Add Feeding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add Feeding</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 text-3xl leading-none">×</button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Food Type</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFoodType('wet')}
                  className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                    foodType === 'wet' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🥫 Wet Food
                </button>
                <button
                  onClick={() => setFoodType('dry')}
                  className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                    foodType === 'dry' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🌾 Dry Food
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount: {amount}g</label>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10g</span>
                <span>200g</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Or type amount (grams)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                placeholder="Enter amount in grams"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                rows={3}
                placeholder="Add any notes about the feeding..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Next Feeding Reminder</label>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                <input
                  type="time"
                  value={notifyTime}
                  onChange={(e) => setNotifyTime(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={addEntry}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              Save Feeding Entry
            </button>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add Appointment</h2>
              <button onClick={() => setShowAppointmentModal(false)} className="text-gray-400 text-3xl leading-none">×</button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Appointment Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAppointmentType('vet')}
                  className={`py-4 rounded-xl font-semibold transition-all ${
                    appointmentType === 'vet' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🏥 Vet Visit
                </button>
                <button
                  onClick={() => setAppointmentType('grooming')}
                  className={`py-4 rounded-xl font-semibold transition-all ${
                    appointmentType === 'grooming' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  ✂️ Grooming
                </button>
                <button
                  onClick={() => setAppointmentType('vaccination')}
                  className={`py-4 rounded-xl font-semibold transition-all ${
                    appointmentType === 'vaccination' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  💉 Vaccination
                </button>
                <button
                  onClick={() => setAppointmentType('checkup')}
                  className={`py-4 rounded-xl font-semibold transition-all ${
                    appointmentType === 'checkup' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  📋 Checkup
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
                rows={3}
                placeholder="Add appointment details..."
              />
            </div>

            <button
              onClick={addAppointment}
              className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              Save Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;