import type { GitHubStats, Language } from "../types";
import { animateNumber, animateProgressBar, isInViewport } from "./stats-animation";
import { buildStatsContent, buildErrorContent, buildLanguageStatsHtml, createLanguageItemElement } from "./html-builder";
import autoAnimate from "@formkit/auto-animate";

const GITHUB_USERNAME = import.meta.env.PUBLIC_GITHUB_USERNAME;

async function fetchGitHubStats(): Promise<GitHubStats> {
  const response = await fetch('/api/github-stats');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

type CurrentFilter = {
  category: 'overall' | 'personal' | 'collaborator';
  visibility: 'public' | 'private' | 'total';
};

let currentActiveFilter: CurrentFilter = { category: 'overall', visibility: 'total' };
let isLangStatsExpanded = false;
let fullLanguageList: Language[] = [];

function updateLanguageToggle(container: HTMLElement, listElement: HTMLElement, languages: Language[]) {
  container.innerHTML = '';
  if (languages.length > 5) {
    const remainingCount = languages.length - 5;
    const button = document.createElement('button');
    button.className = 'text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 flex items-center justify-between w-full py-2 mt-2';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = isLangStatsExpanded ? 'Collapse' : `Show ${remainingCount} more languages`;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'w-4 h-4 transition-transform duration-300');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>`;
    svg.style.transform = isLangStatsExpanded ? 'rotate(180deg)' : 'rotate(0deg)';

    button.append(textSpan, svg);
    container.appendChild(button);

    button.addEventListener('click', () => {
      isLangStatsExpanded = !isLangStatsExpanded;
      updateLanguageDisplay(listElement, languages);
      updateLanguageToggle(container, listElement, languages);
    });
  }
}

function updateLanguageDisplay(listElement: HTMLElement, languages: Language[]) {
  const languagesToShow = isLangStatsExpanded ? languages : languages.slice(0, 5);
  const existingElements = new Map<string, HTMLElement>();
  listElement.querySelectorAll<HTMLElement>('.language-item').forEach(el => {
    if (el.dataset.lang) {
      existingElements.set(el.dataset.lang, el);
    }
  });

  const newElementList: HTMLElement[] = [];

  languagesToShow.forEach(lang => {
    let itemElement = existingElements.get(lang.name);
    if (itemElement) {
      const percentEl = itemElement.querySelector<HTMLElement>('.lang-percent');
      const progressBarEl = itemElement.querySelector<HTMLElement>('.progress-bar');
      const oldPercent = parseFloat(percentEl?.textContent || '0');
      const oldWidth = parseFloat(progressBarEl?.style.width || '0');

      if (percentEl) animateNumber(percentEl, lang.percentage, 2, 1000, true, oldPercent);
      if (progressBarEl) animateProgressBar(progressBarEl, lang.percentage, 1000, oldWidth);
      
      existingElements.delete(lang.name);
    } else {
      itemElement = createLanguageItemElement(lang);
      const percentEl = itemElement.querySelector<HTMLElement>('.lang-percent');
      const progressBarEl = itemElement.querySelector<HTMLElement>('.progress-bar');
      if (percentEl) animateNumber(percentEl, lang.percentage, 2, 1000, true);
      if (progressBarEl) animateProgressBar(progressBarEl, lang.percentage);
    }
    newElementList.push(itemElement);
  });

  listElement.replaceChildren(...newElementList);
}


function initFixedAnimations(githubStats: GitHubStats) {
  animateNumber(document.getElementById('contributions-count'), githubStats.contributions || 0, 0);
  animateNumber(document.getElementById('repositories-count'), githubStats.repositories.overall || 0, 0);
  animateNumber(document.getElementById('prs-count'), githubStats.pullRequests.overall || 0, 0);
  animateNumber(document.getElementById('issues-count'), githubStats.issues.overall || 0, 0);

  animateNumber(document.getElementById('personal-repos-total'), githubStats.repositories.personal.total || 0, 0);
  animateNumber(document.getElementById('collaborator-repos-total'), githubStats.repositories.collaborator.total || 0, 0);
  
  animateNumber(document.getElementById('personal-public-repos'), githubStats.repositories.personal.public || 0, 0);
  animateNumber(document.getElementById('personal-private-repos'), githubStats.repositories.personal.private || 0, 0);
  
  animateNumber(document.getElementById('collaborator-public-repos'), githubStats.repositories.collaborator.public || 0, 0);
  animateNumber(document.getElementById('collaborator-private-repos'), githubStats.repositories.collaborator.private || 0, 0);
}

function updateDisplayedStats(githubStats: GitHubStats, filter: CurrentFilter) {
  currentActiveFilter = filter;
  isLangStatsExpanded = false;

  const starsCountElement = document.getElementById('stars-count');
  const currentStars = parseFloat(starsCountElement?.textContent?.replace(/,/g, '') || '0');
  let newStarsCount = 0;
  if (filter.category === 'overall') {
    newStarsCount = githubStats.stars.overall || 0;
  } else {
    const categoryData = githubStats.stars[filter.category];
    if (categoryData) {
      if (filter.visibility === 'public') newStarsCount = categoryData.public || 0;
      else if (filter.visibility === 'private') newStarsCount = categoryData.private || 0;
      else newStarsCount = categoryData.total || 0;
    }
  }
  animateNumber(starsCountElement, newStarsCount, 0, 1000, false, currentStars);

  const prsCountElement = document.getElementById('prs-count');
  const currentPrs = parseFloat(prsCountElement?.textContent?.replace(/,/g, '') || '0');
  let newPrsCount = 0;
  if (filter.category === 'overall') {
    newPrsCount = githubStats.pullRequests.overall || 0;
  } else {
    const categoryData = githubStats.pullRequests[filter.category];
    if (categoryData) {
      if (filter.visibility === 'public') newPrsCount = categoryData.public || 0;
      else if (filter.visibility === 'private') newPrsCount = categoryData.private || 0;
      else newPrsCount = categoryData.total || 0;
    }
  }
  animateNumber(prsCountElement, newPrsCount, 0, 1000, false, currentPrs);

  const issuesCountElement = document.getElementById('issues-count');
  const currentIssues = parseFloat(issuesCountElement?.textContent?.replace(/,/g, '') || '0');
  let newIssuesCount = 0;
  if (filter.category === 'overall') {
    newIssuesCount = githubStats.issues.overall || 0;
  } else {
    const categoryData = githubStats.issues[filter.category];
    if (categoryData) {
      if (filter.visibility === 'public') newIssuesCount = categoryData.public || 0;
      else if (filter.visibility === 'private') newIssuesCount = categoryData.private || 0;
      else newIssuesCount = categoryData.total || 0;
    }
  }
  animateNumber(issuesCountElement, newIssuesCount, 0, 1000, false, currentIssues);

  const languageSectionElement = document.getElementById('language-stats-section');
  if (filter.category === 'overall') {
    fullLanguageList = githubStats.languages.overall || [];
  } else {
    const categoryData = githubStats.languages[filter.category];
    if (categoryData) {
      if (filter.visibility === 'public') fullLanguageList = categoryData.public || [];
      else if (filter.visibility === 'private') fullLanguageList = categoryData.private || [];
      else fullLanguageList = categoryData.total || [];
    }
  }

  if (languageSectionElement) {
    const langList = document.getElementById('language-stats-list');
    const toggleContainer = document.getElementById('language-toggle-container');
    if (langList && toggleContainer) {
      updateLanguageDisplay(langList, fullLanguageList);
      updateLanguageToggle(toggleContainer, langList, fullLanguageList);
    }
  }

  const personalLabel = document.getElementById('personal-label');
  const collaboratorLabel = document.getElementById('collaborator-label');
  const personalTotal = document.getElementById('personal-repos-total');
  const collaboratorTotal = document.getElementById('collaborator-repos-total');
  const personalPublicToggle = document.getElementById('personal-public-toggle');
  const personalPrivateToggle = document.getElementById('personal-private-toggle');
  const collaboratorPublicToggle = document.getElementById('collaborator-public-toggle');
  const collaboratorPrivateToggle = document.getElementById('collaborator-private-toggle');

  if (personalLabel) personalLabel.classList.remove('hidden');
  if (collaboratorLabel) collaboratorLabel.classList.remove('hidden');
  if (personalTotal) personalTotal.classList.remove('hidden');
  if (collaboratorTotal) collaboratorTotal.classList.remove('hidden');
  if (personalPublicToggle) personalPublicToggle.classList.add('hidden');
  if (personalPrivateToggle) personalPrivateToggle.classList.add('hidden');
  if (collaboratorPublicToggle) collaboratorPublicToggle.classList.add('hidden');
  if (collaboratorPrivateToggle) collaboratorPrivateToggle.classList.add('hidden');

  document.querySelectorAll('.repo-toggle-container .active-filter').forEach(el => el.classList.remove('active-filter'));

  if (filter.category === 'personal') {
    const personalSummary = document.getElementById('personal-summary');
    if (personalSummary) {
      personalSummary.classList.add('active-filter');
    }
    if (personalLabel) personalLabel.classList.add('hidden');
    if (personalPublicToggle) personalPublicToggle.classList.remove('hidden');
    if (personalPrivateToggle) personalPrivateToggle.classList.remove('hidden');
    if (filter.visibility === 'public') {
      document.getElementById('personal-public-toggle')?.classList.add('active-filter');
    } else if (filter.visibility === 'private') {
      document.getElementById('personal-private-toggle')?.classList.add('active-filter');
    } else {
      document.getElementById('personal-public-toggle')?.classList.add('active-filter');
      document.getElementById('personal-private-toggle')?.classList.add('active-filter');
    }
  } else if (filter.category === 'collaborator') {
    const collaboratorSummary = document.getElementById('collaborator-summary');
    if (collaboratorSummary) {
      collaboratorSummary.classList.add('active-filter');
    }
    if (collaboratorLabel) collaboratorLabel.classList.add('hidden');
    if (collaboratorPublicToggle) collaboratorPublicToggle.classList.remove('hidden');
    if (collaboratorPrivateToggle) collaboratorPrivateToggle.classList.remove('hidden');
    if (filter.visibility === 'public') {
      document.getElementById('collaborator-public-toggle')?.classList.add('active-filter');
    } else if (filter.visibility === 'private') {
      document.getElementById('collaborator-private-toggle')?.classList.add('active-filter');
    } else {
      document.getElementById('collaborator-public-toggle')?.classList.add('active-filter');
      document.getElementById('collaborator-private-toggle')?.classList.add('active-filter');
    }
  } else {
    const personalSummary = document.getElementById('personal-summary');
    const collaboratorSummary = document.getElementById('collaborator-summary');
    if (personalSummary) personalSummary.classList.remove('active-filter');
    if (collaboratorSummary) collaboratorSummary.classList.remove('active-filter');
  }
}

function setupRepoToggle(
  summaryId: string,
  category: 'personal' | 'collaborator',
  githubStats: GitHubStats
) {
  const summaryElement = document.getElementById(summaryId);
  const publicToggle = document.getElementById(`${category}-public-toggle`);
  const privateToggle = document.getElementById(`${category}-private-toggle`);

  if (summaryElement && publicToggle && privateToggle) {
    summaryElement.addEventListener('click', () => {
      if (currentActiveFilter.category === category && currentActiveFilter.visibility === 'total') {
        updateDisplayedStats(githubStats, { category: 'overall', visibility: 'total' });
      } else {
        updateDisplayedStats(githubStats, { category: category, visibility: 'total' });
      }
    });

    publicToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      if (currentActiveFilter.category === category && currentActiveFilter.visibility === 'public') {
        updateDisplayedStats(githubStats, { category: category, visibility: 'total' });
      } else {
        updateDisplayedStats(githubStats, { category: category, visibility: 'public' });
      }
    });

    privateToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      if (currentActiveFilter.category === category && currentActiveFilter.visibility === 'private') {
        updateDisplayedStats(githubStats, { category: category, visibility: 'total' });
      } else {
        updateDisplayedStats(githubStats, { category: category, visibility: 'private' });
      }
    });
  }
}


function renderGitHubStats(githubStats: GitHubStats) {
  const contentElement = document.getElementById('github-stats-content');
  if (!contentElement) return;

  contentElement.innerHTML = buildStatsContent(GITHUB_USERNAME);
  contentElement.classList.remove('hidden');

  const lastUpdatedElement = document.getElementById('last-updated-time');
  if (lastUpdatedElement) {
    lastUpdatedElement.textContent = `Last updated: ${new Date(githubStats.lastUpdated).toLocaleDateString()}`;
  }

  const animateOnScrollFixed = () => {
    if (isInViewport(contentElement)) {
      initFixedAnimations(githubStats);
      window.removeEventListener('scroll', animateOnScrollFixed);
    }
  };
  if (isInViewport(contentElement)) {
    initFixedAnimations(githubStats);
  } else {
    window.addEventListener('scroll', animateOnScrollFixed);
  }
  
  const languageSection = document.getElementById('language-stats-section');
  if (languageSection) {
    const overallLanguages = githubStats.languages.overall || [];
    languageSection.innerHTML = buildLanguageStatsHtml(overallLanguages);
    
    const langList = document.getElementById('language-stats-list');
    const toggleContainer = document.getElementById('language-toggle-container');

    if (langList && toggleContainer) {
      autoAnimate(langList);
      updateLanguageDisplay(langList, overallLanguages);
      updateLanguageToggle(toggleContainer, langList, overallLanguages);
    }
  }

  updateDisplayedStats(githubStats, { category: 'overall', visibility: 'total' });

  setupRepoToggle('personal-summary', 'personal', githubStats);
  setupRepoToggle('collaborator-summary', 'collaborator', githubStats);
}

export async function initializeGitHubStats(): Promise<void> {
  const loadingElement = document.getElementById('github-stats-loading');
  const contentElement = document.getElementById('github-stats-content');
  
  try {
    const githubStats = await fetchGitHubStats();
    
    if (loadingElement) loadingElement.classList.add('hidden');
    
    renderGitHubStats(githubStats);

  } catch (error) {
    console.error('Error initializing GitHub stats view:', error);
    if (loadingElement) loadingElement.classList.add('hidden');
    
    if (contentElement) {
      contentElement.innerHTML = buildErrorContent(error);
      contentElement.classList.remove('hidden');
    }
  }
}