import Link from 'next/link';
import { Member, Role, Section } from '@/types/database';
import { User, Mail, Phone, Calendar, Users, Briefcase } from 'lucide-react';

interface MemberCardProps {
  member: Member;
  role?: Role;
  section?: Section;
  showLink?: boolean;
}

export default function MemberCard({ member, role, section, showLink = true }: MemberCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'alumni':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'alumni':
        return 'Alumni';
      default:
        return status;
    }
  };

  const content = (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5" /> {member.name}
        </h3>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            member.status
          )}`}
        >
          {getStatusLabel(member.status)}
        </span>
      </div>

      {member.email && (
        <p className="text-gray-700 flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" /> {member.email}
        </p>
      )}
      {member.phone && (
        <p className="text-gray-700 flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-500" /> {member.phone}
        </p>
      )}
      {member.joining_date && (
        <p className="text-gray-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" /> Membro desde:{' '}
          {new Date(member.joining_date).toLocaleDateString('pt-PT')}
        </p>
      )}
      {(role || section) && (
        <p className="text-gray-700 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-500" />
          {role?.name || 'N/A'} / {section?.name || 'N/A'}
        </p>
      )}
      {member.bio && (
        <p className="text-gray-600 text-sm mt-2 line-clamp-3">{member.bio}</p>
      )}
    </div>
  );

  return showLink ? (
    <Link href={`/members/${member.id}`} className="block hover:shadow-lg transition-shadow">
      {content}
    </Link>
  ) : (
    content
  );
}
