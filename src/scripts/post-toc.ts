export class Toc {
  private wrapper: HTMLElement | null = null;
  private panel: HTMLElement | null = null;
  private toggle: HTMLElement | null = null;
  private nav: HTMLElement | null = null;
  private title: HTMLElement | null = null;

  private threshold: number = 0;
  private wide: boolean = false;
  private open: boolean = false;

  public addToc() {
    this.wrapper = document.getElementById('toc-wrapper');
    this.panel = document.getElementById('toc-panel');
    this.toggle = document.getElementById('toc-toggle');
    this.nav = document.getElementById('toc-nav');
    this.title = document.getElementById('toc-toggle-title');

    if (!this.wrapper || !this.panel || !this.toggle || !this.nav || !this.title) return;

    this.panel.classList.add('toc-open');
    this.threshold = this.nav.getBoundingClientRect().width;
    this.panel.classList.remove('toc-open');

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
      if (wide === this.wide) return;
      this.wide = wide;
      this.open = wide;
      this.refresh();
    }).observe(this.wrapper);
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
          link.classList.toggle('toc-read', !entry.isIntersecting);
        });
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px 9999px 0px`, threshold: 0 }
    );
    headingEls.forEach((h) => observer.observe(h));
  }

  private refresh() {
    const { panel, nav, title, toggle } = this;
    if (!panel || !nav || !title || !toggle) return;

    if (this.wide) {
      panel.classList.remove('fixed', 'left-4', 'z-20');
      panel.classList.add('sticky', 'ml-auto');
    } else {
      panel.classList.remove('sticky', 'ml-auto');
      panel.classList.add('fixed', 'left-4', 'z-20');
    }

    panel.classList.toggle('toc-open', this.open);
    title.classList.toggle('hidden', !this.open);
    toggle.setAttribute('aria-expanded', String(this.open));
  }
}
