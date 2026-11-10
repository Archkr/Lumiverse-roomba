import type { SpindleFrontendContext } from 'lumiverse-spindle-types';

const KEY = 'roomba:googly-eyes';

/** An optional costume, saved in the extension's account-scoped settings. */
export function mountGooglySettings(ctx: SpindleFrontendContext, robot: HTMLElement): () => void {
  const panel = ctx.dom.createElement('section', { class: 'lumi-roomba-settings' });
  const heading = ctx.dom.createElement('h3');
  heading.textContent = 'Roomba';
  const label = ctx.dom.createElement('label', { class: 'lumi-roomba-option' });
  const toggle = ctx.dom.createElement('input', { type: 'checkbox' });
  const copy = ctx.dom.createElement('span');
  copy.textContent = 'Googly eye mode';
  label.append(toggle, copy);
  const help = ctx.dom.createElement('p');
  help.textContent = 'Two googly eyes. Same important cleaning mission.';
  const status = ctx.dom.createElement('p', { role: 'status' });
  panel.append(heading, label, help, status);
  ctx.ui.mount('settings_extensions').append(panel);

  let disposed = false;
  let edited = false;
  let saveQueue = Promise.resolve();
  const apply = (enabled: boolean) => {
    toggle.checked = enabled;
    robot.classList.toggle('lumi-roomba-googly', enabled);
  };
  const onChange = () => {
    edited = true;
    const enabled = toggle.checked;
    apply(enabled);
    if (!ctx.settings) {
      status.textContent = 'This host keeps the choice until the extension reloads.';
      return;
    }
    status.textContent = 'Saving…';
    // Preserve the order of rapid user changes, including after a failed write.
    saveQueue = saveQueue.then(async () => {
      if (disposed) return;
      try {
        await ctx.settings!.set(KEY, enabled);
        if (!disposed && toggle.checked === enabled) status.textContent = '';
      } catch {
        if (!disposed) status.textContent = 'Could not save. Toggle again to retry.';
      }
    });
  };
  toggle.addEventListener('change', onChange);
  if (ctx.settings) {
    void ctx.settings.get<boolean>(KEY).then(value => {
      // A late initial read must never replace a user's choice.
      if (!disposed && !edited) apply(value === true);
    }).catch(() => {
      if (!disposed && !edited) status.textContent = 'Could not load your saved choice. You can still toggle the eyes.';
    });
  }
  return () => {
    disposed = true;
    toggle.removeEventListener('change', onChange);
    panel.remove();
  };
}
