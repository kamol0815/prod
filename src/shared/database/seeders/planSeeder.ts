import logger from '../../utils/logger';
import { Plan } from '../models/plans.model';

export async function seedBasicPlan(): Promise<void> {
  try {
    // Seed Yulduzlar bashorati plan
    const existingPlan = await Plan.findOne({ name: 'Munajjim premium' });
    if (!existingPlan) {
      await Plan.create({
        name: 'Munajjim premium',
        selectedName: 'yulduz',
        price: 5555,
        duration: 30,
      });
      logger.info('Munajjim premium plan seeded successfully');
    }

    // Seed Basic plan (for backwards compatibility)
    const existingBasicPlan = await Plan.findOne({ name: 'Basic' });
    if (!existingBasicPlan) {
      await Plan.create({
        name: 'Basic',
        selectedName: 'basic',
        price: 5555,
        duration: 30,
      });
      logger.info('Basic plan seeded successfully');
    }

    logger.info('Plans already exists');
  } catch (error) {
    logger.error('Error seeding basic plan:', error);
    throw error;
  }
}
