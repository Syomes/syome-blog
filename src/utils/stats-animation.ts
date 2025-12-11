function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

export function animateNumber(
  element: HTMLElement | null, 
  target: number, 
  decimals: number = 0, 
  duration: number = 1000, 
  isPercentage: boolean = false,
  startFrom: number = 0
): void {
  if (!element) {
    console.warn('Element not found for animation');
    return;
  }

  if (isNaN(target) || target === undefined || target === null) {
    target = 0;
  }

  const initialValue = isNaN(startFrom) ? 0 : startFrom;
  const diff = target - initialValue;

  if (diff === 0 && initialValue === 0) {
    element.textContent = isPercentage ? '0.00%' : '0';
    return;
  }
  
  if (diff === 0) {
    return;
  }

  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const current = initialValue + (diff * easedProgress);

    if (progress < 1) {
      const displayValue = Math.max(0, current);
      const formattedNumber = Number(displayValue).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      element.textContent = isPercentage ? formattedNumber + '%' : formattedNumber;
      requestAnimationFrame(animate);
    } else {
      const displayValue = Math.max(0, target);
      const formattedNumber = Number(displayValue).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      element.textContent = isPercentage ? formattedNumber + '%' : formattedNumber;
    }
  };

  requestAnimationFrame(animate);
}

export function animateProgressBar(
  element: HTMLElement | null, 
  targetWidth: number, 
  duration: number = 1000,
  startFrom: number = 0
): void {
  if (!element) {
    console.warn('Progress bar element not found for animation');
    return;
  }

  if (isNaN(targetWidth) || targetWidth === undefined || targetWidth === null) {
    targetWidth = 0;
  }

  const initialWidth = isNaN(startFrom) ? 0 : startFrom;
  const diff = targetWidth - initialWidth;

  if (diff === 0 && initialWidth === 0) {
    element.style.width = '0%';
    return;
  }

  if (diff === 0) {
    return;
  }

  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const currentWidth = initialWidth + (diff * easedProgress);

    if (progress < 1) {
      element.style.width = currentWidth + '%';
      requestAnimationFrame(animate);
    } else {
      element.style.width = targetWidth + '%';
    }
  };

  requestAnimationFrame(animate);
}

export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
  const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

  return (
    rect.top <= windowHeight * 0.7 &&
    rect.left <= windowWidth * 0.7 &&
    rect.bottom >= windowHeight * 0.3 &&
    rect.right >= windowWidth * 0.3
  );
}