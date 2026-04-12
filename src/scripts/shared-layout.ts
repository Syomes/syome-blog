import addCodeHeader from './code-header';

function decodeHTML(html: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

document.addEventListener("DOMContentLoaded", function () {
  const loader = document.querySelector(".page-loader");
  const content = document.querySelector(".page-content");

  document.querySelectorAll("img[alt]").forEach((img) => {
    const image = img as HTMLImageElement;
    const figure = document.createElement("figure");
    const figcaption = document.createElement("figcaption");
    figcaption.classList.add("text-center");
    figcaption.innerHTML = decodeHTML(image.alt);

    const newImage = image.cloneNode(true) as HTMLImageElement;

    newImage.style.maxHeight = '512px';
    newImage.style.width = 'auto';
    newImage.classList.add('mx-auto');

    figure.appendChild(newImage);
    figure.appendChild(figcaption);
    figure.classList.add('mx-auto');

    if (img.parentNode) {
      img.parentNode.replaceChild(figure, img);
    }
  });

  document.querySelectorAll("a[href]").forEach((link) => {
    const anchor = link as HTMLAnchorElement;
    if (anchor.href.startsWith("http") && !anchor.href.includes(window.location.hostname)) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }

    if (anchor.hash && anchor.hash.startsWith('#')) {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.hash.substring(1);
        const targetElement = document.getElementById(targetId) as HTMLHeadingElement;
        if (targetElement) {
          e.preventDefault();
          window.history.pushState(null, '', anchor.hash);

          const previousScrollTop = window.scrollY;
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          waitForScrollEnd(() => {
            highlightHeading(targetElement);
            showBackToPreviousButton(previousScrollTop);
          });
        }
      });
    }
  });

  function waitForScrollEnd(callback: () => void) {
    let scrollEndTimer: number;
    const handler = () => {
      clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(() => {
        window.removeEventListener('scroll', handler);
        callback();
      }, 100);
    };
    window.addEventListener('scroll', handler);
  }

  function highlightHeading(element: HTMLHeadingElement) {
    element.classList.remove('heading-highlight');
    void element.offsetWidth;
    element.classList.add('heading-highlight');

    setTimeout(() => {
      element.classList.remove('heading-highlight');
    }, 1000);
  }

  let currentBackScrollTop: number | null = null;

  function showBackToPreviousButton(previousScrollTop: number) {
    const existing = document.getElementById('back-to-previous-btn');
    if (existing && !existing.classList.contains('opacity-0')) {
      currentBackScrollTop = previousScrollTop;
      return;
    }

    const wrapper = document.getElementById('wrapper');
    if (!wrapper) return;

    const innerContainer = wrapper.querySelector('div');
    if (!innerContainer) return;

    currentBackScrollTop = previousScrollTop;
    const button = document.createElement('button');
    button.id = 'back-to-previous-btn';
    button.title = 'Drag and flick to dismiss';
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    `;
    button.className = 'absolute top-0 right-5 w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-white/50 dark:hover:bg-gray-800/50 shadow-lg transition duration-300 opacity-0 pointer-events-auto cursor-pointer active:cursor-grabbing';
    let isDragging = false;
    let preventClick = false;
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;
    let positionHistory: { x: number; y: number; time: number }[] = [];
    const VELOCITY_THRESHOLD = 0.5;

    button.addEventListener('click', (e) => {
      if (preventClick) {
        e.stopPropagation();
        preventClick = false;
        return;
      }
      if (!isDragging) {
        hideButton();
        if (currentBackScrollTop !== null) {
          window.scrollTo({ top: currentBackScrollTop, behavior: 'smooth' });
        }
      }
    });

    function onStart(e: MouseEvent | TouchEvent) {
      isDragging = false;
      const point = 'touches' in e ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      positionHistory = [{ x: startX, y: startY, time: Date.now() }];
      button.style.transition = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    }

    function onMove(e: MouseEvent | TouchEvent) {
      const point = 'touches' in e ? e.touches[0] : e;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDragging = true;
      }

      if (isDragging) {
        e.preventDefault();
        currentX = dx;
        currentY = dy;
        button.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.1}deg)`;
        positionHistory.push({ x: point.clientX, y: point.clientY, time: Date.now() });
        const cutoff = Date.now() - 50;
        positionHistory = positionHistory.filter(p => p.time >= cutoff);
      }
    }

    function onEnd() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);

      if (!isDragging) return;

      if (positionHistory.length >= 2) {
        const len = positionHistory.length;
        const first = positionHistory[len - 2];
        const last = positionHistory[len - 1];
        const dt = last.time - first.time;

        if (dt > 0) {
          const dx = last.x - first.x;
          const dy = last.y - first.y;
          const velocity = Math.sqrt(dx * dx + dy * dy) / dt;

          if (velocity > VELOCITY_THRESHOLD) {
            const angle = Math.atan2(dy, dx);
            const flyX = Math.cos(angle) * 500;
            const flyY = Math.sin(angle) * 500;
            const rotate = dx > 0 ? 720 : -720;
            button.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease';
            button.style.transform = `translate(${currentX + flyX}px, ${currentY + flyY}px) rotate(${rotate}deg)`;
            button.style.opacity = '0';
            setTimeout(() => {
              button.remove();
            }, 400);
            return;
          }
        }
      }

      preventClick = true;
      button.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      button.style.transform = 'translate(0, 0) rotate(0deg)';
      isDragging = false;
    }

    button.addEventListener('mousedown', onStart);
    button.addEventListener('touchstart', onStart, { passive: true });

    innerContainer.appendChild(button);

    void button.offsetWidth;
    requestAnimationFrame(() => {
      button.classList.remove('opacity-0');
      button.classList.add('opacity-100');
    });

    function hideButton() {
      button.classList.remove('opacity-100');
      button.classList.add('opacity-0');
      setTimeout(() => {
        button.remove();
      }, 300);
    }
  }

  addCodeHeader();

  setTimeout(() => {
    if (loader) {
      loader.classList.add("hidden");
    }
    if (content) {
      requestAnimationFrame(() => {
        content.classList.add("fade-in");
      });
    }
  }, 1000);
});