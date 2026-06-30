type Listener = () => void;
const listeners: Listener[] = [];

export function openLoginModal() {
  listeners.forEach((cb) => cb());
}

export function subscribeLoginModal(cb: Listener): () => void {
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i > -1) listeners.splice(i, 1);
  };
}
