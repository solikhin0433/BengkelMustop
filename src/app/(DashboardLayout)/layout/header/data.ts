
import { IconUser, IconMail, IconListCheck, IconProps, Icon } from '@tabler/icons-react';

//  Profile Data
interface ProfileType {
  title: string;
  img: string;
  subtitle: string;
  url: string;
  icon: string
}


const profileDD: ProfileType[] = [
  {
    img: "/images/svgs/icon-account.svg",
    title: "Profil Bengkel",
    subtitle: "Pengaturan & Info Bengkel",
    icon: "tabler:settings",
    url: "/admin/settings",
  },
  {
    img: "/images/svgs/icon-tasks.svg",
    title: "Lihat Website",
    subtitle: "Landing Page Publik",
    icon: "tabler:world",
    url: "/",
  },
];

const Notifications = [
  {
    avatar: '/images/profile/user-1.jpg',
    title: 'Roman Joined the Team!',
    subtitle: 'Congratulate him',
  },
  {
    avatar: '/images/profile/user-2.jpg',
    title: 'New message',
    subtitle: 'Salma sent you new message',
  },
  {
    avatar: '/images/profile/user-3.jpg',
    title: 'Bianca sent payment',
    subtitle: 'Check your earnings',
  },
  {
    avatar: '/images/profile/user-4.jpg',
    title: 'Jolly completed tasks',
    subtitle: 'Assign her new tasks',
  },
  {
    avatar: '/images/profile/user-5.jpg',
    title: 'John received payment',
    subtitle: '$230 deducted from account',
  },
];

export {
  Notifications,
  profileDD,
};
