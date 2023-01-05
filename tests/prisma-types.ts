export type Name = {
  id: number;
  nftId: number;
  name: string;
  namespace: string;
  ownerId: number;
  zonefile: string | null;
  zonefileHash: string;
};

export type Account = {
  id: number;
  principal: string;
  primaryNameId: number | null;
};

export type Wrapper = {
  id: number;
  nameId: number;
  principal: string;
};
