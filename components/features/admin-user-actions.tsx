// Client component with actions for an admin to manage a user
// components/features/admin-user-actions.tsx

'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, UserStatus } from '@prisma/client';

type Props = {
  user: User;
};

export const AdminUserActions = ({ user }: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  // prevent admin from communicate with its account
  if (session?.user?.id === user.id) {
    return <span className="text-xs text-gray-400">Đây là bạn</span>;
  }

  const handleToggleLock = () => {
    const newStatus = user.status === 'ACTIVE' ? UserStatus.LOCKED : UserStatus.ACTIVE;
    const actionText = newStatus === 'LOCKED' ? 'khóa' : 'mở khóa';

    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản ${user.name}?`)) {
      startTransition(async () => {
        try {
          await axios.patch(`/api/admin/users/${user.id}`, { status: newStatus });
          toast.success(`Đã ${actionText} tài khoản.`);
          router.refresh();
        } catch (error) {
          toast.error(`Thao tác thất bại: ${error}`);
        }
      });
    }
  };

  return (
    <button
      onClick={handleToggleLock}
      disabled={isPending}
      className={`text-xs font-medium disabled:opacity-50 ${user.status === 'ACTIVE'
        ? 'text-red-600 hover:text-red-900'
        : 'text-green-600 hover:text-green-900'
        }`}
    >
      {isPending ? 'Đang xử lý...' : user.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
    </button>
  );
};