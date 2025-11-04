import api from '@/util/apiUtils';

class ShiftSchedulingService {
    private base = '/shifts';

    public async getShifts() {
        return await api.get(`${this.base}`);
    }

    /**
     * Fetch possible appointments that the employee can take.
     * Backend endpoint: /shift/possible-appointments
     */
    public async getPossibleAppointments() {
        return await api.get('/shift/possible-appointments');
    }

    /**
     * Assign an employee to an appointment.
     * Backend endpoint: /shift/self-assign-employee
     */
    public async assignEmployee(payload: { appointmentId: string }) {
        return await api.post('/shift/self-assign-employee', payload);
    }
}

export default new ShiftSchedulingService();