'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { eventService } from '@/lib/services';
import { EventAttendance, Event, Member } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, Calendar, MapPin, Clock, Users } from 'lucide-react';

// Extend EventAttendance type to include event and member details
type EventAttendanceWithDetails = EventAttendance & {
  event: Event;
  member: Member;
};

export default function ConfirmAttendancePage() {
  const params = useParams();
  const token = params.token as string;

  const [attendance, setAttendance] = useState<EventAttendanceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const { data, error } = await eventService.getAttendanceByToken(token);
        if (error || !data) {
          throw new Error(error?.message || 'Presença não encontrada ou token inválido.');
        }
        setAttendance(data);
        setMessage(''); // Clear previous messages
      } catch (err: any) {
        console.error('Erro ao buscar presença:', err);
        setMessage(err.message || 'Erro ao carregar os detalhes da presença.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [token]);

  const handleStatusUpdate = async (newStatus: 'confirmed' | 'declined' | 'absent') => {
    if (!attendance) return;
    setSubmitting(true);
    try {
      const { data, error } = await eventService.updateAttendanceByToken(token, newStatus);
      if (error || !data) {
        throw new Error(error?.message || 'Erro ao atualizar o status da presença.');
      }
      setAttendance((prev) => (prev ? { ...prev, status: data.status } : null));
      toast.success(`Status atualizado para ${newStatus}!`);
      setMessage(`A sua presença foi marcada como "${newStatus}".`);
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar o status da presença.');
      setMessage(err.message || 'Erro ao atualizar o status da presença.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do evento...</p>
        </div>
      </div>
    );
  }

  if (message && !attendance) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">{message}</p>
        </div>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md text-gray-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">Presença não encontrada.</p>
        </div>
      </div>
    );
  }

  const event = attendance.event;
  const member = attendance.member;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="text-green-600 font-semibold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Confirmado</span>;
      case 'declined':
        return <span className="text-red-600 font-semibold flex items-center gap-2"><XCircle className="w-5 h-5" /> Declinado</span>;
      case 'absent':
        return <span className="text-yellow-600 font-semibold flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Ausente</span>;
      case 'pending':
        return <span className="text-blue-600 font-semibold flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Pendente</span>;
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Confirmação de Presença</h1>
        <p className="text-gray-600 text-center">Olá, <span className="font-semibold">{member.name}</span>!</p>
        <p className="text-gray-700 text-center">Por favor, confirme a sua presença para o seguinte evento:</p>

        {/* Event Details Card */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="text-2xl font-bold text-blue-700">{event.title}</h2>
          <p className="text-gray-700 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            {new Date(event.event_date).toLocaleDateString('pt-PT', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
          {event.location && (
            <p className="text-gray-700 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" /> {event.location}
            </p>
          )}
          {event.duration_minutes && (
            <p className="text-gray-700 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" /> {event.duration_minutes} minutos
            </p>
          )}
          {event.description && (
            <p className="text-gray-600 text-sm mt-2">{event.description}</p>
          )}
        </div>

        {/* Current Status */}
        <div className="text-center text-lg">
          <p className="text-gray-800">Seu status atual: {getStatusDisplay(attendance.status)}</p>
        </div>

        {/* Confirmation Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleStatusUpdate('confirmed')}
            disabled={submitting || attendance.status === 'confirmed'}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
              attendance.status === 'confirmed'
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-green-100 hover:bg-green-200 text-green-800'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            {submitting && attendance.status !== 'confirmed' ? 'Confirmando...' : 'Confirmar Presença'}
          </button>

          <button
            onClick={() => handleStatusUpdate('declined')}
            disabled={submitting || attendance.status === 'declined'}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
              attendance.status === 'declined'
                ? 'bg-red-500 text-white cursor-not-allowed'
                : 'bg-red-100 hover:bg-red-200 text-red-800'
            }`}
          >
            <XCircle className="w-5 h-5" />
            {submitting && attendance.status !== 'declined' ? 'Declinando...' : 'Declinar Presença'}
          </button>

          <button
            onClick={() => handleStatusUpdate('absent')}
            disabled={submitting || attendance.status === 'absent'}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
              attendance.status === 'absent'
                ? 'bg-yellow-500 text-white cursor-not-allowed'
                : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            {submitting && attendance.status !== 'absent' ? 'Marcando Ausência...' : 'Marcar Ausência'}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center ${attendance.status === 'confirmed' ? 'bg-green-50 text-green-700' : attendance.status === 'declined' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
            {message}
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          Este link é único para a sua presença neste evento.
        </p>
      </div>
    </div>
  );
}
