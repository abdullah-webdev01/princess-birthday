import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Countdown from '../components/Countdown';
import Story from '../components/Story';
import VideoSection from '../components/VideoSection';
import WishesWall from '../components/WishesWall';
import CelebrationSection from '../components/CelebrationSection';
import MemoryGallery from '../components/MemoryGallery';

export default function Home() {
  return (
    <Layout>
      <Hero />
      <Countdown />
      <Story />
      <VideoSection />
      <WishesWall />
      <CelebrationSection />   {/* <-- Yeh line zaroor honi chahiye */}
      <MemoryGallery />
    </Layout>
  );
}