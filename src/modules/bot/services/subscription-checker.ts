import { SubscriptionMonitorService } from '../services/subscription-monitor.service';
import logger from '../../../shared/utils/logger';

export class SubscriptionChecker {
  private subscriptionMonitorService: SubscriptionMonitorService;
  private checkInterval: NodeJS.Timeout;

  constructor(subscriptionMonitorService: SubscriptionMonitorService) {
    this.subscriptionMonitorService = subscriptionMonitorService;
  }

  start(): void {
    this.runChecks();

    this.checkInterval = setInterval(() => {
      this.runChecks();
    }, 5 * 60 * 1000); // 5 daqiqada bir marta tekshiriladi
    logger.info('Subscription checker started');
  }

  private async runChecks(): Promise<void> {
    try {
      logger.info('Running subscription checks...');

      await this.subscriptionMonitorService.checkExpiringSubscriptions();

      await this.subscriptionMonitorService.handleExpiredSubscriptions();

      logger.info('Subscription checks completed');
    } catch (error) {
      logger.error('Error running subscription checks:', error);
    }
  }
}
