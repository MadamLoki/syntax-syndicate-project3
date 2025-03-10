import React from 'react';

interface CalendarComponentProps {
    
}

const CalendarComponent: React.FC<CalendarComponentProps> = () => {
    // Sample events data
    const events = [
        {
            date: '2025-01-15',
            title: 'Adoption Day Event',
            type: 'adoption',
            location: 'Central Park Community Center'
        },
        {
            date: '2025-01-07',
            title: 'Vaccination Clinic',
            type: 'clinic',
            location: 'Main Street Veterinary Hospital'
        },
        {
            date: '2025-01-18',
            title: 'Pet First Aid Class',
            type: 'training',
            location: 'Community Training Center'
        },
        {
            date: '2025-01-25',
            title: 'Animal Welfare Conference',
            type: 'conference',
            location: 'Downtown Convention Center'
        }
    ];

    const eventColors = {
        adoption: 'bg-green-100 text-green-800 border-green-200',
        clinic: 'bg-blue-100 text-blue-800 border-blue-200',
        training: 'bg-orange-100 text-orange-800 border-orange-200',
        conference: 'bg-purple-100 text-purple-800 border-purple-200',
        meeting: 'bg-pink-100 text-pink-800 border-pink-200',
        fundraising: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };

    // Group events by date for easier rendering
    const groupedEvents = events.reduce((acc, event) => {
        if (!acc[event.date]) {
            acc[event.date] = [];
        }
        acc[event.date].push(event);
        return acc;
    }, {} as Record<string, typeof events>);

    // Format date for display (e.g., "January 15, 2025")
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Upcoming Pet Events</h2>
                <p className="text-gray-600 mt-2">
                    Stay updated on all pet adoption events, clinics, and workshops in your area.
                    Click on any event to see details or add it to your personal calendar.
                </p>
            </div>

            {/* List of upcoming events */}
            <div className="space-y-6">
                {Object.entries(groupedEvents).sort().map(([date, dayEvents]) => (
                    <div key={date} className="border-b pb-6">
                        <h3 className="text-lg font-semibold mb-3">{formatDate(date)}</h3>
                        <div className="space-y-3">
                            {dayEvents.map((event, idx) => (
                                <div
                                    key={`${date}-${idx}`}
                                    className={`p-4 rounded-lg border ${eventColors[event.type as keyof typeof eventColors] || 'bg-gray-100'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-lg">{event.title}</h4>
                                            <p className="text-sm mt-1">{event.location}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-white">
                                            {(event.type as string).charAt(0).toUpperCase() + (event.type as string).slice(1)}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button className="text-sm text-blue-600 hover:text-blue-800">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* No events message (shown if no events are available) */}
            {Object.keys(groupedEvents).length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-lg text-gray-600">No upcoming events at this time.</p>
                    <p className="text-gray-500 mt-2">Please check back later for new events.</p>
                </div>
            )}

            {/* Legend for event types */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Event Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                        <span>Adoption Events</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                        <span>Health Clinics</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-orange-400 rounded-full mr-2"></span>
                        <span>Training Sessions</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-purple-400 rounded-full mr-2"></span>
                        <span>Conferences</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-pink-400 rounded-full mr-2"></span>
                        <span>Meetings</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-indigo-400 rounded-full mr-2"></span>
                        <span>Fundraising</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarComponent;