/** Schedule noncritical enhancements after load and yield to user input. */
export function afterLoadIdle(callback: () => void, timeout = 1800) {
  let cancelled = false;
  let idleId: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const run = () => {
    if ('requestIdleCallback' in window)
      idleId = window.requestIdleCallback(
        () => {
          if (!cancelled) callback();
        },
        { timeout },
      );
    else
      timer = setTimeout(() => {
        if (!cancelled) callback();
      }, 150);
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', run);
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    if (timer !== undefined) clearTimeout(timer);
  };
}
