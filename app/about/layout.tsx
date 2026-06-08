import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Sky Tech Technology Solutions',
  description: 'Learn about Sky Tech - your trusted partner for Arduino, electronics, robotics, and IoT solutions. Discover our mission, vision, and commitment to quality technology products and services.',
  keywords: ['About Sky Tech', 'Company Profile', 'Technology Solutions', 'Arduino Expert', 'Electronics Store', 'IoT Services'],
  openGraph: {
    title: 'About Us - Sky Tech Technology Solutions',
    description: 'Learn about Sky Tech - your trusted partner for Arduino, electronics, robotics, and IoT solutions.',
    url: 'https://www.theskytechnology.in/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
