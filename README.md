# Tech Glossary for Software Engineers

A modern, dynamic glossary of technical terms built with vanilla JavaScript, semantic HTML, and Tailwind CSS. This project provides a clean, searchable interface for browsing technical terminology commonly used in software engineering.

## Features

- 📚 **Dynamic Loading**: Terms loaded from JSON file at runtime
- 🔍 **Real-time Search**: Instant filtering as you type
- 🏷️ **Category Filters**: Filter terms by technology category
- 📱 **Responsive Design**: Beautiful UI across all devices
- ♿ **Accessible**: Built with semantic HTML and ARIA labels
- 🎨 **Modern UI**: Styled with Tailwind CSS + custom animations
- 🚀 **Production-Ready**: Modular, well-documented code with error handling

## Project Structure

```
tech-glossary-se/
├── index.html          # Main HTML file with semantic markup
├── styles.css          # Custom CSS styles and animations
├── glossary.js         # Core application logic (modular ES6+)
├── data/
│   └── glossary.json   # Glossary terms data
└── README.md           # This file
```

## Quick Start

### Option 1: Simple File Server

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (npx)
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: Open Directly

You can also open `index.html` directly in your browser, but note that some browsers may restrict local file access due to CORS policies.

## Architecture

### Data Structure

The glossary data is stored in `data/glossary.json`:

```json
{
  "terms": [
    {
      "id": "unique-id",
      "term": "API",
      "fullForm": "Application Programming Interface",
      "definition": "Description...",
      "category": "Architecture",
      "relatedTerms": ["REST", "GraphQL"],
      "examples": ["Example 1", "Example 2"]
    }
  ],
  "categories": ["Architecture", "DevOps", "Security"]
}
```

### JavaScript Module

The `TechGlossary` class provides:
- **Data Loading**: Async fetch with error handling
- **Filtering**: Search and category-based filtering
- **Rendering**: Dynamic DOM manipulation
- **State Management**: Current filters and search state
- **Error Handling**: User-friendly error messages

### Key Methods

- `init()`: Initialize the application
- `loadData()`: Fetch glossary data from JSON
- `filterTerms()`: Apply search and category filters
- `renderTerms()`: Render filtered terms to DOM
- `handleError()`: Display user-friendly error messages

## Customization

### Adding New Terms

Edit `data/glossary.json` and add a new term object:

```json
{
  "id": "new-term",
  "term": "New Term",
  "fullForm": "Full Form (optional)",
  "definition": "Your definition here",
  "category": "CategoryName",
  "relatedTerms": ["Term1", "Term2"],
  "examples": ["Example usage"]
}
```

### Adding New Categories

1. Add the category to the `categories` array in `glossary.json`
2. Assign terms to the new category

### Styling

- **Tailwind CSS**: Modify utility classes in `index.html`
- **Custom CSS**: Edit `styles.css` for:
  - Animations
  - Color scheme (CSS variables)
  - Responsive breakpoints
  - Dark mode (optional)

### Configuration

Modify the `TechGlossary` constructor in `glossary.js`:

```javascript
// Change data source
const glossary = new TechGlossary('./path/to/your/data.json');
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Requires ES6+ support (async/await, classes, arrow functions).

## Accessibility Features

- Semantic HTML5 elements (`<header>`, `<main>`, `<article>`, `<nav>`)
- ARIA labels and live regions
- Keyboard navigation support
- Skip-to-content link
- Screen reader friendly
- Focus indicators
- Proper heading hierarchy

## Performance Considerations

- Lightweight (~15KB total code)
- No build step required
- Minimal dependencies (Tailwind via CDN)
- Efficient DOM updates
- Staggered animations for smooth UX

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing.

### Setup

Install test dependencies:

```bash
npm install
```

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite covers the `filterTerms()` method with various scenarios:
- ✅ No filters applied (returns all terms)
- ✅ Category filtering (e.g., DevOps only)
- ✅ Search query filtering (term name, definition, fullForm)
- ✅ Combined category + search filtering
- ✅ Case-insensitive search

Tests are located in `glossary.test.js`.

## Manual Testing

### Manual Testing Checklist

- [ ] Search functionality works
- [ ] Category filters work correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Error handling displays properly
- [ ] Loading state shows during data fetch
- [ ] Related terms are clickable
- [ ] Empty state displays when no results

### Testing Locally

1. Test with valid JSON data
2. Test with malformed JSON (should show error)
3. Test with missing data file (should show error)
4. Test search with various queries
5. Test all category filters

## Deployment

### GitHub Pages

1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select main branch as source
4. Access at `https://username.github.io/repo-name/`

### Netlify

1. Drag and drop project folder to Netlify
2. Or connect GitHub repository
3. Deploy automatically

### Vercel

```bash
npm i -g vercel
vercel
```

## Future Enhancements

Potential features to add:

- [ ] Dark mode toggle
- [ ] Export glossary as PDF
- [ ] Bookmarking favorite terms
- [ ] Share individual terms
- [ ] Multi-language support
- [ ] Voice search
- [ ] Related terms linking/navigation
- [ ] Term usage statistics
- [ ] Admin panel for term management
- [ ] Backend API integration

## Contributing

To contribute new terms or improvements:

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

Built with:
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3

---

**Note**: This is a static site with no backend. All data is loaded from the JSON file at runtime. For production use with many terms, consider:
- Adding pagination
- Implementing lazy loading
- Using a search index (like Fuse.js)
- Adding backend API for dynamic updates

