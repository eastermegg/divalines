/**
 * Official brand marks (stored raw in public/logos/). Inlined here with
 * fill="currentColor" so they inherit the surrounding text color — the
 * source SVGs are pure white; our brand tone is cream (--color-cream).
 *
 *  Symbol   — the ✦ eight-point sparkle
 *  Monogram — the "D" + sparkle lockup
 *  Wordmark — the full "Diva lines" script
 */

type MarkProps = React.SVGProps<SVGSVGElement> & { title?: string };

/**
 * Full "Diva lines" wordmark. Its path is large (13 KB), so rather than
 * inline it we render the stored SVG as a CSS mask over a currentColor
 * fill — keeps the DOM light and still lets it inherit the text color.
 */
export function Wordmark({
  className = "",
  title = "Diva Lines",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <span
      role="img"
      aria-label={title}
      className={`inline-block bg-current ${className}`}
      style={{
        aspectRatio: "576 / 120",
        WebkitMaskImage: "url(/logos/wordmark.svg)",
        maskImage: "url(/logos/wordmark.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

export function Symbol({ title, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 200 142"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M130.534 53.4355H200L122.901 88.5498L108.855 141.985L75.5723 109.16L0 141.985L54.1982 88.5498L19.8477 53.4355H88.4316L142.748 0L130.534 53.4355Z" />
    </svg>
  );
}

export function Monogram({ title, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 249 151"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M95.0059 0.000976562C121.646 1.32286 135.669 11.9656 142.31 24.5938C148.928 37.1799 148.157 51.635 145.427 60.5283C144.935 62.1307 144.411 63.6859 143.856 65.1953H180.474L213.53 32.6758L206.097 65.1953H248.373L201.451 86.5664L192.902 119.087L172.647 99.1094L126.654 119.087L159.639 86.5664L142.383 68.9258C133.825 89.2077 119.485 100.547 104.418 106.857C95.298 110.677 85.9158 112.651 77.3975 113.662L71.2754 132.714L70.3301 135.604H107.468C109.749 135.604 112.204 135.571 114.787 135.473C121.639 135.467 133.903 135.272 146.46 130.502L154.873 142.643C138.672 149.468 121.034 150.164 107.161 150.329C93.1004 150.497 78.7791 150.497 67.9746 150.455C62.5726 150.434 58.0481 150.403 54.875 150.377C53.2889 150.364 52.0397 150.351 51.1875 150.343C50.7617 150.339 50.4343 150.335 50.2139 150.333C50.104 150.332 50.0199 150.331 49.9639 150.33C49.9362 150.33 49.9145 150.33 49.9004 150.33C49.8939 150.33 49.8883 150.329 49.8848 150.329H49.8789L49.1963 150.321L60.8682 114.672C59.8601 114.684 58.8898 114.692 57.9609 114.692H0L37.4375 0.344727L37.5498 0H94.9932L95.0059 0.000976562ZM21.1357 99.9668H58.2734C60.5944 99.9668 63.0947 99.9326 65.7266 99.8301L86.6318 35.9814L86.7441 35.6367H102.474L82.3906 98.125C88.1118 97.1114 93.9719 95.5605 99.624 93.1934C113.231 87.4945 125.96 76.9967 132.443 55.8789C134.327 49.7448 134.717 39.5251 130.394 31.3027C126.776 24.4237 118.282 15.9258 95.751 14.7266H49.043L21.1357 99.9668Z"
      />
    </svg>
  );
}
