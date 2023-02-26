import { appRouter } from '~/routes/trpc';

const procedures = [
  appRouter.getAddressNames,
  appRouter.getDisplayName,
  appRouter.getNameDetails,
  appRouter.zonefiles.allNostr,
] as const;

for (const proc of procedures) {
  console.log(proc);
}
