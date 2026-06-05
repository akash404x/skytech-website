import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - SkyTech Technology Solutions',
  description: 'Learn about SkyTech - your trusted partner for Arduino, electronics, robotics, and IoT solutions. Discover our mission, vision, and commitment to quality technology products and services.',
  keywords: ['About SkyTech', 'Company Profile', 'Technology Solutions', 'Arduino Expert', 'Electronics Store', 'IoT Services'],
  openGraph: {
    title: 'About Us - SkyTech Technology Solutions',
    description: 'Learn about SkyTech - your trusted partner for Arduino, electronics, robotics, and IoT solutions.',
    url: '/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
