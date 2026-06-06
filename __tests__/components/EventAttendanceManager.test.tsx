import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventAttendanceManager from '@/components/EventAttendanceManager';
import { eventService } from '@/lib/services';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/services', () => ({
  eventService: {
    setAttendance: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockEvent = {
  id: 1,
  title: 'Ensaio',
  event_date: '2023-01-01',
  event_type: 'rehearsal',
  tuna_id: 1,
  created_at: '2023-01-01',
  attendances: [
    {
      event_id: 1,
      member_id: 1,
      status: 'pending',
      created_at: '2023-01-01',
      member: {
        id: 1,
        name: 'João Silva',
        status: 'active',
        tuna_id: 1,
        created_at: '2023-01-01',
      },
    },
    {
      event_id: 1,
      member_id: 2,
      status: 'confirmed',
      created_at: '2023-01-01',
      member: {
        id: 2,
        name: 'Maria Santos',
        status: 'active',
        tuna_id: 1,
        created_at: '2023-01-01',
      },
    },
  ],
};

const mockOnAttendanceUpdate = jest.fn();

describe('EventAttendanceManager Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with attendances', () => {
    render(
      <EventAttendanceManager
        event={mockEvent as any}
        onAttendanceUpdate={mockOnAttendanceUpdate}
      />
    );

    expect(screen.getByText('Confirmação de Presenças')).toBeInTheDocument();
    
    // Check first member (pending)
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    
    // Check second member (confirmed)
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
  });

  it('renders empty message when no attendances', () => {
    render(
      <EventAttendanceManager
        event={{ ...mockEvent, attendances: [] } as any}
        onAttendanceUpdate={mockOnAttendanceUpdate}
      />
    );

    expect(
      screen.getByText('Nenhum membro registado para este evento ainda.')
    ).toBeInTheDocument();
  });

  it('calls setAttendance and updates UI on success', async () => {
    (eventService.setAttendance as jest.Mock).mockResolvedValueOnce(true);

    render(
      <EventAttendanceManager
        event={mockEvent as any}
        onAttendanceUpdate={mockOnAttendanceUpdate}
      />
    );

    // Get all 'Confirmar' buttons. The second one should be disabled since Maria is already confirmed.
    // The first one is for João.
    const confirmButtons = screen.getAllByText('Confirmar');
    expect(confirmButtons[0]).not.toBeDisabled();
    expect(confirmButtons[1]).toBeDisabled();

    await userEvent.click(confirmButtons[0]);

    // Check if the service was called correctly
    expect(eventService.setAttendance).toHaveBeenCalledWith(1, 1, 'confirmed');

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Presença de João Silva atualizada para confirmed!');
      expect(mockOnAttendanceUpdate).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error toast on failure', async () => {
    (eventService.setAttendance as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    render(
      <EventAttendanceManager
        event={mockEvent as any}
        onAttendanceUpdate={mockOnAttendanceUpdate}
      />
    );

    const declineButtons = screen.getAllByText('Recusar');
    await userEvent.click(declineButtons[0]); // Click decline for João

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar presença');
      expect(mockOnAttendanceUpdate).not.toHaveBeenCalled();
    });
  });
});
