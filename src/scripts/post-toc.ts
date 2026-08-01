export class Toc {
  private wrapper: HTMLElement | null = null;
  private panel: HTMLElement | null = null;
  private toggle: HTMLElement | null = null;
  private nav: HTMLElement | null = null;
  private title: HTMLElement | null = null;

  private threshold: number = 0;
  private finalWidth: number = 240;
  private wide: boolean = false;
  private open: boolean = false;
  private bridging: boolean = false;
  private settleTimer: number = 0;

  public addToc() {
    this.wrapper = document.getElementById('toc-wrapper');
    this.panel = document.getElementById('toc-panel');
    this.toggle = document.getElementById('toc-toggle');
    this.nav = document.getElementById('toc-nav');
    this.title = document.getElementById('toc-toggle-title');

    if (!this.wrapper || !this.panel || !this.toggle || !this.nav || !this.title) return;

    this.threshold = 240;

    const clone = this.nav.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.width = 'max-content';
    clone.style.maxWidth = '14rem';
    document.body.appendChild(clone);
    this.finalWidth = clone.getBoundingClientRect().width;
    clone.remove();

    this.wide = this.wrapper.getBoundingClientRect().width > this.threshold;
    this.open = this.wide;
    this.refresh();
    this.initScrollSpy();

    this.toggle.addEventListener('click', () => {
      this.panel!.classList.add('toc-anim');
      this.open = !this.open;
      this.refresh();
    });

    this.nav.addEventListener('click', (e) => {
      if (this.wide) return;
      if ((e.target as HTMLElement).closest('a')) {
        this.panel!.classList.add('toc-anim');
        this.open = false;
        this.refresh();
      }
    });

    document.addEventListener('click', (e) => {
      if (this.wide || !this.open) return;
      if (this.panel!.contains(e.target as Node)) return;
      this.panel!.classList.add('toc-anim');
      this.open = false;
      this.refresh();
    });

    new ResizeObserver(() => {
      const wide = this.wrapper!.getBoundingClientRect().width > this.threshold;
      if (wide !== this.wide) {
        this.wide = wide;
        this.open = wide;
        this.beginBridge();
        return;
      }
      if (this.bridging && wide) {
        this.panel!.style.left =
          this.wrapper!.getBoundingClientRect().right - this.finalWidth + 'px';
      }
    }).observe(this.wrapper);
  }

  private beginBridge() {
    const panel = this.panel!;
    const rect = panel.getBoundingClientRect();
    panel.classList.add('toc-anim', 'fixed', 'z-20');
    panel.classList.remove('sticky', 'ml-auto');
    panel.style.top = rect.top + 'px';
    panel.style.left = this.wide
      ? this.wrapper!.getBoundingClientRect().right - this.finalWidth + 'px'
      : '16px'; // matches left-4
    this.bridging = true;
    this.refresh();
    window.clearTimeout(this.settleTimer);
    this.settleTimer = window.setTimeout(() => this.settleBridge(), 350);
  }

  private settleBridge() {
    this.bridging = false;
    const panel = this.panel!;
    panel.style.left = '';
    panel.style.top = '';
    this.refresh();
  }

  private initScrollSpy() {
    const headingEls = Array.from(
      document.querySelectorAll<HTMLElement>(
        '#content-container h1[id], #content-container h2[id], #content-container h3[id], #content-container h4[id], #content-container h5[id], #content-container h6[id]'
      )
    );
    if (headingEls.length === 0) return;

    const links = new Map<string, HTMLElement>();
    this.nav!.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
      links.set(a.getAttribute('href')!.slice(1), a);
    });

    const HEADER_OFFSET = 72;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = links.get(entry.target.id);
          if (!link) return;
          link.classList.toggle(
            'toc-read',
            !entry.isIntersecting && entry.boundingClientRect.top <= HEADER_OFFSET
          );
        });
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`, threshold: 0 }
    );
    headingEls.forEach((h) => observer.observe(h));
  }

  private refresh() {
    const { panel, nav, title, toggle } = this;
    if (!panel || !nav || !title || !toggle) return;

    if (!this.bridging) {
      if (this.wide) {
        panel.classList.remove('fixed', 'left-4', 'z-20');
        panel.classList.add('sticky', 'ml-auto');
      } else {
        panel.classList.remove('sticky', 'ml-auto');
        panel.classList.add('fixed', 'left-4', 'z-20');
      }
    }

    panel.classList.toggle('toc-open', this.open);
    title.classList.toggle('hidden', !this.open);
    toggle.setAttribute('aria-expanded', String(this.open));
  }
}
