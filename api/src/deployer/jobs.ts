import type { StacksDb } from '@db';
import { SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { getNetworkKey } from '~/constants';
import { deployWrappers } from '~/deployer/deploy';
import { logger } from '~/logger';

export function makeDeployerJob(db: StacksDb) {
  const task = new AsyncTask('wrapper-deployer', function jobHandler() {
    return deployWrappers(db)
      .catch(error => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        logger.error({ err: error }, 'Error in wrapper deployer job');
      })
      .then(() => {
        logger.debug('Finished wrapper deployer job');
      });
  });

  const networkKey = getNetworkKey();
  const minutes = networkKey === 'devnet' ? 1 : 10;
  const job = new SimpleIntervalJob({ minutes, runImmediately: true }, task);
  return job;
}
