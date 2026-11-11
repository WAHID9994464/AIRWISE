import React, { useMemo, useRef, useState, useLayoutEffect, useCallback } from 'react';
import katex from 'katex';

interface MathRendererProps {
  math: string;
  block?: boolean;
  className?: string;
}

/**
 * Splits complex or multi-clause formulas into clean, properly aligned multiline LaTeX.
 * Preserves all mathematical equations, symbols, and operators exactly as specified.
 */
function formatFormulaForBlock(math: string): string {
  if (typeof math !== 'string') return '';
  const trimmed = math.trim();

  // If already wrapped in a multiline environment, keep as is
  if (
    trimmed.startsWith('\\begin{gathered}') ||
    trimmed.startsWith('\\begin{aligned}') ||
    trimmed.startsWith('\\begin{align*}') ||
    trimmed.includes('\\begin{cases}')
  ) {
    return trimmed;
  }

  // 1. Specific multi-clause formulas
  // Probability Density Function (PDF) - 3 distinct foundational conditions
  if (trimmed.includes('f(x) \\ge 0') && trimmed.includes('\\int_{-\\infty}^{\\infty} f(x) dx = 1')) {
    return '\\begin{gathered} f(x) \\ge 0 \\\\[4pt] \\int_{-\\infty}^{\\infty} f(x) dx = 1 \\\\[4pt] P(a < X < b) = \\int_a^b f(x) dx \\end{gathered}';
  }

  // Discrete and Continuous RVs
  if (trimmed.includes('\\text{Discrete: }') && trimmed.includes('\\text{Continuous: }')) {
    const parts = trimmed.split(', \\quad ');
    return `\\begin{gathered} ${parts.join(' \\\\[4pt] ')} \\end{gathered}`;
  }

  // Parametric vs Non-Parametric
  if (trimmed.includes('\\quad \\longleftrightarrow \\quad')) {
    const parts = trimmed.split('\\quad \\longleftrightarrow \\quad');
    return `\\begin{gathered} ${parts[0]} \\\\[2pt] \\longleftrightarrow \\\\[2pt] ${parts[1]} \\end{gathered}`;
  }

  // Expectation Properties
  if (trimmed.includes('E[aX + bY] = aE[X] + bE[Y]')) {
    return '\\begin{gathered} E[aX + bY] = aE[X] + bE[Y], \\quad E[c] = c \\\\[4pt] E[XY] = E[X]E[Y] \\text{ (if } X \\perp Y \\text{)} \\end{gathered}';
  }

  // Hypothesis Framework Types of Error
  if (trimmed.includes('\\alpha = P(\\text{Type I error})')) {
    return '\\begin{gathered} \\alpha = P(\\text{Type I error}) = P(\\text{Reject } H_0 \\mid H_0 \\text{ is true}) = P(X \\in S_R) \\\\[4pt] \\beta = P(\\text{Type II error}) = P(X \\in S_A \\mid H_0 \\text{ is false}) \\end{gathered}';
  }

  // DTMC Markov Transition Condition
  if (trimmed.includes('P(X_{n+1} = j \\mid X_n = i, X_{n-1} = i_{n-1}')) {
    return '\\begin{gathered} P(X_{n+1} = j \\mid X_n = i, X_{n-1} = i_{n-1}, \\dots, X_0 = i_0) \\\\[4pt] = P(X_{n+1} = j \\mid X_n = i) = P_{ij} \\end{gathered}';
  }

  // 2. Generic natural mathematical splitters
  // Split on ; \qquad or ;\qquad
  if (trimmed.includes('; \\qquad') || trimmed.includes(';\\qquad')) {
    const parts = trimmed.split(/;\s*\\qquad/);
    return `\\begin{gathered} ${parts.join(' \\\\[4pt] ')} \\end{gathered}`;
  }

  // Split on \quad \text{or} \quad
  if (trimmed.includes('\\quad \\text{or} \\quad')) {
    const parts = trimmed.split('\\quad \\text{or} \\quad');
    return `\\begin{gathered} ${parts[0]} \\\\[4pt] \\text{or} \\quad ${parts[1]} \\end{gathered}`;
  }

  // Split on , \qquad
  if (trimmed.includes(', \\qquad')) {
    const parts = trimmed.split(', \\qquad');
    return `\\begin{gathered} ${parts.join(' \\\\[4pt] ')} \\end{gathered}`;
  }

  // Split on \qquad if sufficiently long (> 35 chars)
  if (trimmed.includes('\\qquad') && trimmed.length > 35) {
    const parts = trimmed.split('\\qquad');
    return `\\begin{gathered} ${parts.map(p => p.trim()).join(' \\\\[4pt] ')} \\end{gathered}`;
  }

  return trimmed;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ math, block = false, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  // Render LaTeX to HTML string safely with KaTeX
  const html = useMemo(() => {
    try {
      const processed = block ? formatFormulaForBlock(math) : math;
      return katex.renderToString(processed, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch (e) {
      return `<code class="text-gold font-mono">${math}</code>`;
    }
  }, [math, block]);

  // Dynamic Auto-scaling algorithm for block mode formulas
  const updateScale = useCallback(() => {
    if (!block || !containerRef.current || !contentRef.current) return;

    // Reset transform to 1 to accurately measure natural unscaled width
    contentRef.current.style.transform = 'none';

    const containerWidth = containerRef.current.clientWidth;
    const contentWidth = contentRef.current.scrollWidth;

    if (containerWidth > 0 && contentWidth > containerWidth) {
      // Scale down so it fits with 12px horizontal padding safety margin
      const padding = 12;
      const targetScale = Math.max(0.6, (containerWidth - padding) / contentWidth);
      setScale(targetScale);
      contentRef.current.style.transform = `scale(${targetScale})`;
    } else {
      setScale(1);
      contentRef.current.style.transform = 'none';
    }
  }, [block]);

  useLayoutEffect(() => {
    if (!block) return;
    updateScale();

    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      const observer = new ResizeObserver(() => {
        updateScale();
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [html, block, updateScale]);

  if (block) {
    return (
      <div
        ref={containerRef}
        className={`w-full max-w-full min-w-0 flex items-center justify-center overflow-hidden py-1 ${className}`}
      >
        <div
          ref={contentRef}
          style={{
            transform: scale < 0.999 ? `scale(${scale})` : undefined,
            transformOrigin: 'center center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'fit-content',
            maxWidth: '100%',
          }}
          className="text-[#D4AF37] transition-transform duration-100 ease-out origin-center font-normal"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  return (
    <span
      className={`inline-block text-[#D4AF37] max-w-full min-w-0 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
