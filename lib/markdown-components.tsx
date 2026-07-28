import type { Components } from "react-markdown";

/**
 * Shared markdown component configuration for react-markdown.
 * Used across policy pages, technical documentation, and other markdown-rendered content.
 *
 * Provides consistent styling and accessibility for:
 * - Headings (h2, h3, h4)
 * - Paragraphs
 * - Lists (ul, ol)
 * - Links
 * - Code blocks
 * - Strong/bold text
 * - Horizontal rules
 */
export const markdownComponents: Components = {
  h2: ({ children, ...props }) => (
    <h2
      className="mt-8 mb-4 text-2xl font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-6 mb-3 text-xl font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="mt-4 mb-2 text-lg font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p
      className="mb-4 break-words text-sm leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="mb-4 space-y-1.5 pl-0 list-none text-sm text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </ul>
  ),
  li: ({ children, ...props }) => (
    <li className="flex gap-2 items-baseline" {...props}>
      <span
        aria-hidden="true"
        className="font-mono text-[color:var(--v3-accent-text)] shrink-0"
      >
        →
      </span>
      <div className="min-w-0 break-words">{children}</div>
    </li>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="list-decimal marker:text-[color:var(--secondary)] mb-4 space-y-2 pl-5 text-sm text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </ol>
  ),
  hr: () => (
    <hr className="my-8 border-t border-[color:var(--border-subtle)]" />
  ),
  a: ({ children, ...props }) => (
    <a
      className="font-medium text-[color:var(--v3-accent-text)] underline underline-offset-4 hover:opacity-80"
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children, ...props }) => (
    <strong
      className="font-semibold text-[color:var(--text-primary)]"
      {...props}
    >
      {children}
    </strong>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="mb-4 overflow-x-auto rounded-md border border-[color:var(--v3-rule)] bg-[color:var(--code-bg)] p-4 text-[color:var(--code-text)] shadow-none"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }) =>
    className ? (
      <code
        className="bg-transparent p-0 font-mono text-[0.8rem] text-[color:var(--code-text)]"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code
        className="rounded-sm bg-[color:var(--code-bg)] px-1 py-0.5 font-mono text-xs text-[color:var(--code-text)]"
        {...props}
      >
        {children}
      </code>
    ),
};

/**
 * Variant for Home (root /) page sections: maps h3 to h2 with smaller styling
 */
export const aboutPageComponents: Components = {
  ...markdownComponents,
  // Tighten top spacing for section headings within Home page cards
  h2: (props) => (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h2
      className="mb-4 text-2xl font-semibold text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  h3: (props) => (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h2
      className="text-xl font-semibold text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="space-y-1.5 pl-0 list-none text-sm text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  li: ({ children, ...props }) => (
    <li className="flex gap-2 items-baseline" {...props}>
      <span
        className="font-mono text-[color:var(--v3-accent-text)] shrink-0"
        aria-hidden="true"
      >
        →
      </span>
      <div className="min-w-0 break-words">{children}</div>
    </li>
  ),
  ol: (props) => (
    <ol
      className="list-decimal marker:text-[color:var(--secondary)] space-y-3 pl-5 text-sm text-[color:var(--text-primary)]"
      {...props}
    />
  ),
};

/**
 * Variant for Home (root /) intro section: larger typography without card styling
 */
export const introComponents: Components = {
  p: (props) => (
    <p
      className="break-words text-base sm:text-lg leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="space-y-2 pl-0 list-none text-base sm:text-lg leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    />
  ),
  li: ({ children, ...props }) => (
    <li className="flex gap-2 items-baseline" {...props}>
      <span
        className="font-mono text-[color:var(--v3-accent-text)] shrink-0"
        aria-hidden="true"
      >
        →
      </span>
      <div className="min-w-0 break-words">{children}</div>
    </li>
  ),
  ol: (props) => (
    <ol
      className="list-decimal marker:text-[color:var(--secondary)] space-y-2 pl-5 text-base sm:text-lg leading-relaxed text-[color:var(--text-primary)]"
      {...props}
    />
  ),
};
