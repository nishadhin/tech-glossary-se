import { describe, it, expect, beforeEach } from 'vitest';
import TechGlossary from '../glossary.js';

describe('TechGlossary - filterTerms()', () => {
  let glossary;

  beforeEach(() => {
    glossary = new TechGlossary();
    
    // Mock glossary data for testing
    glossary.data = {
      terms: [
        {
          id: 'api',
          term: 'API',
          fullForm: 'Application Programming Interface',
          definition: 'A set of protocols for building software applications',
          category: 'Architecture',
          relatedTerms: ['REST', 'GraphQL'],
          examples: ['REST API', 'GraphQL API']
        },
        {
          id: 'ci-cd',
          term: 'CI/CD',
          fullForm: 'Continuous Integration/Continuous Deployment',
          definition: 'Automated software development practices',
          category: 'DevOps',
          relatedTerms: ['Jenkins', 'GitHub Actions'],
          examples: ['Automated testing', 'Automated deployment']
        },
        {
          id: 'docker',
          term: 'Docker',
          fullForm: null,
          definition: 'A platform for developing, shipping, and running applications in containers',
          category: 'DevOps',
          relatedTerms: ['Kubernetes', 'Container'],
          examples: ['Docker Compose', 'Dockerfile']
        },
        {
          id: 'rest',
          term: 'REST',
          fullForm: 'Representational State Transfer',
          definition: 'An architectural style for distributed systems',
          category: 'Architecture',
          relatedTerms: ['API', 'HTTP'],
          examples: ['RESTful API', 'REST endpoints']
        }
      ],
      categories: ['Architecture', 'DevOps', 'Security']
    };
  });

  it('should return all terms when no filters are applied', () => {
    glossary.currentCategory = 'all';
    glossary.searchQuery = '';

    const result = glossary.filterTerms();

    expect(result).toHaveLength(4);
    expect(result.map(t => t.id)).toEqual(['api', 'ci-cd', 'docker', 'rest']);
  });

  it('should filter terms by category', () => {
    glossary.currentCategory = 'DevOps';
    glossary.searchQuery = '';

    const result = glossary.filterTerms();

    expect(result).toHaveLength(2);
    expect(result.map(t => t.id)).toEqual(['ci-cd', 'docker']);
    expect(result.every(term => term.category === 'DevOps')).toBe(true);
  });

  it('should filter terms by search query matching term name', () => {
    glossary.currentCategory = 'all';
    glossary.searchQuery = 'docker';

    const result = glossary.filterTerms();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('docker');
  });

  it('should filter by both category and search query', () => {
    glossary.currentCategory = 'Architecture';
    glossary.searchQuery = 'api';

    const result = glossary.filterTerms();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('api');
    expect(result[0].category).toBe('Architecture');
  });

  it('should perform case-insensitive search across term, definition, and fullForm', () => {
    glossary.currentCategory = 'all';
    glossary.searchQuery = 'continuous'; // searchQuery is stored as lowercase

    const result = glossary.filterTerms();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('ci-cd');
    expect(result[0].fullForm.toLowerCase()).toContain('continuous');
  });
});

