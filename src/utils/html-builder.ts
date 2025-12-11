import type { Language } from "../types";

export function createLanguageItemElement(language: Language): HTMLElement {
  const item = document.createElement('div');
  item.className = 'language-item';
  item.dataset.lang = language.name;

  const nameAndPercent = document.createElement('div');
  nameAndPercent.className = 'flex justify-between text-sm mb-1';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'text-gray-700 dark:text-gray-300';
  nameSpan.textContent = language.name;

  const percentSpan = document.createElement('span');
  percentSpan.className = 'text-gray-500 dark:text-gray-400 lang-percent';
  percentSpan.textContent = '0.00%';
  
  nameAndPercent.append(nameSpan, percentSpan);

  const progressBarContainer = document.createElement('div');
  progressBarContainer.className = 'w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2';

  const progressBar = document.createElement('div');
  progressBar.className = 'bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full progress-bar';
  progressBar.style.width = '0%';
  
  progressBarContainer.appendChild(progressBar);
  
  item.append(nameAndPercent, progressBarContainer);

  return item;
}

export function buildLanguageStatsHtml(languages: Language[]): string {
  if (!languages || languages.length === 0) {
    return `
      <div class="text-center py-4 text-gray-500 dark:text-gray-400">
        <p>No language data available</p>
      </div>
    `;
  }

  return `
    <div>
      <h4 class="font-medium text-gray-900 dark:text-white mb-2">Language Usage</h4>
      <div class="space-y-2" id="language-stats-list">
        ${languages.slice(0, 5).map(lang => `
          <div class="language-item" data-lang="${lang.name}">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-700 dark:text-gray-300">${lang.name}</span>
              <span class="text-gray-500 dark:text-gray-400 lang-percent">0.00%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                class="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full progress-bar"
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
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
        <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400" id="contributions-count">0</p>
        <p class="text-sm text-gray-600 dark:text-gray-300">Contributions</p>
      </div>
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
        <p class="text-2xl font-bold text-green-600 dark:text-green-400" id="repositories-count">0</p>
        <p class="text-sm text-gray-600 dark:text-gray-300">Total Repositories</p>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="text-center p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <p class="text-xl font-bold text-blue-600 dark:text-blue-300" id="stars-count">0</p>
        <p class="text-xs text-gray-600 dark:text-gray-300">Stars</p>
      </div>
      <div class="text-center p-2 bg-purple-50 dark:bg-purple-900 rounded-lg">
        <p class="text-xl font-bold text-purple-600 dark:text-purple-300" id="prs-count">0</p>
        <p class="text-xs text-gray-600 dark:text-gray-300">PRs</p>
      </div>
      <div class="text-center p-2 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
        <p class="text-xl font-bold text-yellow-600 dark:text-yellow-300" id="issues-count">0</p>
        <p class="text-xs text-gray-600 dark:text-gray-300">Issues</p>
      </div>
    </div>

    <div class="flex flex-wrap justify-evenly mb-4">
      <div class="repo-toggle-container">
        <div id="personal-summary" class="cursor-pointer bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm flex items-center">
          <div id="personal-label" class="pl-3 py-1">
            <span>Personal:</span>
          </div>
          <div id="personal-public-toggle" class="personal-details cursor-pointer bg-blue-50 dark:bg-blue-800 text-blue-700 dark:text-blue-100 rounded-md px-3 py-1 text-sm inline-block">
            Public: <span id="personal-public-repos">0</span>
          </div>
          <div id="personal-repos-total" class="px-2">0</div>
          <div id="personal-private-toggle" class="personal-details cursor-pointer bg-blue-50 dark:bg-blue-800 text-blue-700 dark:text-blue-100 rounded-md px-3 py-1 text-sm inline-block">
            Private: <span id="personal-private-repos">0</span>
          </div>
        </div>
      </div>

      <div class="repo-toggle-container">
        <div id="collaborator-summary" class=" rounded-full inline-block">
          <div id="collaborator-summary" class="cursor-pointer bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md text-sm flex items-center">
            <div id="collaborator-label" class="pl-3 py-1">
              <span id="collaborator-label">Collaborator:</span>
            </div>
            <div id="collaborator-public-toggle" class="collaborator-details cursor-pointer bg-green-50 dark:bg-green-800 text-green-700 dark:text-green-100 rounded-md px-3 py-1 text-sm inline-block">
              Public: <span id="collaborator-public-repos">0</span>
            </div>
            <div id="collaborator-repos-total" class="px-2">0</div>
            <div id="collaborator-private-toggle" class="collaborator-details cursor-pointer bg-green-50 dark:bg-green-800 text-green-700 dark:text-green-100 rounded-md px-3 py-1 text-sm inline-block">
              Private: <span id="collaborator-private-repos">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="language-stats-section"></div>
    
    <div class="mt-4 text-center">
      <a
        href="https://github.com/${githubUsername}"
        target="_blank"
        class="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
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
      <p class="text-red-600 dark:text-red-400">Failed to load GitHub statistics</p>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">The stats will be available when the API is accessible</p>
      <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">Error: ${(error as Error).message}</p>
    </div>
  `;
}