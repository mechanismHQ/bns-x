export const nameWrapperCode = `$$CODE$$` as const;

export const oldNameWrappers = [`$$OLD_CODE$$`] as const;

export const nameWrappers = [nameWrapperCode, ...oldNameWrappers] as const;
