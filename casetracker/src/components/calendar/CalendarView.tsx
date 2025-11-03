import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.scss';
import AppointmentForm from './AppointmentForm';

const localizer = momentLocalizer(moment);

export interface Appointment {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: 'appointment' | 'court-date' | 'deadline' | 'task';
    client?: string;
    caseReference?: string;
    location?: string;
    notes?: string;
    reminder?: '15min' | '1hour' | '1day' | '1week';
}

const CalendarView: React.FC = () => {
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

    // Mock data - replace with API calls later
    const [appointments, setAppointments] = useState<Appointment[]>([
        {
            id: '1',
            title: 'Client Consultation - Smith Case',
            start: new Date(2025, 10, 5, 10, 0),
            end: new Date(2025, 10, 5, 11, 0),
            type: 'appointment',
            client: 'John Smith',
            caseReference: 'CASE-2025-001',
            location: 'Office - Room 3A',
            notes: 'Initial consultation regarding property dispute',
            reminder: '1hour'
        },
        {
            id: '2',
            title: 'Court Hearing - Johnson v. State',
            start: new Date(2025, 10, 8, 14, 0),
            end: new Date(2025, 10, 8, 16, 0),
            type: 'court-date',
            client: 'Mary Johnson',
            caseReference: 'CASE-2025-045',
            location: 'District Court, Courtroom 5B',
            notes: 'Preliminary hearing',
            reminder: '1day'
        },
        {
            id: '3',
            title: 'Filing Deadline - Brown Case',
            start: new Date(2025, 10, 12, 17, 0),
            end: new Date(2025, 10, 12, 17, 30),
            type: 'deadline',
            client: 'Robert Brown',
            caseReference: 'CASE-2025-023',
            notes: 'Motion to dismiss must be filed by 5:00 PM',
            reminder: '1week'
        },
        {
            id: '4',
            title: 'Document Review Meeting',
            start: new Date(2025, 10, 15, 9, 0),
            end: new Date(2025, 10, 15, 10, 30),
            type: 'task',
            location: 'Conference Room B',
            notes: 'Review discovery documents with legal team',
            reminder: '1hour'
        }
    ]);

    const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
        setSelectedSlot(slotInfo);
        setSelectedAppointment(null);
        setShowModal(true);
    }, []);

    const handleSelectEvent = useCallback((event: Appointment) => {
        setSelectedAppointment(event);
        setSelectedSlot(null);
        setShowModal(true);
    }, []);

    const handleSaveAppointment = (appointment: Appointment) => {
        if (selectedAppointment) {
            // Update existing appointment
            setAppointments(prev =>
                prev.map(apt => apt.id === appointment.id ? appointment : apt)
            );
        } else {
            // Add new appointment
            setAppointments(prev => [...prev, appointment]);
        }
        setShowModal(false);
        setSelectedAppointment(null);
        setSelectedSlot(null);
    };

    const handleDeleteAppointment = (id: string) => {
        setAppointments(prev => prev.filter(apt => apt.id !== id));
        setShowModal(false);
        setSelectedAppointment(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
        setSelectedSlot(null);
    };

    const eventStyleGetter = (event: Appointment) => {
        let backgroundColor = '#3174ad';

        switch (event.type) {
            case 'appointment':
                backgroundColor = '#3174ad'; // Blue
                break;
            case 'court-date':
                backgroundColor = '#dc3545'; // Red
                break;
            case 'deadline':
                backgroundColor = '#fd7e14'; // Orange
                break;
            case 'task':
                backgroundColor = '#28a745'; // Green
                break;
        }

        const isUpcoming = event.start > new Date() &&
            event.start < new Date(Date.now() + 24 * 60 * 60 * 1000);

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: isUpcoming ? '2px solid #ffc107' : 'none',
                display: 'block',
                fontWeight: isUpcoming ? 'bold' : 'normal'
            }
        };
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h2>Calendar</h2>
                <div className="calendar-legend">
                    <span className="legend-item">
                        <span className="legend-dot appointment"></span>
                        Appointments
                    </span>
                    <span className="legend-item">
                        <span className="legend-dot court-date"></span>
                        Court Dates
                    </span>
                    <span className="legend-item">
                        <span className="legend-dot deadline"></span>
                        Deadlines
                    </span>
                    <span className="legend-item">
                        <span className="legend-dot task"></span>
                        Tasks
                    </span>
                </div>
            </div>

            <Calendar
                localizer={localizer}
                events={appointments}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                step={30}
                showMultiDayTimes
                defaultView="month"
            />

            {showModal && (
                <AppointmentForm
                    appointment={selectedAppointment}
                    initialSlot={selectedSlot}
                    onSave={handleSaveAppointment}
                    onDelete={handleDeleteAppointment}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default CalendarView;