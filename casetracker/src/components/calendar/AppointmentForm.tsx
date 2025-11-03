import React, { useState, useEffect } from 'react';
import type { Appointment } from './CalendarView';
import './Calendar.scss';

interface AppointmentFormProps {
    appointment: Appointment | null;
    initialSlot: { start: Date; end: Date } | null;
    onSave: (appointment: Appointment) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
    appointment,
    initialSlot,
    onSave,
    onDelete,
    onClose
}) => {
    const [formData, setFormData] = useState<Omit<Appointment, 'id'>>({
        title: '',
        start: new Date(),
        end: new Date(),
        type: 'appointment',
        client: '',
        caseReference: '',
        location: '',
        notes: '',
        reminder: '1hour'
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (appointment) {
            setFormData({
                title: appointment.title,
                start: appointment.start,
                end: appointment.end,
                type: appointment.type,
                client: appointment.client || '',
                caseReference: appointment.caseReference || '',
                location: appointment.location || '',
                notes: appointment.notes || '',
                reminder: appointment.reminder || '1hour'
            });
        } else if (initialSlot) {
            setFormData(prev => ({
                ...prev,
                start: initialSlot.start,
                end: initialSlot.end
            }));
        }
    }, [appointment, initialSlot]);

    const formatDateTimeLocal = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'start' || name === 'end') {
            setFormData(prev => ({
                ...prev,
                [name]: new Date(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (formData.start >= formData.end) {
            newErrors.end = 'End time must be after start time';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const appointmentToSave: Appointment = {
            id: appointment?.id || `apt-${Date.now()}`,
            ...formData
        };

        onSave(appointmentToSave);
    };

    const handleDelete = () => {
        if (appointment && window.confirm('Are you sure you want to delete this appointment?')) {
            onDelete(appointment.id);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{appointment ? 'Edit Appointment' : 'New Appointment'}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="appointment-form">
                    <div className="form-group">
                        <label htmlFor="title">
                            Title <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Client Meeting - Smith Case"
                            className={errors.title ? 'error' : ''}
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Event Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                        >
                            <option value="appointment">Appointment</option>
                            <option value="court-date">Court Date</option>
                            <option value="deadline">Deadline</option>
                            <option value="task">Task</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="start">
                                Start Date & Time <span className="required">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                id="start"
                                name="start"
                                value={formatDateTimeLocal(formData.start)}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="end">
                                End Date & Time <span className="required">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                id="end"
                                name="end"
                                value={formatDateTimeLocal(formData.end)}
                                onChange={handleInputChange}
                                className={errors.end ? 'error' : ''}
                            />
                            {errors.end && <span className="error-message">{errors.end}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="client">Client Name</label>
                            <input
                                type="text"
                                id="client"
                                name="client"
                                value={formData.client}
                                onChange={handleInputChange}
                                placeholder="e.g., John Smith"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="caseReference">Case Reference</label>
                            <input
                                type="text"
                                id="caseReference"
                                name="caseReference"
                                value={formData.caseReference}
                                onChange={handleInputChange}
                                placeholder="e.g., CASE-2025-001"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="e.g., Office - Conference Room A"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reminder">Reminder</label>
                        <select
                            id="reminder"
                            name="reminder"
                            value={formData.reminder}
                            onChange={handleInputChange}
                        >
                            <option value="15min">15 minutes before</option>
                            <option value="1hour">1 hour before</option>
                            <option value="1day">1 day before</option>
                            <option value="1week">1 week before</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Additional notes or details..."
                        />
                    </div>

                    <div className="form-actions">
                        <div>
                            {appointment && (
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                        <div className="form-actions-right">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {appointment ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentForm;