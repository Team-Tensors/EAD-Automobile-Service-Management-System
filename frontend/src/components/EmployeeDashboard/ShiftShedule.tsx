import React, { useEffect, useState } from 'react';
import type { Appointment } from '@/types/appointment';
import shiftSchedulingService from '@/services/shiftSchedulingService';

const ShiftShedule: React.FC = () => {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [assigningId, setAssigningId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetch = async () => {
			setLoading(true);
			setError(null);
			try {
				const resp = await shiftSchedulingService.getPossibleAppointments();
				setAppointments(resp.data || []);
			} catch (err: unknown) {
				setError((err as Error).message || 'Failed to load appointments');
			} finally {
				setLoading(false);
			}
		};

		fetch();
	}, []);

	const handleAssign = async (appointmentId: string) => {

		setAssigningId(appointmentId);
		setError(null);
		try {
			await shiftSchedulingService.assignEmployee({ appointmentId });

			// Remove assigned appointment from list (or mark assigned)
			setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
		} catch (err: unknown) {
			setError((err as Error).message || 'Failed to assign appointment');
		} finally {
			setAssigningId(null);
		}
	};

	return (
		<div className="p-4">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-2xl font-semibold text-slate-800">Shift schedule</h2>
				<div className="text-sm text-slate-500">Self-assign available appointments</div>
			</div>

			{loading ? (
				<div className="py-8 text-center text-slate-500">Loading available appointments…</div>
			) : error ? (
				<div className="mb-4 p-3 rounded-md bg-red-50 text-red-700">{error}</div>
			) : appointments.length === 0 ? (
				<div className="py-8 text-center text-slate-500">No available appointments at the moment.</div>
			) : (
				<div className="space-y-3">
					{appointments.map((a) => (
						<div
							key={a.id}
							className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border"
						>
							<div className="flex-1">
								<div className="flex items-center gap-3">
									<div className="text-sm text-slate-500">{new Date(a.appointmentDate).toLocaleDateString()} • {a.appointmentTime}</div>
									<div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{a.appointmentType}</div>
								</div>

								<div className="mt-2 text-sm text-slate-700">
									<div>Vehicle: <span className="font-medium">{a.vehicleId}</span></div>
									<div>Service center: <span className="font-medium">{a.serviceCenterId}</span></div>
									{a.description && <div className="mt-1 text-slate-500">{a.description}</div>}
								</div>
							</div>

							<div className="ml-4 flex items-center gap-2">
								<div className="text-sm text-slate-500 mr-2">{a.status}</div>
								<button
									className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
									onClick={() => handleAssign(a.id)}
									disabled={assigningId === a.id}
								>
									{assigningId === a.id ? 'Assigning…' : 'Assign to me'}
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default ShiftShedule;
