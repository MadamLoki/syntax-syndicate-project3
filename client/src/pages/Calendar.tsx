import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'adoption' | 'clinic' | 'training' | 'conference' | 'meeting' | 'fundraising';
  description: string;
  location?: string;
}

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Sample events data
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Adoption Day Event',
      date: '2025-01-15',
      type: 'adoption',
      description: 'Find your perfect companion at our monthly adoption day. Multiple shelters will be present with animals looking for their forever homes.',
      location: 'Central Park Community Center'
    },
    {
      id: '2',
      title: 'Vaccination Clinic',
      date: '2025-01-07',
      type: 'clinic',
      description: 'Low-cost vaccination clinic for pets. First come, first served.',
      location: 'Main Street Veterinary Hospital'
    },
    {
      id: '3',
      title: 'Pet First Aid Class',
      date: '2025-01-18',
      type: 'training',
      description: 'Learn life-saving skills for your pets in emergency situations.',
      location: 'Community Training Center'
    },
    {
      id: '4',
      title: 'Animal Welfare Conference',
      date: '2025-01-25',
      type: 'conference',
      description: 'Annual conference discussing the latest in animal welfare practices and policies.',
      location: 'Downtown Convention Center'
    },
    {
      id: '5',
      title: 'Volunteer Orientation',
      date: '2025-01-10',
      type: 'meeting',
      description: 'Orientation for new shelter volunteers. Learn about opportunities to help animals in need.',
      location: 'Hope Animal Shelter'
    },
    {
      id: '6',
      title: 'Fundraising Gala',
      date: '2025-01-28',
      type: 'fundraising',
      description: 'Annual black-tie fundraiser to support local animal shelters. Dinner, silent auction, and more.',
      location: 'Grand Ballroom Hotel'
    }
  ];

  // Helper functions for calendar rendering
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Generate days for the current month view
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="border p-2 h-24 bg-gray-50"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      
      // Find events for this day
      const dayEvents = events.filter(event => event.date === dateString);

      days.push(
        <div 
          key={`day-${day}`} 
          className={`border p-2 h-24 hover:bg-blue-50 transition-colors cursor-pointer ${
            date.toDateString() === new Date().toDateString() ? 'bg-blue-100' : 'bg-white'
          }`}
          onClick={() => handleDateClick(date)}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">{day}</span>
            {dayEvents.length > 0 && (
              <span className="text-xs bg-blue-500 text-white rounded-full px-2 py-0.5">
                {dayEvents.length}
              </span>
            )}
          </div>
          <div className="mt-1 overflow-y-auto max-h-16">
            {dayEvents.map(event => (
              <div 
                key={event.id}
                className={`text-xs p-1 mb-1 truncate rounded ${getEventColor(event.type)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event);
                }}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  // Get background color based on event type
  const getEventColor = (type: string) => {
    switch (type) {
      case 'adoption': return 'bg-green-100 text-green-800';
      case 'clinic': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-orange-100 text-orange-800';
      case 'conference': return 'bg-purple-100 text-purple-800';
      case 'meeting': return 'bg-pink-100 text-pink-800';
      case 'fundraising': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Navigation between months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Handle clicking on a date
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // Here you could open a modal to add events or view events for that day
  };

  // Handle clicking on an event
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Format date as Month Year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Pet Adoption Events Calendar</h1>
          <p className="text-gray-600">Stay updated on all pet adoption events, clinics, and workshops in your area.</p>
        </div>

        {/* Calendar navigation */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={previousMonth}
            className="p-2 border rounded-lg hover:bg-gray-100"
          >
            &lt; Previous
          </button>
          <h2 className="text-xl font-semibold">{formatMonthYear(currentMonth)}</h2>
          <button 
            onClick={nextMonth}
            className="p-2 border rounded-lg hover:bg-gray-100"
          >
            Next &gt;
          </button>
        </div>

        {/* Calendar weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold py-2 bg-gray-100">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {generateCalendarDays()}
        </div>

        {/* Calendar Legend */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-2">Event Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
              <span className="text-sm">Adoption Events</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
              <span className="text-sm">Health Clinics</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-orange-400 rounded-full mr-2"></span>
              <span className="text-sm">Training Sessions</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-purple-400 rounded-full mr-2"></span>
              <span className="text-sm">Conferences</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-pink-400 rounded-full mr-2"></span>
              <span className="text-sm">Meetings</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-indigo-400 rounded-full mr-2"></span>
              <span className="text-sm">Fundraising</span>
            </div>
          </div>
        </div>

        {/* Host an event section */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">Hosting an Event?</h2>
          <p className="text-gray-700 mb-4">
            If you're a shelter or rescue organization and would like to add your adoption
            event to our calendar, please contact us with the details.
          </p>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/contact')}
          >
            Submit an Event
          </button>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
              <button 
                onClick={() => setShowEventModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getEventColor(selectedEvent.type)}`}>
              {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2"><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              
              {selectedEvent.location && (
                <p className="text-gray-700 mb-2"><strong>Location:</strong> {selectedEvent.location}</p>
              )}
              
              <p className="text-gray-700"><strong>Description:</strong></p>
              <p className="text-gray-600">{selectedEvent.description}</p>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => {
                  // This could redirect to a registration page for the event
                  alert('Registration feature would open here');
                }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;