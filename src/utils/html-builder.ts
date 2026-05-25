import type { Language } from "../types";

export function createLanguageItemElement(language: Language): HTMLElement {
  const item = document.createElement('div');
  item.className = 'language-item';
  item.dataset.lang = language.name;

  const nameAndPercent = document.createElement('div');
  nameAndPercent.className = 'flex justify-between text-sm mb-1';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'text-tips';
  nameSpan.textContent = language.name;

  const percentSpan = document.createElement('span');
  percentSpan.className = 'text-tips lang-percent';
  percentSpan.textContent = '0.00%';

  nameAndPercent.append(nameSpan, percentSpan);

  const progressBarContainer = document.createElement('div');
  progressBarContainer.id = "github-stats-progress-bar-container";
  progressBarContainer.className = 'w-full rounded-full h-2';

  const progressBar = document.createElement('div');
  progressBar.id = 'github-stats-progress-bar';
  progressBar.className = 'h-2 rounded-full progress-bar';
  progressBar.style.width = '0%';

  progressBarContainer.appendChild(progressBar);

  item.append(nameAndPercent, progressBarContainer);

  return item;
}

export function buildLanguageStatsHtml(languages: Language[]): string {
  if (!languages || languages.length === 0) {
    return `
      <div class="text-tips text-center py-4">
        <p>No language data available</p>
      </div>
    `;
  }

  return `
    <div>
      <h4 class="text-main font-medium mb-2">Language Usage</h4>
      <div class="space-y-2" id="language-stats-list">
        ${languages.slice(0, 5).map(lang => `
          <div class="language-item" data-lang="${lang.name}">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-tips">${lang.name}</span>
              <span class="text-tips lang-percent">0.00%</span>
            </div>
            <div id="github-stats-progress-bar-container" class="w-full rounded-full h-2">
              <div
                id="github-stats-progress-bar"
                class="h-2 rounded-full progress-bar"
                style="width: 0%"
              ></div>
            </div>
          </div>
        `).join('')}
      </div>
      <div id="language-toggle-container" class="mt-4"></div>
    </div>
  `;
}

export function buildStatsContent(githubUsername: string): string {
  return `
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="github-stats-total-container text-center p-3 rounded-lg">
        <p id="github-stats-contributions-count" class="text-2xl font-bold">0</p>
        <p class="text-tips text-sm">Contributions</p>
      </div>
      <div class="github-stats-total-container text-center p-3 rounded-lg">
        <p id="github-stats-repositories-count" class="text-2xl font-bold">0</p>
        <p class="text-tips text-sm">Total Repositories</p>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-4">
      <div id="github-stats-stars-container" class="text-center p-2 rounded-lg">
        <p id="github-stats-stars-count" class="text-xl font-bold">0</p>
        <p class="text-tips text-xs">Stars</p>
      </div>
      <div id="github-stats-prs-container" class="text-center p-2 rounded-lg">
        <p id="github-stats-prs-count" class="text-xl font-bold">0</p>
        <p class="text-tips text-xs">PRs</p>
      </div>
      <div id="github-stats-issues-container" class="text-center p-2 rounded-lg">
        <p id="github-stats-issues-count" class="text-xl font-bold">0</p>
        <p class="text-tips text-xs">Issues</p>
      </div>
    </div>

    <div class="flex flex-wrap justify-evenly mb-4">
      <div class="repo-toggle-container">
        <div id="github-stats-personal-summary" class="cursor-pointer rounded-md text-sm flex items-center">
          <div id="personal-label" class="pl-3 py-1">
            <span>Personal:</span>
          </div>
          <div id="github-stats-personal-public-toggle" class="personal-details cursor-pointer rounded-md px-3 py-1 text-sm inline-block hidden">
            Public: <span id="personal-public-repos">0</span>
          </div>
          <div id="personal-repos-total" class="px-2">0</div>
          <div id="github-stats-personal-private-toggle" class="personal-details cursor-pointer rounded-md px-3 py-1 text-sm inline-block hidden">
            Private: <span id="personal-private-repos">0</span>
          </div>
        </div>
      </div>

      <div class="repo-toggle-container">
        <div id="github-stats-collaborator-summary" class="cursor-pointer rounded-md text-sm flex items-center">
          <div id="collaborator-label" class="pl-3 py-1">
            <span>Collaborator:</span>
          </div>
          <div id="github-stats-collaborator-public-toggle" class="collaborator-details cursor-pointer rounded-md px-3 py-1 text-sm inline-block hidden">
            Public: <span id="collaborator-public-repos">0</span>
          </div>
          <div id="collaborator-repos-total" class="px-2">0</div>
          <div id="github-stats-collaborator-private-toggle" class="collaborator-details cursor-pointer rounded-md px-3 py-1 text-sm inline-block hidden">
            Private: <span id="collaborator-private-repos">0</span>
          </div>
        </div>
      </div>
    </div>

    <div id="language-stats-section"></div>
    
    <div class="mt-4 text-center">
      <a
        href="https://github.com/${githubUsername}"
        target="_blank"
        class="text-link-interactive inline-flex items-center font-medium"
      >
        View on GitHub
        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
        </svg>
      </a>
    </div>
  `;
}

export function buildErrorContent(error: unknown) {
  return `
    <div class="text-center py-8">
      <p class="text-error">Failed to load GitHub statistics</p>
      <p class="text-tips text-sm mt-2">The stats will be available when the API is accessible</p>
      <p class="text-micro-tips text-xs mt-2">Error: ${(error as Error).message}</p>
    </div>
  `;
}