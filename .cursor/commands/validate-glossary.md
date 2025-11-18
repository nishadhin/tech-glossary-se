# validate-glossary

When I invoke /validate-glossary on the glossary.json file or selected glossary data:

1. **Structural Validation**
   - Verify all terms have required fields: id, term, definition, category
   - Check that ids are unique and follow kebab-case convention
   - Ensure categories referenced by terms exist in the categories array
   - Validate that relatedTerms reference actual terms in the glossary

2. **Quality Checks**
   - Flag short definitions (< 50 characters) that may need expansion
   - Identify terms missing examples or related terms
   - Check for potential duplicates (similar term names or definitions)
   - Ensure fullForm is null or a non-empty string (no empty strings)

3. **Consistency Checks**
   - Verify consistent field ordering across all entries
   - Check for unused categories (in categories array but no terms use them)
   - Identify orphaned related terms (referenced but don't exist)
   - Validate JSON structure and formatting

4. **Output Format**
   - Report validation results in a structured markdown table
   - Group issues by severity: ERROR, WARNING, INFO
   - Provide actionable suggestions for each issue
   - Include summary statistics (total terms, categories, avg definition length)

5. **Do not modify the file** - only analyze and report findings

This command will be available in chat with /validate-glossary