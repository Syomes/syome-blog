interface CategoryBreakdown<T> {
  public: T;
  private: T;
  total: T;
}

export interface Language {
  name: string;
  percentage: number;
}

export interface GitHubStats {
  contributions: number;
  pullRequests: {
    personal: CategoryBreakdown<number>;
    collaborator: CategoryBreakdown<number>;
    overall: number;
  };
  issues: {
    personal: CategoryBreakdown<number>;
    collaborator: CategoryBreakdown<number>;
    overall: number;
  };

  repositories: {
    personal: CategoryBreakdown<number>;
    collaborator: CategoryBreakdown<number>;
    overall: number;
  };

  stars: {
    personal: CategoryBreakdown<number>;
    collaborator: CategoryBreakdown<number>;
    overall: number;
  };

  languages: {
    personal: CategoryBreakdown<Language[]>;
    collaborator: CategoryBreakdown<Language[]>;
    overall: Language[];
  };

  lastUpdated: string;
}