/**
 * Tech Glossary Application
 * Modular JavaScript for loading and displaying technical terms
 * @module glossary
 */

/**
 * @typedef {Object} GlossaryTerm
 * @property {string} id - Unique identifier
 * @property {string} term - The technical term
 * @property {string|null} fullForm - Full form/expansion of acronym
 * @property {string} definition - Detailed definition
 * @property {string} category - Category of the term
 * @property {string[]} relatedTerms - Related terms
 * @property {string[]} examples - Usage examples
 */

/**
 * @typedef {Object} GlossaryData
 * @property {GlossaryTerm[]} terms - Array of glossary terms
 * @property {string[]} categories - Available categories
 */

class TechGlossary {
  /**
   * @param {string} dataUrl - URL to the glossary JSON file
   */
  constructor(dataUrl = './data/glossary.json') {
    this.dataUrl = dataUrl;
    /** @type {GlossaryData|null} */
    this.data = null;
    this.filteredTerms = [];
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.navigationHistory = [];
    
    // DOM element references
    this.elements = {
      container: null,
      searchInput: null,
      categoryFilter: null,
      termCount: null,
      loadingIndicator: null,
      errorContainer: null,
      breadcrumbNav: null,
      breadcrumbItems: null,
      clearHistoryBtn: null
    };
  }

  /**
   * Initialize the glossary application
   */
  async init() {
    try {
      this.cacheElements();
      this.initializeHistory();
      this.attachEventListeners();
      this.showLoading();
      
      await this.loadData();
      this.renderCategoryFilters();
      this.filterAndRender();
      this.renderBreadcrumb();
      
      this.hideLoading();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Cache DOM element references
   */
  cacheElements() {
    this.elements = {
      container: document.getElementById('glossary-container'),
      searchInput: document.getElementById('search-input'),
      categoryFilter: document.getElementById('category-filter'),
      termCount: document.getElementById('term-count'),
      loadingIndicator: document.getElementById('loading'),
      errorContainer: document.getElementById('error'),
      breadcrumbNav: document.getElementById('breadcrumb-nav'),
      breadcrumbItems: document.getElementById('breadcrumb-items'),
      clearHistoryBtn: document.getElementById('clear-history')
    };
  }

  /**
   * Initialize navigation history from sessionStorage
   */
  initializeHistory() {
    try {
      const stored = sessionStorage.getItem('glossary-navigation-history');
      if (stored) {
        this.navigationHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load navigation history:', error);
      this.navigationHistory = [];
    }
  }

  /**
   * Save navigation history to sessionStorage
   */
  saveHistory() {
    try {
      sessionStorage.setItem('glossary-navigation-history', JSON.stringify(this.navigationHistory));
    } catch (error) {
      console.warn('Failed to save navigation history:', error);
    }
  }

  /**
   * Add term to navigation history
   * @param {string} termId
   */
  addToHistory(termId) {
    // Avoid duplicate consecutive entries
    if (this.navigationHistory.length > 0 && 
        this.navigationHistory[this.navigationHistory.length - 1] === termId) {
      return;
    }
    
    this.navigationHistory.push(termId);
    this.saveHistory();
    this.renderBreadcrumb();
  }

  /**
   * Clear navigation history
   */
  clearHistory() {
    this.navigationHistory = [];
    this.saveHistory();
    this.renderBreadcrumb();
  }

  /**
   * Navigate to a specific term
   * @param {string} termId - The ID of the term to navigate to
   * @param {boolean} fromBreadcrumb - Whether navigation is from breadcrumb click
   */
  navigateToTerm(termId, fromBreadcrumb = false) {
    if (!this.data) return;

    const term = this.data.terms.find(t => t.id === termId);
    if (!term) {
      console.warn(`Term with ID "${termId}" not found`);
      return;
    }

    // Handle breadcrumb navigation (remove terms after clicked item)
    if (fromBreadcrumb) {
      const index = this.navigationHistory.indexOf(termId);
      if (index !== -1) {
        this.navigationHistory = this.navigationHistory.slice(0, index + 1);
        this.saveHistory();
      }
    } else {
      // Add to history for regular navigation
      this.addToHistory(termId);
    }

    // Clear search and reset to 'all' category to ensure term is visible
    this.searchQuery = '';
    this.currentCategory = 'all';
    if (this.elements.searchInput) {
      this.elements.searchInput.value = '';
    }
    
    // Update category filter buttons
    this.updateActiveFilterButton();
    
    // Re-render the terms
    this.filterAndRender();
    
    // Update breadcrumb
    this.renderBreadcrumb();
    
    // Scroll to the term with highlight effect
    this.scrollToTerm(termId);
  }

  /**
   * Scroll to a specific term and highlight it
   * @param {string} termId
   */
  scrollToTerm(termId) {
    // Wait for DOM to update
    setTimeout(() => {
      const targetCard = document.querySelector(`[data-term-id="${termId}"]`);
      if (targetCard) {
        // Smooth scroll to the card
        targetCard.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Add highlight effect
        targetCard.classList.add('highlight-target');
        
        // Remove highlight after animation
        setTimeout(() => {
          targetCard.classList.remove('highlight-target');
        }, 1500);
      }
    }, 100);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (this.elements.searchInput) {
      this.elements.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.filterAndRender();
      });
    }

    // Category filter click handlers are attached in renderCategoryFilters()

    if (this.elements.clearHistoryBtn) {
      this.elements.clearHistoryBtn.addEventListener('click', () => {
        this.clearHistory();
      });
    }
  }

  /**
   * Load glossary data from JSON file
   * @returns {Promise<void>}
   */
  async loadData() {
    try {
      const response = await fetch(this.dataUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.data = await response.json();
      
      if (!this.data.terms || !Array.isArray(this.data.terms)) {
        throw new Error('Invalid data format: terms array not found');
      }
      
      // Sort terms alphabetically
      this.data.terms.sort((a, b) => a.term.localeCompare(b.term));
      
    } catch (error) {
      throw new Error(`Failed to load glossary data: ${error.message}`);
    }
  }

  /**
   * Render category filter buttons
   */
  renderCategoryFilters() {
    if (!this.elements.categoryFilter || !this.data) return;

    const categories = ['all', ...this.data.categories];
    
    this.elements.categoryFilter.innerHTML = categories.map(category => `
      <button 
        class="px-4 py-2 rounded-lg font-medium transition-all duration-200
               ${category === 'all' 
                 ? 'bg-blue-600 text-white shadow-md' 
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        data-category="${category}"
      >
        ${category === 'all' ? 'All' : category}
      </button>
    `).join('');

    // Add click handlers to filter buttons
    this.elements.categoryFilter.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        this.currentCategory = e.target.dataset.category;
        this.updateActiveFilterButton();
        this.filterAndRender();
      }
    });
  }

  /**
   * Update active state of filter buttons
   */
  updateActiveFilterButton() {
    if (!this.elements.categoryFilter) return;

    const buttons = this.elements.categoryFilter.querySelectorAll('button');
    buttons.forEach(btn => {
      const isActive = btn.dataset.category === this.currentCategory;
      btn.className = `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`;
    });
  }

  /**
   * Filter terms based on search query and category
   * @returns {GlossaryTerm[]}
   */
  filterTerms() {
    if (!this.data) return [];

    let filtered = this.data.terms;

    // Filter by category
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(term => term.category === this.currentCategory);
    }

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(term => 
        term.term.toLowerCase().includes(this.searchQuery) ||
        term.definition.toLowerCase().includes(this.searchQuery) ||
        (term.fullForm && term.fullForm.toLowerCase().includes(this.searchQuery))
      );
    }

    return filtered;
  }

  /**
   * Filter and render glossary terms
   */
  filterAndRender() {
    this.filteredTerms = this.filterTerms();
    this.renderTerms();
    this.updateTermCount();
  }

  /**
   * Render glossary terms to the DOM
   */
  renderTerms() {
    if (!this.elements.container) return;

    if (this.filteredTerms.length === 0) {
      this.elements.container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No terms found</h3>
          <p class="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      `;
      return;
    }

    this.elements.container.innerHTML = this.filteredTerms.map(term => 
      this.renderTermCard(term)
    ).join('');

    // Attach click handlers to related terms
    this.attachRelatedTermHandlers();
  }

  /**
   * Attach click handlers to related term links
   */
  attachRelatedTermHandlers() {
    const relatedTermElements = document.querySelectorAll('.related-term-exists');
    
    relatedTermElements.forEach(element => {
      // Handle click
      element.addEventListener('click', () => {
        const termId = element.dataset.termId;
        if (termId) {
          this.navigateToTerm(termId, false);
        }
      });

      // Handle keyboard navigation (Enter/Space)
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const termId = element.dataset.termId;
          if (termId) {
            this.navigateToTerm(termId, false);
          }
        }
      });
    });
  }

  /**
   * Check if a term exists in the glossary by name
   * @param {string} termName
   * @returns {string|null} Term ID if found, null otherwise
   */
  findTermIdByName(termName) {
    if (!this.data) return null;
    
    const term = this.data.terms.find(t => 
      t.term.toLowerCase() === termName.toLowerCase()
    );
    return term ? term.id : null;
  }

  /**
   * Render a single term card
   * @param {GlossaryTerm} term
   * @returns {string} HTML string
   */
  renderTermCard(term) {
    return `
      <article 
        class="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100"
        data-term-id="${term.id}"
      >
        <header class="mb-4">
          <div class="flex items-start justify-between mb-2">
            <h2 class="text-2xl font-bold text-gray-900">${this.escapeHtml(term.term)}</h2>
            <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              ${this.escapeHtml(term.category)}
            </span>
          </div>
          ${term.fullForm ? `
            <p class="text-sm text-gray-600 italic">
              ${this.escapeHtml(term.fullForm)}
            </p>
          ` : ''}
        </header>

        <div class="mb-4">
          <p class="text-gray-700 leading-relaxed">
            ${this.escapeHtml(term.definition)}
          </p>
        </div>

        ${term.examples && term.examples.length > 0 ? `
          <div class="mb-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-2">Examples:</h3>
            <ul class="list-disc list-inside space-y-1">
              ${term.examples.map(example => `
                <li class="text-sm text-gray-600">${this.escapeHtml(example)}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${term.relatedTerms && term.relatedTerms.length > 0 ? `
          <div class="pt-4 border-t border-gray-200">
            <h3 class="text-sm font-semibold text-gray-900 mb-2">Related Terms:</h3>
            <div class="flex flex-wrap gap-2">
              ${term.relatedTerms.map(related => {
                const relatedTermId = this.findTermIdByName(related);
                const isClickable = relatedTermId !== null;
                
                return `
                  <span 
                    class="${isClickable ? 'related-term-exists' : 'related-term-missing'}"
                    ${isClickable ? `data-term-id="${relatedTermId}" role="button" tabindex="0" aria-label="Navigate to ${this.escapeHtml(related)}"` : 'aria-label="External reference"'}
                  >
                    ${this.escapeHtml(related)}
                  </span>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </article>
    `;
  }

  /**
   * Render breadcrumb navigation
   */
  renderBreadcrumb() {
    if (!this.elements.breadcrumbNav || !this.elements.breadcrumbItems) return;

    // Hide breadcrumb if history is empty
    if (this.navigationHistory.length === 0) {
      this.elements.breadcrumbNav.classList.add('hidden');
      return;
    }

    // Show breadcrumb
    this.elements.breadcrumbNav.classList.remove('hidden');

    // Get term details for each ID in history
    const breadcrumbTerms = this.navigationHistory
      .map(termId => {
        if (!this.data) return null;
        return this.data.terms.find(t => t.id === termId);
      })
      .filter(term => term !== null);

    // Render breadcrumb items
    this.elements.breadcrumbItems.innerHTML = breadcrumbTerms.map((term, index) => {
      const isLast = index === breadcrumbTerms.length - 1;
      
      if (isLast) {
        return `
          <span class="breadcrumb-current">
            ${this.escapeHtml(term.term)}
          </span>
        `;
      } else {
        return `
          <span class="breadcrumb-item">
            <a 
              href="#" 
              class="breadcrumb-link" 
              data-term-id="${term.id}"
              aria-label="Navigate back to ${this.escapeHtml(term.term)}"
            >
              ${this.escapeHtml(term.term)}
            </a>
            <span class="breadcrumb-separator" aria-hidden="true">→</span>
          </span>
        `;
      }
    }).join('');

    // Add click handlers to breadcrumb links
    const breadcrumbLinks = this.elements.breadcrumbItems.querySelectorAll('.breadcrumb-link');
    breadcrumbLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const termId = link.dataset.termId;
        if (termId) {
          this.navigateToTerm(termId, true);
        }
      });
    });
  }

  /**
   * Update the term count display
   */
  updateTermCount() {
    if (!this.elements.termCount) return;

    const total = this.data ? this.data.terms.length : 0;
    const filtered = this.filteredTerms.length;

    this.elements.termCount.textContent = 
      filtered === total 
        ? `${total} ${total === 1 ? 'term' : 'terms'}` 
        : `${filtered} of ${total} ${total === 1 ? 'term' : 'terms'}`;
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.classList.remove('hidden');
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.classList.add('hidden');
    }
  }

  /**
   * Handle errors
   * @param {Error} error
   */
  handleError(error) {
    console.error('Glossary Error:', error);
    
    this.hideLoading();
    
    if (this.elements.errorContainer) {
      this.elements.errorContainer.innerHTML = `
        <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div class="flex items-start">
            <svg class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-red-800 mb-1">Error Loading Glossary</h3>
              <p class="text-sm text-red-700">${this.escapeHtml(error.message)}</p>
              <button 
                onclick="location.reload()" 
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      `;
      this.elements.errorContainer.classList.remove('hidden');
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const glossary = new TechGlossary();
  glossary.init();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TechGlossary;
}

