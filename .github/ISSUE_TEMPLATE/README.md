# Issue Templates

This repository uses GitHub issue templates to streamline bug reports, feature requests, and documentation improvements.

## Available Templates

### Bug Report (`bug_report.yml`)

Use this template to report functional issues, errors, or unexpected behavior.

**Fields:**

- **Bug Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Browser**: Browser(s) where the issue occurs
- **Device Type**: Desktop, mobile, or tablet
- **Screenshots/Console Errors**: Visual evidence or error messages
- **Additional Context**: Any other relevant details

**Automatically labeled**: `bug`

### Feature Request (`feature_request.yml`)

Use this template to suggest new features or enhancements.

**Fields:**

- **Problem or Use Case**: The need this feature addresses
- **Proposed Solution**: Description of the desired feature
- **Alternatives Considered**: Other solutions evaluated
- **Feature Category**: UI/UX, Accessibility, Performance, SEO, Content, Developer Experience, or Other
- **Priority**: Low, Medium, or High importance
- **Mockups or Examples**: Visual aids or reference examples
- **Additional Context**: Any other considerations

**Automatically labeled**: `enhancement`

**Important**: Feature requests should align with the project's purpose as a personal portfolio/CV site and consider accessibility implications.

### Documentation Issue (`documentation.yml`)

Use this template to report documentation issues or suggest improvements.

**Fields:**

- **Documentation Type**: README, Engineering Standards, Architecture, API, Component, Testing, Deployment/CI, or Other
- **Issue Description**: What's wrong, missing, or unclear
- **Location**: File path or URL of the documentation
- **Suggested Improvement**: How to improve the documentation
- **Severity**: Low (typo), Medium (missing info), or High (incorrect info)
- **Additional Context**: Any other relevant details

**Automatically labeled**: `documentation`

## Configuration

Issue templates are configured in `.github/ISSUE_TEMPLATE/`:

- `bug_report.yml` - Bug report template
- `feature_request.yml` - Feature request template
- `documentation.yml` - Documentation issue template
- `config.yml` - Template configuration

### Template Configuration (`config.yml`)

The `config.yml` file:

- Disables blank issues (requires template selection)
- Provides contact links for:
  - **Security Vulnerabilities**: Directs to GitHub Security Advisories for private reporting
  - **Questions/Discussions**: Directs to GitHub Discussions for general inquiries

## Labels

Issue templates automatically apply labels that are managed in `.github/labels.yml`:

- `bug` - Something isn't working (red)
- `enhancement` - New feature or request (light blue)
- `documentation` - Documentation improvements (blue)

These labels are also used by:

- Release Drafter for changelog categorization
- CI/CD workflows for automation
- Project management and triage

## Best Practices

### For Issue Reporters

1. **Search First**: Check existing issues before creating a new one
2. **Use Appropriate Template**: Select the template that matches your issue type
3. **Provide Detail**: Complete all required fields thoroughly
4. **Include Evidence**: Add screenshots, console errors, or examples when applicable
5. **Consider Impact**: Note accessibility, performance, or SEO implications where relevant

### For Issue Triagers

1. **Verify Labels**: Ensure correct labels are applied (auto-applied by templates)
2. **Add Context**: Link related issues, PRs, or documentation
3. **Set Priority**: Add `major`, `minor`, or `patch` labels for version planning
4. **Close Duplicates**: Link to existing issues and close duplicates
5. **Update Status**: Keep issues current with progress updates

## Security Issues

**Do not use issue templates for security vulnerabilities!**

Security issues should be reported privately through:

- GitHub Security Advisories: https://github.com/vicenteopaso/vicenteopaso-sdd/security/advisories/new

See [Security Policy](../docs/SECURITY_POLICY.md) for details.

## Relationship to Pull Requests

Issues and PRs work together:

1. **Issue First** (recommended): Open an issue to discuss the problem/feature
2. **Reference in PR**: Link the issue in your PR description (e.g., "Fixes #123")
3. **Automatic Closure**: Issues close automatically when linked PRs merge

Small fixes (typos, minor bugs) can go directly to PRs without an issue.

Note: PRs should align with the SDD (`/sdd.yaml`). If a change affects architecture or cross-cutting behavior, update the SDD and relevant docs alongside the implementation.

## Integration with CI/CD

Issue labels integrate with:

- **Release Drafter**: Categorizes changes in release notes
- **Auto-merge**: PRs can reference issues for context
- **Changelog**: Issues provide structured history

## Updating Templates

To modify templates:

1. Edit files in `.github/ISSUE_TEMPLATE/`
2. Test changes on a branch by opening a test issue
3. Update this documentation if fields or process change
4. Merge via PR with `documentation` label

## Related Documentation

- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Pull Request Template](../PULL_REQUEST_TEMPLATE.md) - PR workflow
- [Labels Configuration](labels.yml) - Label definitions
- [Engineering Constitution](../docs/CONSTITUTION.md) - Repository governance

## Last Updated

December 2, 2025
