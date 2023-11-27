const sessionIdUserMap = new Map();

export function setUser(id: any, user: any) {
  sessionIdUserMap.set(id, user);
}

export function getUser(id: any) {
  return sessionIdUserMap.get(id);
}
