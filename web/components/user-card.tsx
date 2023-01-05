import { useAccount } from '@micro-stacks/react';

export const UserCard = () => {
  const { stxAddress } = useAccount();
  if (!stxAddress) return <h2>No active session</h2>;
  return <h2>{stxAddress}</h2>;
};
