import React from 'react';
import Calendar from './Calendar';
import CalendarComponent from '../components/CalendarPage';

const CalendarMain: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">Pet Adoption Events Calendar</h1>
                <p className="text-gray-600">
                    Find upcoming pet adoption events, vaccination clinics, and training workshops.
                    Schedule your visit or register to participate in these community events.
                </p>
            </div>

            {/* Monthly calendar view */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Monthly View</h2>
                <Calendar />
            </div>

            {/* List view of upcoming events */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
                <CalendarComponent />
            </div>

            {/* Additional information section */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-xl font-semibold text-blue-800 mb-3">Virtual Events</h2>
                <p className="text-gray-700 mb-4">
                    In addition to in-person events, we also host regular virtual adoption sessions and
                    educational webinars. These online events make it easy to participate from anywhere.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Browse Virtual Events
                </button>
            </div>

            {/* FAQ section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>

                <div className="space-y-4">
                    <div className="border-b pb-3">
                        <h3 className="font-medium text-lg mb-2">What should I bring to an adoption event?</h3>
                        <p className="text-gray-600">
                            Please bring a valid ID, proof of residence (like a utility bill), and any information about your
                            living situation that may be relevant to the adoption process. If you're a renter, proof that
                            pets are allowed in your building is helpful.
                        </p>
                    </div>

                    <div className="border-b pb-3">
                        <h3 className="font-medium text-lg mb-2">How do I register for an event?</h3>
                        <p className="text-gray-600">
                            Click on any event in the calendar to see its details. For events that require
                            registration, you'll find a registration button in the details popup. Some events
                            are drop-in and don't require advance registration.
                        </p>
                    </div>

                    <div className="border-b pb-3">
                        <h3 className="font-medium text-lg mb-2">Can I bring my current pet to meet a potential new pet?</h3>
                        <p className="text-gray-600">
                            This depends on the specific event and shelter policies. Many adoption events do
                            allow "meet and greets" between your current pets and potential new family members,
                            but please check the event details or contact the organizer in advance.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium text-lg mb-2">How can my shelter add events to this calendar?</h3>
                        <p className="text-gray-600">
                            If you're a shelter or rescue organization representative, please use the "Submit an Event"
                            button on the calendar page. Our team will review and add appropriate events to our community calendar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarMain;