import { seedVideos } from './seedVideos';

// Run the seeding
(async () => {
  console.log('Starting to seed videos...');
  await seedVideos();
  console.log('Seeding complete!');
  process.exit(0);
})(); 